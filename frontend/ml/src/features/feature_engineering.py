"""
Feature engineering untuk model prediksi harga.
Digunakan oleh: AI Engineer
"""

from sklearn.preprocessing import LabelEncoder, StandardScaler
import pandas as pd


def encode_category(df: pd.DataFrame) -> pd.DataFrame:
    """Encode kolom kategori jasa menjadi numerik."""
    le = LabelEncoder()
    df['category_encoded'] = le.fit_transform(df['category'])
    return df, le


def encode_skills(skills: list, skill_vocab: list) -> list:
    """Ubah list skill menjadi multi-hot encoding."""
    encoding = [1 if skill in skills else 0 for skill in skill_vocab]
    return encoding


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """Gabungkan semua fitur menjadi matrix siap latih."""
    # TODO: category encoding + skill encoding + duration normalization
    pass
