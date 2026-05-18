# ============================================================================
# Modul Inference - Fair Price Finder
# Berisi fungsi untuk mempersiapkan input dan menjalankan prediksi harga
# ============================================================================

import numpy as np
import pickle
import json
from pathlib import Path
import tensorflow as tf
layers = tf.keras.layers
from typing import Any, Dict, List, Optional


# ============================================================================
# 1. CUSTOM LAYER DEFINITION
# ============================================================================

class ResidualDenseBlock(layers.Layer):
    """
    Residual block dengan 2 Dense + LayerNormalization untuk stability.
    Harus sama persis dengan definisi di notebook 02.
    """
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

    def detect_category(self, skills: list) -> str:
        return detect_category(skills)

    def resolve_prediction_input(self, user_input: dict) -> Dict[str, Any]:
        return resolve_prediction_input(user_input)

    def predict_price(self, user_input: dict, range_margin: float = 0.20) -> dict:
        return predict_price(user_input, range_margin=range_margin)

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

    def get_valid_platforms(self) -> list:
        return get_valid_platforms()

    def get_model_status(self) -> dict:
        return get_model_status()


# ============================================================================
# 2. PATH & MODEL LOADING
# ============================================================================

def find_project_root():
    """Cari root project dari lokasi file ini."""
    current_dir = Path(__file__).parent.resolve()
    for candidate in [current_dir, *current_dir.parents]:
        if (candidate / "data").exists():
            return candidate
    return current_dir


PROJECT_ROOT = find_project_root()
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = DATA_DIR / "models"
PREPROCESSED_DIR = DATA_DIR / "preprocessed"

MODEL_PATH = MODELS_DIR / 'freelance_pricer_final.keras'
SCALER_PATH = PREPROCESSED_DIR / 'scaler.pkl'
FEATURE_NAMES_PATH = PREPROCESSED_DIR / 'feature_names.pkl'
METADATA_PATH = MODELS_DIR / 'model_metadata.json'

# Load model dan artifacts saat module di-import
try:
    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={'ResidualDenseBlock': ResidualDenseBlock}
    )
    
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    
    with open(FEATURE_NAMES_PATH, 'rb') as f:
        feature_names = pickle.load(f)
    
    if METADATA_PATH.exists():
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    else:
        raise FileNotFoundError(f'Metadata model tidak ditemukan: {METADATA_PATH}')

    IDR_MIN = metadata['clipping_bounds']['idr_p01']
    IDR_MAX = metadata['clipping_bounds']['idr_p99']

    MODEL_LOADED = True
    print("Model berhasil dimuat")
    print(f" Model: {model.name}")
    print(f" Features: {len(feature_names)}")
    print(f" Clipping bounds: Rp {IDR_MIN:,} - Rp {IDR_MAX:,}")

except Exception as e:
    print(f"Error loading model: {e}")
    MODEL_LOADED = False
    model = None
    scaler = None
    feature_names = None
    IDR_MIN = None
    IDR_MAX = None


# ============================================================================
# 3. DATA-DRIVEN CATEGORY DETECTION
# ============================================================================

try:
    import pandas as pd
    _PANDAS_AVAILABLE = True
except Exception:
    pd = None
    _PANDAS_AVAILABLE = False

_MERGED_DF_INF = None

def _load_merged_for_inference():
    global _MERGED_DF_INF
    if _MERGED_DF_INF is not None:
        return _MERGED_DF_INF
    if not _PANDAS_AVAILABLE:
        return None
    candidates = [
        Path(__file__).parent.parent / 'data' / 'raw' / 'data' / 'cleaned' / 'merged_cleaned.csv',
        Path(__file__).parent.parent / 'data' / 'raw' / 'data' / 'cleaned' / 'merged_raw_imputed.csv',
    ]
    for p in candidates:
        try:
            if p.exists():
                _MERGED_DF_INF = pd.read_csv(p)
                return _MERGED_DF_INF
        except Exception:
            continue
    return None


# ============================================================================
# 4. INFERENCE FUNCTIONS
# ============================================================================

