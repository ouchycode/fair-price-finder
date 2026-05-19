"""
Merge Data & Data Preparation Pipeline
Menggabungkan data dari tiga platform (Fastwork, Sribu, Projects) dan melakukan cleaning
"""

import pandas as pd
import numpy as np
import re
from pathlib import Path
from typing import Tuple, Dict
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataMergePipeline:
    """Pipeline untuk merge dan cleaning data dari multiple platforms"""
    
    def __init__(self, data_dir: str = '.'):
        self.data_dir = Path(data_dir)

        self.fastwork_path = self.data_dir / 'fastwork' / 'fastwork_raw_v2.csv'
        self.sribu_path = self.data_dir / 'sribu' / 'sribu_raw_v2.csv'
        self.projects_path = self.data_dir / 'projects' / 'projects_raw.csv'

    def load_data(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Load data dari ketiga platform"""
        logger.info("Loading data dari semua platform...")
        
        fastwork = pd.read_csv(self.fastwork_path)
        sribu = pd.read_csv(self.sribu_path)
        projects = pd.read_csv(self.projects_path)
        
        logger.info(f"Fastwork: {len(fastwork)} records")
        logger.info(f"Sribu: {len(sribu)} records")
        logger.info(f"Projects: {len(projects)} records")
        
        return fastwork, sribu, projects
    
    def normalize_columns(self, fastwork: pd.DataFrame, sribu: pd.DataFrame, 
                         projects: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Normalisasi nama dan format kolom agar konsisten"""
        logger.info("Normalizing columns...")
        
        # Fastwork & Sribu sudah memiliki struktur yang sama, projects berbeda
        # Normalize projects untuk align dengan fastwork/sribu
        
        # Rename projects columns
        projects_normalized = projects.rename(columns={
            'jumlah_bid': 'jumlah_order'  # projects punya bid, ubah ke order
        }).copy()
        
        # Add missing columns untuk projects
        projects_normalized['rating'] = np.nan  # Projects tidak ada rating vendor
        projects_normalized['harga_raw'] = projects_normalized['budget_raw']
        
        # Reorder columns agar seragam
        common_cols = ['platform', 'kategori_utama', 'sub_kategori', 'judul_listing', 
                      'harga', 'rating', 'jumlah_order', 'durasi_hari', 'skills', 
                      'url_listing']
        
        fastwork = fastwork[common_cols].copy()
        sribu = sribu[common_cols].copy()
        projects_normalized = projects_normalized[common_cols].copy()
        
        logger.info("Columns normalized successfully")
        
        return fastwork, sribu, projects_normalized
    
    def clean_harga(self, harga: any) -> float:
        """Bersihkan nilai harga dari string/NaN"""
        if pd.isna(harga):
            return np.nan
        
        if isinstance(harga, (int, float)):
            return float(harga) if harga > 0 else np.nan
        
        # Remove non-numeric characters
        harga_str = str(harga).replace('.', '').replace(',', '').strip()
        
        try:
            harga_float = float(harga_str)
            return harga_float if harga_float > 0 else np.nan
        except ValueError:
            return np.nan
    
    def clean_durasi(self, durasi: any) -> float:
        """Bersihkan nilai durasi hari"""
        if pd.isna(durasi):
            return np.nan
        
        if isinstance(durasi, (int, float)):
            return float(durasi) if durasi > 0 else np.nan
        
        durasi_str = str(durasi).lower().strip()
        
        # Extract angka dari string
        match = re.search(r'(\d+)', durasi_str)
        if match:
            return float(match.group(1))
        
        return np.nan
    
    def clean_rating(self, rating: any) -> float:
        """Bersihkan nilai rating (0-5)"""
        if pd.isna(rating):
            return np.nan
        
        if isinstance(rating, (int, float)):
            rating_float = float(rating)
            if 0 <= rating_float <= 5:
                return rating_float
        
        try:
            rating_str = str(rating).replace('/', '').strip()
            rating_float = float(rating_str.split()[0])
            if 0 <= rating_float <= 5:
                return rating_float
        except (ValueError, IndexError):
            pass
        
        return np.nan
    
    def clean_jumlah_order(self, jumlah: any) -> float:
        """Bersihkan jumlah order/bid"""
        if pd.isna(jumlah):
            return np.nan
        
        if isinstance(jumlah, (int, float)):
            return float(jumlah) if jumlah >= 0 else np.nan
        
        jumlah_str = str(jumlah).lower().replace('terjual', '').replace('bid', '').strip()
        
        try:
            return float(jumlah_str)
        except ValueError:
            return np.nan
    
    def parse_skills(self, skills: any) -> list:
        """Parse skills dari string menjadi list"""
        if pd.isna(skills):
            return []
        
        skills_str = str(skills).strip()
        
        if not skills_str or skills_str.lower() in ['nan', 'none', '']:
            return []
        
        # Split by comma atau semicolon
        skills_list = [s.strip() for s in re.split('[,;]', skills_str) if s.strip()]
        
        return skills_list
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Apply cleaning functions ke dataframe"""
        logger.info(f"Cleaning {len(df)} records...")
        
        df = df.copy()
        
        # Clean harga
        df['harga'] = df['harga'].apply(self.clean_harga)
        
        # Clean durasi
        df['durasi_hari'] = df['durasi_hari'].apply(self.clean_durasi)
        
        # Clean rating
        df['rating'] = df['rating'].apply(self.clean_rating)
        
        # Clean jumlah order
        df['jumlah_order'] = df['jumlah_order'].apply(self.clean_jumlah_order)
        
        # Parse skills
        df['skills'] = df['skills'].apply(self.parse_skills)
        
        # Remove rows dengan harga kosong (critical field)
        initial_len = len(df)
        df = df.dropna(subset=['harga'])
        logger.info(f"Dropped {initial_len - len(df)} rows with missing harga")
        
        # Remove duplikates berdasarkan judul dan platform
        initial_len = len(df)
        df = df.drop_duplicates(subset=['platform', 'judul_listing'], keep='first')
        logger.info(f"Dropped {initial_len - len(df)} duplicate rows")
        
        return df
    
    def merge_all_data(self, fastwork: pd.DataFrame, sribu: pd.DataFrame, 
                       projects: pd.DataFrame) -> pd.DataFrame:
        """Merge data dari semua platform"""
        logger.info("Merging data dari semua platform...")
        
        merged = pd.concat([fastwork, sribu, projects], ignore_index=True)
        
        logger.info(f"Total merged records: {len(merged)}")
        logger.info(f"\nBreakdown:")
        logger.info(f"  - Fastwork: {len(fastwork)}")
        logger.info(f"  - Sribu: {len(sribu)}")
        logger.info(f"  - Projects: {len(projects)}")
        
        return merged
    
    def add_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add derived features untuk analysis dan modeling"""
        logger.info("Adding derived features...")
        
        df = df.copy()
        
        # Harga per hari
        df['harga_per_hari'] = df['harga'] / df['durasi_hari'].replace(0, np.nan)
        
        # Popularity score (combined dari rating dan jumlah order)
        df['rating_normalized'] = (df['rating'] / 5).fillna(0)  # Normalize to 0-1
        df['order_normalized'] = (df['jumlah_order'] / df['jumlah_order'].max()).fillna(0)
        df['popularity_score'] = (df['rating_normalized'] * 0.6 + df['order_normalized'] * 0.4)
        
        # Price range category
        def categorize_price(price):
            if price < 500000:
                return 'Sangat Murah'
            elif price < 1000000:
                return 'Murah'
            elif price < 3000000:
                return 'Sedang'
            elif price < 7000000:
                return 'Mahal'
            else:
                return 'Sangat Mahal'
        
        df['price_category'] = df['harga'].apply(categorize_price)
        
        # Durasi category
        def categorize_durasi(durasi):
            if durasi <= 3:
                return 'Cepat'
            elif durasi <= 7:
                return 'Sedang'
            else:
                return 'Lama'
        
        df['durasi_category'] = df['durasi_hari'].apply(categorize_durasi)
        
        # Number of skills
        df['num_skills'] = df['skills'].apply(len)
        
        # Skills text (comma-separated)
        df['skills_text'] = df['skills'].apply(lambda x: ', '.join(x) if x else '')
        
        return df
    
    def save_cleaned_data(self, df: pd.DataFrame, output_dir: str = './data/cleaned'):
        """Save cleaned data ke CSV"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir / 'merged_cleaned.csv'
        df.to_csv(output_path, index=False)
        logger.info(f"Cleaned data saved to {output_path}")
        
        # Save statistics
        stats_path = output_dir / 'data_statistics.txt'
        with open(stats_path, 'w') as f:
            f.write("DATA STATISTICS\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Total Records: {len(df)}\n\n")
            
            f.write("HARGA (IDR):\n")
            f.write(f"  Mean: {df['harga'].mean():,.0f}\n")
            f.write(f"  Median: {df['harga'].median():,.0f}\n")
            f.write(f"  Min: {df['harga'].min():,.0f}\n")
            f.write(f"  Max: {df['harga'].max():,.0f}\n\n")
            
            f.write("DURASI (Hari):\n")
            f.write(f"  Mean: {df['durasi_hari'].mean():.1f}\n")
            f.write(f"  Median: {df['durasi_hari'].median():.1f}\n\n")
            
            f.write("RATING:\n")
            f.write(f"  Mean: {df['rating'].mean():.2f}\n")
            f.write(f"  Median: {df['rating'].median():.2f}\n\n")
            
            f.write("KATEGORI UTAMA:\n")
            for cat in df['kategori_utama'].value_counts().items():
                f.write(f"  {cat[0]}: {cat[1]}\n")
            
            f.write("\nPLATFORM:\n")
            for plat in df['platform'].value_counts().items():
                f.write(f"  {plat[0]}: {plat[1]}\n")
        
        logger.info(f"Statistics saved to {stats_path}")
        
        return output_path
    
    def run(self) -> pd.DataFrame:
        """Run complete pipeline"""
        logger.info("Starting Data Merge & Preparation Pipeline...")
        
        # Load
        fastwork, sribu, projects = self.load_data()
        
        # Normalize columns
        fastwork, sribu, projects = self.normalize_columns(fastwork, sribu, projects)
        
        # Clean individual datasets
        fastwork = self.clean_data(fastwork)
        sribu = self.clean_data(sribu)
        projects = self.clean_data(projects)
        
        # Merge
        merged = self.merge_all_data(fastwork, sribu, projects)
        
        # Add features
        merged = self.add_derived_features(merged)
        
        # Save
        self.save_cleaned_data(merged)
        
        logger.info("Pipeline completed!")
        
        return merged


if __name__ == '__main__':
    # Run pipeline
    pipeline = DataMergePipeline()
    merged_df = pipeline.run()
    
    # Display summary
    print("\n" + "=" * 70)
    print("MERGED DATA SUMMARY")
    print("=" * 70)
    print(f"\nShape: {merged_df.shape}")
    print(f"\nColumns: {merged_df.columns.tolist()}")
    print(f"\nFirst 5 rows:")
    print(merged_df.head())
    print(f"\nData Info:")
    print(merged_df.info())
    print(f"\nHarga Statistics:")
    print(merged_df['harga'].describe())