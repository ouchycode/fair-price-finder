"""
A/B Testing — Fair Price Finder
Membandingkan model deep learning Felicia vs baseline median per kategori.

Model A : Baseline (median harga per kategori dari training data)
Model B : freelance_pricer_final.keras (model Felicia)

Run dari folder ai/:
    python scripts/ab_testing_run.py
"""

import numpy as np
import pandas as pd
from scipy import stats
import tensorflow as tf
import pickle
import json
import os

# ── PATH CONFIG ────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
AI_DIR        = os.path.dirname(BASE_DIR)

MODEL_PATH    = os.path.join(AI_DIR, "data/models/freelance_pricer_final.keras")
SCALER_PATH   = os.path.join(AI_DIR, "data/prepared/scaler.pkl")
X_TEST_PATH   = os.path.join(AI_DIR, "data/prepared/X_test_scaled.npy")
Y_TEST_PATH   = os.path.join(AI_DIR, "data/prepared/y_test.npy")
FEATURES_PATH = os.path.join(AI_DIR, "data/prepared/feature_names.pkl")
DATASET_PATH  = os.path.join(AI_DIR, "data/output/dataset_v2_finalmodel.csv")

# ── FUNGSI AB TEST ─────────────────────────────────────────

def ab_test_models(predictions_a: np.ndarray, predictions_b: np.ndarray,
                   y_true: np.ndarray, alpha: float = 0.05):
    """
    Bandingkan dua model menggunakan paired t-test.

    Args:
        predictions_a: prediksi dari model A
        predictions_b: prediksi dari model B
        y_true: nilai aktual
        alpha: significance level (default 0.05)

    Returns:
        dict hasil A/B test
    """
    errors_a = np.abs(y_true - predictions_a)
    errors_b = np.abs(y_true - predictions_b)

    t_stat, p_value = stats.ttest_rel(errors_a, errors_b)
    mae_a = np.mean(errors_a)
    mae_b = np.mean(errors_b)

    result = {
        'model_a_mae': round(mae_a, 4),
        'model_b_mae': round(mae_b, 4),
        't_statistic': round(t_stat, 4),
        'p_value': round(p_value, 4),
        'significant': p_value < alpha,
        'winner': 'A' if mae_a < mae_b else 'B'
    }

    return result

# ── LOAD DATA ──────────────────────────────────────────────

print("=" * 55)
print("A/B TESTING — Fair Price Finder")
print("=" * 55)

print("\n[1/4] Loading test data...")
X_test = np.load(X_TEST_PATH)
y_test = np.load(Y_TEST_PATH)
print(f"      X_test shape : {X_test.shape}")
print(f"      y_test shape : {y_test.shape}")

# ── MODEL B: DEEP LEARNING ─────────────────────────────────

print("\n[2/4] Loading Model B (freelance_pricer_final.keras)...")
MODEL_PATH = os.path.join(AI_DIR, "data/models/freelance_pricer_savedmodel")
model_b = tf.saved_model.load(MODEL_PATH)
infer = model_b.signatures["serving_default"]
pred_b_raw = infer(tf.constant(X_test, dtype=tf.float32))
# Ambil output-nya (nama key bisa beda, cek dulu)
output_key = list(pred_b_raw.keys())[0]
pred_b_raw = pred_b_raw[output_key].numpy().flatten()

# Kalau model prediksi log_price, konversi balik ke rupiah
# Cek apakah prediksi dalam skala log (nilai kecil ~10-18) atau rupiah asli
if pred_b_raw.mean() < 25:
    print("      Detected log-scale predictions → converting with expm1")
    pred_b = np.expm1(pred_b_raw)
    y_true = np.expm1(y_test)
else:
    print("      Detected price-scale predictions → using as-is")
    pred_b = pred_b_raw
    y_true = y_test

print(f"      Sample predictions B: {pred_b[:5].round(0)}")

# ── MODEL A: BASELINE MEDIAN PER KATEGORI ─────────────────

print("\n[3/4] Building Model A (baseline: median per kategori)...")

df = pd.read_csv(DATASET_PATH)

# Load feature names untuk mapping kolom kategori
try:
    with open(FEATURES_PATH, 'rb') as f:
        feature_names = pickle.load(f)
except:
    feature_names = None

# Identifikasi kolom kategori
kat_cols = [c for c in df.columns if c.startswith("kategori_")]

# Hitung median per kategori dari seluruh dataset (proxy training)
# Split 80/20 seperti training
n_train = int(len(df) * 0.8)
df_train = df.iloc[:n_train]
df_test  = df.iloc[n_train:]

# Pastikan jumlah test sama dengan X_test
n_test = len(X_test)
df_test = df.iloc[-n_test:]

# Hitung median log_price per kategori dari training
if "log_price_single" in df.columns:
    target_col = "log_price_single"
    use_log = True
else:
    target_col = "price_single"
    use_log = False

median_per_kat = {}
for col in kat_cols:
    subset = df_train[df_train[col] == 1][target_col]
    if len(subset) > 0:
        median_per_kat[col] = subset.median()
    else:
        median_per_kat[col] = df_train[target_col].median()

global_median = df_train[target_col].median()

# Prediksi baseline untuk test set
pred_a_log = np.full(n_test, global_median)

for i, (_, row) in enumerate(df_test.iterrows()):
    for col in kat_cols:
        if row.get(col, 0) == 1:
            pred_a_log[i] = median_per_kat.get(col, global_median)
            break

# Konversi ke rupiah
if use_log:
    pred_a = np.expm1(pred_a_log)
else:
    pred_a = pred_a_log

print(f"      Sample predictions A: {pred_a[:5].round(0)}")

# ── RUN A/B TEST ───────────────────────────────────────────

print("\n[4/4] Running A/B Test...")
print("-" * 55)
print("Model A : Baseline (median per kategori)")
print("Model B : freelance_pricer_final.keras")
print("-" * 55)

result = ab_test_models(pred_a, pred_b, y_true)

print(f"\nModel A MAE  : Rp {result['model_a_mae']:>12,.0f}")
print(f"Model B MAE  : Rp {result['model_b_mae']:>12,.0f}")
print(f"t-statistic  : {result['t_statistic']}")
print(f"p-value      : {result['p_value']}")
print(f"Signifikan   : {'Ya' if result['significant'] else 'Tidak'} (α = 0.05)")
print(f"Pemenang     : Model {result['winner']}")

print("\n" + "=" * 55)
if result['significant'] and result['winner'] == 'B':
    print("KESIMPULAN: Model deep learning (B) secara statistik")
    print("   lebih baik dari baseline. Model layak digunakan.")
elif result['significant'] and result['winner'] == 'A':
    print("KESIMPULAN: Baseline (A) lebih baik dari model deep")
    print("   learning. Perlu evaluasi ulang model.")
else:
    print("KESIMPULAN: Perbedaan tidak signifikan secara statistik.")
    print("   Pertimbangkan tuning lebih lanjut.")
print("=" * 55)

# Simpan hasil
result['model_a_name'] = 'Baseline (median per kategori)'
result['model_b_name'] = 'freelance_pricer_savedmodel'
result['n_test_samples'] = int(n_test)
result['significant'] = bool(result['significant'])

output_path = os.path.join(AI_DIR, "data/logs/ab_test_results.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w') as f:
    json.dump({k: (bool(v) if isinstance(v, np.bool_) else v)
               for k, v in result.items()}, f, indent=2)
print(f"\nHasil disimpan: {output_path}")