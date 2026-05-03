"""
Modul preprocessing dan cleaning data freelance.
Digunakan oleh: Data Scientist
"""

import pandas as pd
import numpy as np


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Bersihkan data dari noise, nilai null, dan outlier."""
    df = df.dropna(subset=['price', 'category'])
    df = df[df['price'] > 0]
    return df


def normalize_price(df: pd.DataFrame) -> pd.DataFrame:
    """Normalisasi kolom harga ke IDR."""
    # TODO: konversi mata uang jika perlu
    return df


def extract_skills(text: str) -> list:
    """Ekstrak daftar skill dari teks deskripsi proyek."""
    # TODO: parsing skill dari teks tidak terstruktur
    return []