def detect_category(skills: list) -> Optional[str]:
    """Deteksi kategori dari daftar skills menggunakan data gabungan.

    Mengembalikan None jika tidak ada kategori yang dapat dipastikan.
    """
    if not skills:
        return None

    df = _load_merged_for_inference()
    if df is None:
        return None

    skills_norm = [s.strip().lower() for s in skills if isinstance(s, str) and s.strip()]
    if not skills_norm:
        return None

    # Find rows where skills_text or skills columns mention the skills
    matches = df.iloc[0:0]
    if 'skills_text' in df.columns:
        mask = df['skills_text'].fillna('').str.lower().apply(lambda s: any(sk in s for sk in skills_norm))
        matches = df[mask]
    elif 'skills' in df.columns:
        mask = df['skills'].fillna('').astype(str).str.lower().apply(lambda s: any(sk in s for sk in skills_norm))
        matches = df[mask]

    if matches.empty:
        return None

    if 'kategori_utama' in matches.columns:
        most = matches['kategori_utama'].dropna().value_counts()
        if not most.empty:
            return str(most.idxmax())

    return None


def normalize_skills(skills: Optional[list]) -> list:
    """Normalize skill input agar selalu berupa list string yang bersih."""
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


def resolve_prediction_input(user_input: dict) -> Dict[str, Any]:
    """Terima payload dari app FastAPI maupun backend Express."""
    skills = normalize_skills(user_input.get('skills'))
    kategori = user_input.get('kategori') or user_input.get('category')
    if not kategori:
        kategori = detect_category(skills)
    durasi_hari = user_input.get('durasi_hari', user_input.get('duration'))

    if durasi_hari is None:
        raise ValueError('duration/durasi_hari wajib diisi')

    try:
        durasi_hari = int(durasi_hari)
    except (TypeError, ValueError) as exc:
        raise ValueError('duration/durasi_hari harus berupa angka bulat') from exc

    platform = user_input.get('platform') or 'fastwork'

    return {
        'kategori': kategori or '',
        'platform': str(platform),
        'durasi_hari': durasi_hari,
        'skills': skills,
        'has_rating': bool(user_input.get('has_rating', True)),
        'title_length': int(user_input.get('title_length', 50)),
        'desc_length': int(user_input.get('desc_length', 0)),
        'has_urgency': bool(user_input.get('has_urgency', False)),
    }


def predict_price(user_input: dict, range_margin: float = 0.20) -> dict:
    """
    Predict harga adil untuk freelance project (Full version).
    
    Args:
        user_input: dict dengan keys:
            - kategori: str (e.g., 'Web dan Pemrograman')
            - platform: str (fastwork/sribu/projects)
            - durasi_hari: int
            - skills: list of str (e.g., ['figma', 'ui ux design'])
            - has_rating: bool (default True)
            - title_length: int (default 50)
            - desc_length: int (default 0)
            - has_urgency: bool (default False)
        range_margin: float, percentage for min/max range (default 20%)
    
    Returns:
        dict: predicted_price, price_min, price_max (semua dalam IDR)
    """
    if not MODEL_LOADED:
        raise RuntimeError("Model tidak berhasil di-load. Periksa file model dan artifacts.")

    user_input = resolve_prediction_input(user_input)
    
    # Initialize feature vector dengan 0
    features = {col: 0 for col in feature_names}
    
    # Set kategori
    kat_col = f'kategori_{user_input["kategori"]}'
    if kat_col in features:
        features[kat_col] = 1
    
    # Set platform
    plat_col = f'platform_{user_input["platform"]}'
    if plat_col in features:
        features[plat_col] = 1
    
    # Platform type flag
    features['is_service_based'] = 1 if user_input['platform'] in ['fastwork', 'sribu'] else 0
    
    # Numeric features
    durasi = user_input.get('durasi_hari', 7)
    features['durasi_hari'] = durasi
    features['log_durasi'] = np.log1p(durasi)
    features['has_rating'] = int(user_input.get('has_rating', True))
    features['title_length'] = user_input.get('title_length', 50)
    features['desc_length'] = user_input.get('desc_length', 0)
    features['has_description'] = 1 if features['desc_length'] > 0 else 0
    features['has_urgency'] = int(user_input.get('has_urgency', False))
    features['has_price_range'] = 0
    
    # Skills
    skills = user_input.get('skills', [])
    features['skill_count'] = len(skills)
    
    PREMIUM = {'machine learning', 'flutter'}
    features['has_premium_skill'] = 1 if any(s in PREMIUM for s in skills) else 0
    
    for skill in skills:
        skill_col = 'skill_' + skill.replace(' ', '_').replace('.', '').replace('/', '_')
        if skill_col in features:
            features[skill_col] = 1
    
    # Convert ke array sesuai urutan feature_names
    X = np.array([[features[col] for col in feature_names]])
    
    # Scale
    X_scaled = scaler.transform(X)
    
    # Predict
    log_pred = model.predict(X_scaled, verbose=0)[0][0]
    
    # Clip prediction dalam log range training
    log_pred_clipped = np.clip(log_pred, np.log1p(IDR_MIN), np.log1p(IDR_MAX))
    
    # Inverse transform ke IDR
    pred_idr = np.expm1(log_pred_clipped)
    
    # Apply range margin
    price_min = int(pred_idr * (1 - range_margin))
    price_max = int(pred_idr * (1 + range_margin))
    return {
        'predicted_price': int(pred_idr),
        'price_min': price_min,
        'price_max': price_max,
        'min_price': price_min,
        'max_price': price_max,
        'median_price': int(pred_idr),
        'currency': 'IDR',
        'confidence': 'medium'
    }


