"""
Feature Engineering — Fair Price Finder
Tim: CC26-PSU164

Input : data/raw/data/cleaned/merged_raw_imputed.csv
Output: data/final/dataset_final.csv
         data/final/feature_info.txt
"""

import pandas as pd
import numpy as np
from collections import Counter
import os

INPUT_PATH  = "merged_raw_imputed.csv"
OUTPUT_DIR  = "../../../final"
OUTPUT_CSV  = os.path.join(OUTPUT_DIR, "dataset_final.csv")
OUTPUT_INFO = os.path.join(OUTPUT_DIR, "feature_info.txt")

os.makedirs(OUTPUT_DIR, exist_ok=True)

df = pd.read_csv(INPUT_PATH)
print(f"Shape awal: {df.shape}")

# 1. CLEAN OUTLIER EKSTREM
# Durasi > 365 hari → kemungkinan data entry error → clip ke 365
df["durasi_hari"] = df["durasi_hari"].clip(upper=365)

# Harga < 40.000 → terlalu rendah, kemungkinan error → drop
df = df[df["harga"] >= 40_000].copy()

print(f"Shape setelah clean outlier: {df.shape}")

# 2. TARGET VARIABLE
# Log-transform harga → normalisasi distribusi skewed
df["log_harga"] = np.log1p(df["harga"])

# 3. FITUR NUMERIK TRANSFORMED
df["log_order"]  = np.log1p(df["jumlah_order"])
df["log_durasi"] = np.log1p(df["durasi_hari"])

# 4. FITUR KATEGORIKAL BARU
# is_new_seller: seller yang belum punya order & rating
df["is_new_seller"] = ((df["rating"] == 0) & (df["jumlah_order"] == 0)).astype(int)

# level: segmentasi pengalaman freelancer
# Baru     : rating 0, order 0
# Junior   : rating > 0, order <= 10
# Menengah : order 11 - 50
# Senior   : order > 50
def assign_level(row):
    if row["is_new_seller"] == 1:
        return "baru"
    elif row["jumlah_order"] <= 10:
        return "junior"
    elif row["jumlah_order"] <= 50:
        return "menengah"
    else:
        return "senior"

df["level"] = df.apply(assign_level, axis=1)

# 5. ENCODING KATEGORIKAL
# One-hot encoding: platform, kategori_utama, sub_kategori, level
cat_cols = ["platform", "kategori_utama", "sub_kategori", "level"]
df_encoded = pd.get_dummies(df, columns=cat_cols, prefix=cat_cols, dtype=int)

# 6. MULTI-LABEL ENCODING: SKILLS
# Ambil top 30 skills paling sering muncul
all_skills = []
for s in df["skills"].dropna():
    all_skills.extend([x.strip() for x in str(s).split(",")])

top_skills = [skill for skill, _ in Counter(all_skills).most_common(30)]

for skill in top_skills:
    col_name = "skill_" + skill.lower().replace(" ", "_").replace(".", "").replace("/", "_")
    df_encoded[col_name] = df["skills"].apply(
        lambda x: 1 if pd.notna(x) and skill in [s.strip() for s in str(x).split(",")] else 0
    )

print(f"Jumlah skill columns: {len(top_skills)}")

# 7. PILIH KOLOM FINAL
# Kolom yang dibuang: teks bebas & URL (tidak dipakai model)
drop_cols = ["judul_listing", "url_listing", "skills",
             "harga",          # pakai log_harga sebagai target
             "jumlah_order",   # pakai log_order
             "durasi_hari"]    # pakai log_durasi

# Tambah kolom asli yang udah di-encode
df_final = df_encoded.drop(columns=[c for c in drop_cols if c in df_encoded.columns])

print(f"Shape final: {df_final.shape}")
print(f"Jumlah fitur: {df_final.shape[1] - 1} (+ 1 target log_harga)")


# 8. SIMPAN
df_final.to_csv(OUTPUT_CSV, index=False)
print(f"\nSaved: {OUTPUT_CSV}")

# Feature info untuk Felicia
feature_cols = [c for c in df_final.columns if c != "log_harga"]
target_col   = "log_harga"

with open(OUTPUT_INFO, "w") as f:
    f.write("=== DATASET FINAL — FAIR PRICE FINDER ===\n\n")
    f.write(f"Total baris  : {len(df_final)}\n")
    f.write(f"Total kolom  : {df_final.shape[1]}\n")
    f.write(f"Target       : {target_col} (log1p dari harga asli Rupiah)\n\n")
    f.write("=== FITUR ===\n\n")
    f.write("[ NUMERIK ]\n")
    num_feats = ["rating", "log_order", "log_durasi", "is_new_seller"]
    for c in num_feats:
        if c in df_final.columns:
            f.write(f"  {c}\n")
    f.write("\n[ ONE-HOT: platform ]\n")
    for c in df_final.columns:
        if c.startswith("platform_"):
            f.write(f"  {c}\n")
    f.write("\n[ ONE-HOT: kategori_utama ]\n")
    for c in df_final.columns:
        if c.startswith("kategori_utama_"):
            f.write(f"  {c}\n")
    f.write("\n[ ONE-HOT: sub_kategori ]\n")
    for c in df_final.columns:
        if c.startswith("sub_kategori_"):
            f.write(f"  {c}\n")
    f.write("\n[ ONE-HOT: level ]\n")
    for c in df_final.columns:
        if c.startswith("level_"):
            f.write(f"  {c}\n")
    f.write("\n[ MULTI-LABEL: skills (top 30) ]\n")
    for c in df_final.columns:
        if c.startswith("skill_"):
            f.write(f"  {c}\n")
    f.write("\n=== CATATAN UNTUK MODELING ===\n")
    f.write("- Target log_harga: gunakan np.expm1(prediction) untuk konversi balik ke Rupiah\n")
    f.write("- is_new_seller = 1 → seller baru, belum ada track record\n")
    f.write("- level: baru / junior / menengah / senior (dari kombinasi rating + order)\n")
    f.write("- Semua fitur sudah dalam format numerik, siap langsung masuk model\n")
    f.write("- Tidak ada missing values\n")

print(f"Saved: {OUTPUT_INFO}")

# Preview
print("\n=== SAMPLE FITUR FINAL ===")
print(df_final.head(3).to_string())
print("\n=== DISTRIBUSI TARGET ===")
print(df_final["log_harga"].describe().round(3))
print("\n=== DISTRIBUSI LEVEL ===")
print(df["level"].value_counts())