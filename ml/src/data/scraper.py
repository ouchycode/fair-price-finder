"""
Modul scraping data freelance dari platform target.
Digunakan oleh: Data Scientist
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd


def scrape_projects(url: str, pages: int = 10) -> pd.DataFrame:
    """
    Scrape data proyek freelance dari URL target.
    Returns: DataFrame dengan kolom [title, category, skills, price, duration]
    """
    # TODO: implementasi scraping
    raise NotImplementedError("Implementasi scraper sesuai platform target")


def save_raw_data(df: pd.DataFrame, filename: str):
    """Simpan data mentah ke folder data/raw/"""
    path = f"../../data/raw/{filename}"
    df.to_csv(path, index=False)
    print(f"✅ Data disimpan ke {path}")
