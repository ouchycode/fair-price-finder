"""
Inference Module
Prediksi harga freelance menggunakan TensorFlow model
"""


import numpy as np
import pickle
import json
from pathlib import Path
import tensorflow as tf
layers = tf.keras.layers
from typing import Optional


class ResidualDenseBlock(layers.Layer):
    """Custom layer untuk neural network."""

    def __init__(self, units, dropout_rate=0.2, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.dropout_rate = dropout_rate

    def build(self, input_shape):
        self.dense1 = layers.Dense(self.units, activation='relu')
        self.dropout = layers.Dropout(self.dropout_rate)
        self.dense2 = layers.Dense(input_shape[-1])
        self.layer_norm = layers.LayerNormalization()
        super().build(input_shape)

    def call(self, inputs, training=False):
        x = self.dense1(inputs)
        x = self.dropout(x, training=training)
        x = self.dense2(x)
        return self.layer_norm(inputs + x)

    def get_config(self):
        config = super().get_config()
        config.update({'units': self.units, 'dropout_rate': self.dropout_rate})
        return config


class InferenceService:
    def normalize_skills(self, skills: Optional[list]) -> list:
        return normalize_skills(skills)

    def predict_price_simple(
        self,
        skills: list,
        durasi_hari: int,
        range_margin: float = 0.20,
        kategori: Optional[str] = None,
    ) -> dict:
        return predict_price_simple(
            skills=skills,
            durasi_hari=durasi_hari,
            range_margin=range_margin,
            kategori=kategori,
        )

    def get_valid_skills(self) -> list:
        return get_valid_skills()

    def get_valid_categories(self) -> list:
        return get_valid_categories()

    def get_model_status(self) -> dict:
        return get_model_status()

DATA_DIR    = Path(__file__).parent / "data"
MODELS_DIR  = DATA_DIR / "models"
PREPARED_DIR = DATA_DIR / "prepared"

MODEL_PATH          = MODELS_DIR / 'freelance_pricer_final.keras'
SAVEDMODEL_PATH     = MODELS_DIR / 'freelance_pricer_savedmodel'
SCALER_PATH         = PREPARED_DIR / 'scaler.pkl'
FEATURE_NAMES_PATH  = PREPARED_DIR / 'feature_names.pkl'
METADATA_PATH       = MODELS_DIR / 'model_metadata.json'

try:
    try:
        model = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={'ResidualDenseBlock': ResidualDenseBlock}
        )
        print("Model format: .keras")
    except Exception:
        print("Fallback ke SavedModel format...")
        model = tf.saved_model.load(str(SAVEDMODEL_PATH))
        _infer = model.signatures['serving_default']
        class _SavedModelWrapper:
            name = 'freelance_pricer_savedmodel'
            def predict(self, X, verbose=0):
                input_tensor = tf.constant(X, dtype=tf.float32)
                output = _infer(features=input_tensor)
                key = list(output.keys())[0]
                return output[key].numpy()
        model = _SavedModelWrapper()
        print("Model format: SavedModel")

    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)

    with open(FEATURE_NAMES_PATH, 'rb') as f:
        feature_names = pickle.load(f)

    if METADATA_PATH.exists():
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    else:
        raise FileNotFoundError(f'Metadata tidak ditemukan: {METADATA_PATH}')

    IDR_MIN = metadata['clipping_bounds']['idr_p01']
    IDR_MAX = metadata['clipping_bounds']['idr_p99']

    MODEL_LOADED = True
    print("Model loaded successfully")
    print(f"  Name: {model.name}")
    print(f"  Features: {len(feature_names)}")
    print(f"  IDR range: Rp {IDR_MIN:,} - Rp {IDR_MAX:,}")

except Exception as e:
    print(f"Error loading model: {e}")
    MODEL_LOADED = False
    model = None
    scaler = None
    feature_names = None
    IDR_MIN = None
    IDR_MAX = None


def normalize_skills(skills: Optional[list]) -> list:
    """Normalize skill input."""
    if not skills:
        return []

    normalized = []
    for skill in skills:
        if skill is None:
            continue
        value = str(skill).strip()
        if value:
            normalized.append(value)
    return normalized


