import pandas as pd
from pathlib import Path

# Paths
base_dir = Path(".")

fastwork = pd.read_csv(base_dir / "fastwork" / "fastwork_raw_v2.csv")
sribu = pd.read_csv(base_dir / "sribu" / "sribu_raw_v2.csv")
projects = pd.read_csv(base_dir / "projects" / "projects_raw.csv")

# Rename agar konsisten
projects = projects.rename(columns={
    'jumlah_bid': 'jumlah_order'
})

# Tambah kolom kosong jika belum ada
projects['rating'] = None

# Kolom yang mau dipakai
common_cols = [
    'platform',
    'kategori_utama',
    'sub_kategori',
    'judul_listing',
    'harga',
    'rating',
    'jumlah_order',
    'durasi_hari',
    'skills',
    'url_listing'
]

# Ambil kolom
fastwork = fastwork[common_cols]
sribu = sribu[common_cols]
projects = projects[common_cols]

# Merge
merged = pd.concat(
    [fastwork, sribu, projects],
    ignore_index=True
)

# Save
output_dir = Path("../cleaned")
output_dir.mkdir(exist_ok=True)

merged.to_csv(output_dir / "merged_raw.csv", index=False)

print("Merged raw data saved!")
print(merged.shape)