def predict_price_simple(
    skills: list,
    durasi_hari: int,
    range_margin: float = 0.20,
    kategori: Optional[str] = None,
) -> dict:
    """
    SIMPLIFIED inference untuk MVP.
    User cuma perlu kasih 2 input: skills dan durasi.
    Sisa parameter auto-default atau auto-detect.
    
    Args:
        skills: list of str (e.g., ['figma', 'ui ux design'])
        durasi_hari: int (e.g., 14)
        range_margin: float, optional (default 20%)
    
    Returns:
        dict: predicted_price, price_min, price_max (semua dalam IDR)
    """
    # Auto-detect kategori dari skills kalau belum disuplai dari backend/frontend
    skills = normalize_skills(skills)
    kategori = kategori or detect_category(skills)
    
    # Build full input dengan default
    user_input = {
        'kategori': kategori,
        'platform': 'fastwork',           # Default: platform paling umum
        'durasi_hari': durasi_hari,
        'skills': skills,
        'has_rating': True,               # Default: assume freelancer punya rating
        'title_length': 50,               # Default: rata-rata
        'desc_length': 0,                 # Default: no description
        'has_urgency': False              # Default: not urgent
    }
    
    # Pakai inference function full
    result = predict_price(user_input, range_margin=range_margin)
    
    # Tambah info kategori yang terdeteksi (untuk transparency)
    result['detected_category'] = kategori
    
    return result


# ============================================================================
# 5. HELPER FUNCTIONS
# ============================================================================

def get_valid_skills() -> list:
    """Get list of valid skills dari feature_names."""
    if not MODEL_LOADED:
        return []
    skills = [c.replace('skill_', '').replace('_', ' ')
              for c in feature_names if c.startswith('skill_')]
    return sorted(list(set(skills)))


def get_valid_categories() -> list:
    """Get list of valid categories dari feature_names."""
    if not MODEL_LOADED:
        return []
    cats = [c.replace('kategori_', '') 
            for c in feature_names if c.startswith('kategori_')]
    return sorted(list(set(cats)))


def get_valid_platforms() -> list:
    """Get list of valid platforms dari feature_names."""
    if not MODEL_LOADED:
        return []
    platforms = [c.replace('platform_', '') 
                 for c in feature_names if c.startswith('platform_')]
    return sorted(list(set(platforms)))


def get_model_status() -> dict:
    """Return status ringkas yang aman untuk API health check."""
    return {
        'loaded': MODEL_LOADED,
        'model_name': model.name if MODEL_LOADED and model is not None else None,
        'feature_count': len(feature_names) if feature_names is not None else 0,
        'idr_min': int(IDR_MIN) if IDR_MIN is not None else None,
        'idr_max': int(IDR_MAX) if IDR_MAX is not None else None,
    }


if __name__ == "__main__":
    # Test saat module di-run langsung
    print("\n" + "="*60)
    print("INFERENCE MODULE - TEST")
    print("="*60)
    
    if MODEL_LOADED:
        print("\nTest 1: predict_price_simple()")
        result = predict_price_simple(['figma', 'ui ux design'], 14)
        print(f"  Input: ['figma', 'ui ux design'], 14 hari")
        print(f"  → Category: {result['detected_category']}")
        print(f"  → Predicted: Rp {result['predicted_price']:,}")
        print(f"  → Range: Rp {result['price_min']:,} - Rp {result['price_max']:,}")
        
        print("\nTest 2: get_valid_skills()")
        skills = get_valid_skills()
        print(f"  Total skills: {len(skills)}")
        print(f"  Sample (first 5): {skills[:5]}")
        
        print("\nTest 3: get_valid_categories()")
        categories = get_valid_categories()
        print(f"  Categories: {categories}")
    else:
        print("Model tidak berhasil di-load")
    
    print("\n" + "="*60)