def round_to_nearest_100k(price: float) -> int:
    import math
    return int(math.floor(price / 100000.0 + 0.5) * 100000)

def predict_price(user_input: dict, range_margin: float = 0.20) -> dict:
    """Predict harga freelance project."""
    if not MODEL_LOADED:
        raise RuntimeError("Model tidak berhasil di-load")

    skills = normalize_skills(user_input.get('skills', []))
    kategori = user_input.get('kategori') or user_input.get('category')
    durasi_hari = user_input.get('durasi_hari', 7)

    features = {col: 0 for col in feature_names}

    kat_col = f'kategori_{kategori}'
    if kat_col in features:
        features[kat_col] = 1

    features['durasi_hari'] = durasi_hari

    for skill in skills:
        skill_col = 'skill_' + skill.replace(' ', '_').replace('.', '').replace('/', '_')
        if skill_col in features:
            features[skill_col] = 1

    X = np.array([[features[col] for col in feature_names]])

    X_scaled = scaler.transform(X)
    pred_idr = model.predict(X_scaled, verbose=0)[0][0]

    pred_idr_clipped = np.clip(pred_idr, IDR_MIN, IDR_MAX)

    FAIR_PRICE_MULTIPLIER = 4.0
    adjusted_price = pred_idr_clipped * FAIR_PRICE_MULTIPLIER

    price_min = adjusted_price * (1 - range_margin)
    price_max = adjusted_price * (1 + range_margin)
    
    # Pembulatan ke 100.000 terdekat (0.5 ke atas, < 0.5 ke bawah)
    adjusted_price_rounded = round_to_nearest_100k(adjusted_price)
    price_min_rounded = round_to_nearest_100k(price_min)
    price_max_rounded = round_to_nearest_100k(price_max)

    return {
        'predicted_price': adjusted_price_rounded,
        'price_min': price_min_rounded,
        'price_max': price_max_rounded,
        'min_price': price_min_rounded,
        'max_price': price_max_rounded,
        'median_price': adjusted_price_rounded,
        'detected_category': kategori,
        'currency': 'IDR',
    }


def predict_price_simple(
    skills: list,
    durasi_hari: int,
    range_margin: float = 0.20,
    kategori: Optional[str] = None,
) -> dict:
    """Simple prediction dengan minimal input."""
    skills = normalize_skills(skills)

    user_input = {
        'kategori': kategori,
        'durasi_hari': durasi_hari,
        'skills': skills,
    }

    result = predict_price(user_input, range_margin=range_margin)
    result['detected_category'] = kategori

    return result


def get_valid_skills() -> list:
    """Get list valid skills dari feature_names."""
    if not MODEL_LOADED:
        return []
    skills = [c.replace('skill_', '').replace('_', ' ')
              for c in feature_names if c.startswith('skill_')]
    return sorted(list(set(skills)))


def get_valid_categories() -> list:
    """Get list valid categories dari feature_names."""
    if not MODEL_LOADED:
        return []
    cats = [c.replace('kategori_', '')
            for c in feature_names if c.startswith('kategori_')]
    return sorted(list(set(cats)))


def get_model_status() -> dict:
    """Ambil status model."""
    return {
        'loaded': MODEL_LOADED,
        'model_name': model.name if MODEL_LOADED and model is not None else None,
        'feature_count': len(feature_names) if feature_names is not None else 0,
        'idr_min': int(IDR_MIN) if IDR_MIN is not None else None,
        'idr_max': int(IDR_MAX) if IDR_MAX is not None else None,
    }


if __name__ == "__main__":
    print("=" * 50)
    print("INFERENCE MODULE - TEST")
    print("=" * 50)

    if MODEL_LOADED:
        print("\nTest: predict_price_simple()")
        result = predict_price_simple(['figma', 'ui ux design'], 14)
        print(f"  Input: ['figma', 'ui ux design'], 14 hari")
        print(f"  Category: {result['detected_category']}")
        print(f"  Predicted: Rp {result['predicted_price']:,}")
        print(f"  Range: Rp {result['price_min']:,} - Rp {result['price_max']:,}")

        print("\nTest: get_valid_categories()")
        categories = get_valid_categories()
        print(f"  Categories: {categories}")
    else:
        print("Model tidak berhasil di-load")

    print("\n" + "=" * 50)