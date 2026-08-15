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
GB_MODEL_PATH       = MODELS_DIR / 'freelance_pricer_gb_log1p.pkl'
SCALER_PATH         = PREPARED_DIR / 'scaler.pkl'
FEATURE_NAMES_PATH  = PREPARED_DIR / 'feature_names.pkl'
METADATA_PATH       = MODELS_DIR / 'model_metadata.json'

# Skills premium (digunakan untuk menghitung fitur has_premium_skill).
PREMIUM_SKILLS = [
    "machine learning", "flutter", "kotlin", "data science", "nextjs",
    "react native", "react", "deep learning", "python", "html css",
    "java", "swift", "laravel",
]

MODEL_LOADED = False
model = None
scaler = None
feature_names = None
IDR_MIN = None
IDR_MAX = None
MULTIPLIER = 1.0
RANGE_MARGIN = 0.20
PER_CATEGORY = {}
MODEL_KIND = None

try:
    with open(METADATA_PATH, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    MODEL_KIND = metadata.get('model_kind', 'keras_nn_log1p')
    MULTIPLIER = float(metadata.get('multiplier', 1.0))
    RANGE_MARGIN = float(metadata.get('range_margin', 0.20))
    IDR_MIN = metadata['clipping_bounds']['idr_p01']
    IDR_MAX = metadata['clipping_bounds']['idr_p99']
    PER_CATEGORY = metadata.get('per_category', {})

    if MODEL_KIND == 'gradient_boosting_log1p':
        with open(GB_MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("Model format: GradientBoosting (log1p)")
    else:
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

    MODEL_LOADED = True
    print("Model loaded successfully")
    print(f"  Kind: {MODEL_KIND}")
    print(f"  Features: {len(feature_names)}")
    print(f"  Multiplier: {MULTIPLIER}")
    print(f"  IDR range: Rp {IDR_MIN:,} - Rp {IDR_MAX:,}")

except Exception as e:
    print(f"Error loading model: {e}")
    MODEL_LOADED = False


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


# Bucket durasi (urutan menaik) dipakai untuk fair window lookup.
_DURATION_BINS = [(1, 2), (3, 5), (6, 10), (11, 20), (21, 240)]


def _fair_window(cat_cfg: dict, durasi_hari: int):
    """Ambil p05-p95 market window untuk kategori x durasi, None jika tak ada."""
    windows = cat_cfg.get('fair_windows')
    if not windows:
        return None
    for lo, hi in _DURATION_BINS:
        if lo <= durasi_hari <= hi or (durasi_hari < 1 and lo == 1) or (durasi_hari > 240 and hi == 240):
            w = windows.get(f"{lo}-{hi}")
            if w:
                return (float(w['p05']), float(w['p95']))
    # Durasi di luar rentang -> pakai window terdekat (pertama/terakhir).
    if durasi_hari < 1:
        for lo, hi in _DURATION_BINS:
            w = windows.get(f"{lo}-{hi}")
            if w:
                return (float(w['p05']), float(w['p95']))
            return None
    w = None
    for lo, hi in _DURATION_BINS:
        w = windows.get(f"{lo}-{hi}") or w
    if w:
        return (float(w['p05']), float(w['p95']))
    return None

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

    # Fitur derivable yang dihitung dari skill yang dipilih user
    if 'skill_count' in features:
        features['skill_count'] = len(skills)
    if 'has_premium_skill' in features:
        premium_cols = {'skill_' + s.replace(' ', '_') for s in PREMIUM_SKILLS}
        has_premium = False
        for s in skills:
            col = 'skill_' + s.strip().lower().replace(' ', '_').replace('.', '').replace('/', '_')
            if col in premium_cols:
                has_premium = True
                break
        features['has_premium_skill'] = 1 if has_premium else 0

    X = np.array([[features[col] for col in feature_names]])

    X_scaled = scaler.transform(X)
    try:
        pred_log = model.predict(X_scaled, verbose=0)[0][0]
    except TypeError:
        pred_log = model.predict(X_scaled)[0]

    # Model dilatih pada log1p(price) -> decode balik ke IDR
    pred_price = float(np.expm1(pred_log))

    # Kalibrasi per-kategori jika kategori dikenal, else fallback ke global.
    cat_cfg = PER_CATEGORY.get(kategori) if kategori else None
    if cat_cfg:
        mult = float(cat_cfg.get('multiplier', MULTIPLIER))
        clip_min = float(cat_cfg.get('clip_p01', IDR_MIN))
        clip_max = float(cat_cfg.get('clip_p99', IDR_MAX))
        margin_low = float(cat_cfg.get(
            'range_margin_low', cat_cfg.get('margin_low',
            cat_cfg.get('range_margin', RANGE_MARGIN))))
        margin_high = float(cat_cfg.get(
            'range_margin_high', cat_cfg.get('margin_high', margin_low)))
        fair_window = _fair_window(cat_cfg, durasi_hari)
    else:
        mult = MULTIPLIER
        clip_min = IDR_MIN
        clip_max = IDR_MAX
        margin_low = margin_high = RANGE_MARGIN
        fair_window = None

    pred_idr_clipped = float(np.clip(pred_price, clip_min, clip_max))

    adjusted_price = pred_idr_clipped * mult

    # Fair window: jaga prediksi di dalam rentang pasar wajar (p05-p95)
    # untuk kombinasi kategori x bucket durasi dari data aktual.
    if fair_window:
        adjusted_price = float(np.clip(adjusted_price,
                                       fair_window[0], fair_window[1]))

    price_min = adjusted_price * (1 - margin_low)
    price_max = adjusted_price * (1 + margin_high)

    # Rentang min/max juga dibatasi fair window agar tetap masuk akal.
    if fair_window:
        price_min = max(price_min, fair_window[0])
        price_max = min(price_max, fair_window[1])

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
    model_name = None
    if MODEL_LOADED and model is not None:
        model_name = getattr(model, 'name', MODEL_KIND or 'gradient_boosting_log1p')
    return {
        'loaded': MODEL_LOADED,
        'model_name': model_name,
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