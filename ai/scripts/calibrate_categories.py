"""
Per-category calibration experiment
Tanpa retraining — hanya kalibrasi pasca-train:
  - multiplier optimum per-kategori
  - clip bounds p01/p99 per-kategori
  - range margin per-kategori berbasis IQR data (bukan ±20% seragam)
Hasil disimpan ke data/models/model_metadata.json (blok "per_category").
"""

import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

RANDOM_SEED = 42

BASE = Path(__file__).resolve().parents[1]
INPUT_PATH = BASE / "data" / "output" / "dataset_v2_finalmodel.csv"
PREPARED_DIR = BASE / "data" / "prepared"
MODELS_DIR = BASE / "data" / "models"
GB_MODEL_PATH = MODELS_DIR / "freelance_pricer_gb_log1p.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

PREMIUM_SKILLS = [
    "machine learning", "flutter", "kotlin", "data science", "nextjs",
    "react native", "react", "deep learning", "python", "html css",
    "java", "swift", "laravel",
]


def build_features(df, add_derived=True):
    EXCLUDE_COLS = [
        "price_single", "log_price_single",
        "rating_imputed", "has_rating", "has_premium_skill",
        "price_range_width", "has_price_range",
        "title_length", "title_word_count",
        "desc_length", "has_description", "has_urgency", "is_service_based",
        "platform_fastwork", "platform_projects", "platform_sribu",
    ]
    FEATURE_COLS = [c for c in df.columns if c not in EXCLUDE_COLS]

    if add_derived:
        FEATURE_COLS = FEATURE_COLS + ["skill_count", "has_premium_skill"]
        skill_cols = [c for c in df.columns if c.startswith("skill_")]
        skill_count = df[skill_cols].sum(axis=1).values.astype(np.float64)
        df = df.copy()
        df["skill_count"] = skill_count
        df["has_premium_skill"] = 0.0
        for sk in PREMIUM_SKILLS:
            col = "skill_" + sk.replace(" ", "_")
            if col in df.columns:
                df.loc[df[col] == 1, "has_premium_skill"] = 1.0

    X = df[FEATURE_COLS].values.astype(np.float64)
    y = np.log1p(df["price_single"].values.astype(np.float64))
    return X, y, FEATURE_COLS


def proper_split(df):
    from sklearn.model_selection import train_test_split

    kategori_cols = [c for c in df.columns if c.startswith("kategori_")]
    kategori_label = df[kategori_cols].idxmax(axis=1).values
    idx = np.arange(len(df))

    idx_tv, idx_test = train_test_split(
        idx, test_size=0.15, stratify=kategori_label, random_state=RANDOM_SEED
    )
    idx_train, idx_val = train_test_split(
        idx_tv, test_size=0.1765, stratify=kategori_label[idx_tv], random_state=RANDOM_SEED
    )
    return idx_train, idx_val, idx_test


def tune_multiplier(pred_log, y_log, n=80):
    """Grid multiplier optimum pada skala IDR (n=80 agar presisi hingga 0.045)."""
    y_price = np.expm1(y_log)
    base = np.expm1(pred_log)
    best = None
    for mult in np.linspace(0.3, 1.8, n):
        pred = base * mult
        mae = float(np.mean(np.abs(y_price - pred)))
        if best is None or mae < best[1]:
            best = (round(float(mult), 3), mae)
    return best


MARGIN_COMPRESS = 0.7
MARGIN_MIN = 0.15
MARGIN_MAX = 0.60


def main():
    np.random.seed(RANDOM_SEED)

    df = pd.read_csv(INPUT_PATH)
    X, y, feature_cols = build_features(df)
    print(f"Data: {X.shape} fitur={len(feature_cols)}")

    idx_train, idx_val, idx_test = proper_split(df)

    with open(GB_MODEL_PATH, "rb") as f:
        gb = pickle.load(f)
    with open(PREPARED_DIR / "scaler.pkl", "rb") as f:
        ct = pickle.load(f)

    # Kalibrasi pada validation set saja (tidak menyentuh test)
    X_val = X[idx_val]
    y_val = y[idx_val]
    pred_val_log = gb.predict(ct.transform(X_val))

    kategori_cols = [c for c in df.columns if c.startswith("kategori_")]
    kategori_label = df[kategori_cols].idxmax(axis=1).values
    cats = sorted([c.replace("kategori_", "") for c in kategori_cols])

    # Grid multiplier global (perpangkatan halus di sekitar 0.8-1.2)
    def grid(lo, hi, n):
        return np.linspace(lo, hi, n)

    # ---- Multiplier global optimum pada val ----
    mult_global, mae_global = tune_multiplier(pred_val_log, y_val)
    global_clip_p01 = float(np.percentile(np.expm1(y_val), 1))
    global_clip_p99 = float(np.percentile(np.expm1(y_val), 99))
    print(f"Default global: mult={mult_global} clip=[{global_clip_p01:,.0f},{global_clip_p99:,.0f}] mae={mae_global:,.0f}")

    # ---- Kalibrasi per-kategori ----
    per_category = {}
    y_full_price = np.expm1(y)  # clip bounds dari seluruh data (kuantil robust)
    y_val_price = np.expm1(y_val)  # multiplier & margin dari validation
    for cat in cats:
        col = "kategori_" + cat
        m = df[col].values == 1
        vmask = m[idx_val]
        fmask = m
        yc = y_val[vmask]
        pc_price = y_val_price[vmask]
        fc_price = y_full_price[fmask]
        n = int(vmask.sum())
        if n < 20 or pc_price.std() == 0:
            continue
        med = float(np.median(pc_price))

        # Margin asimetris berbasis data nyata (val):
        #   margin_low  = seberapa jauh harga bawah di bawah median (p25)
        #   margin_high = seberapa jauh harga atas di atas median (p75)
        # Dikompres 0.7 & dibatasi agar UI tetap masuk akal.
        p25 = float(np.percentile(pc_price, 25))
        p75 = float(np.percentile(pc_price, 75))
        margin_low = float(np.clip((med - p25) / med * MARGIN_COMPRESS, MARGIN_MIN, MARGIN_MAX)) if med > 0 else MARGIN_MIN
        margin_high = float(np.clip((p75 - med) / med * MARGIN_COMPRESS, MARGIN_MIN, MARGIN_MAX)) if med > 0 else MARGIN_MIN

        # Multiplier optimum per-kategori pada subset val kategori tsb
        predc = pred_val_log[vmask]
        mult_c, mae_c = tune_multiplier(predc, yc)
        # Clip bounds per-kategori dari seluruh data (kuantil p01/p99)
        clip_p01 = float(np.percentile(fc_price, 1))
        clip_p99 = float(np.percentile(fc_price, 99))

        per_category[cat] = {
            "multiplier": mult_c,
            "clip_p01": clip_p01,
            "clip_p99": clip_p99,
            "margin_low": margin_low,
            "margin_high": margin_high,
            "median_actual": med,
            "n_val": n,
        }
        print(f"{cat:<30} mult={mult_c:<6} margin=[{margin_low:.2f},{margin_high:.2f}] clip=[{clip_p01:>8,.0f},{clip_p99:>11,.0f}] med={med:>9,.0f}")

    metadata = {
        "target": "log1p(price_single)",
        "model_kind": "gradient_boosting_log1p",
        "multiplier": mult_global,
        "n_features": len(feature_cols),
        "clipping_bounds": {
            "idr_p01": global_clip_p01,
            "idr_p99": global_clip_p99,
        },
        "range_margin": 0.20,
        "per_category": per_category,
        "test_metrics": None,
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"\nMetadata dengan kalibrasi per-kategori disimpan ke {METADATA_PATH}")

    # Evaluasi test set dengan kalibrasi per-kategori vs default global
    X_test = X[idx_test]
    y_test = y[idx_test]
    pred_test_log = gb.predict(ct.transform(X_test))
    y_test_price = np.expm1(y_test)

    def evaluate(pred_log, y_true, multiplier, clip_min, clip_max):
        pred = np.clip(np.expm1(pred_log) * multiplier, clip_min, clip_max)
        mae = float(np.mean(np.abs(y_true - pred)))
        mape = float(np.mean(np.abs(y_true - pred) / np.maximum(y_true, 1.0)) * 100)
        ss_res = np.sum((y_true - pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        r2 = float(1 - ss_res / max(ss_tot, 1e-12))
        return {"mae_idr": mae, "mape": mape, "r2": r2}

    metrics_global = evaluate(pred_test_log, y_test_price, mult_global, global_clip_p01, global_clip_p99)

    # Per-kategori: pakai multiplier + clip per kategori tiap sampel test
    cat_of_test = [k.replace("kategori_", "") for k in kategori_label[idx_test]]
    pred_cat = np.expm1(pred_test_log).copy()
    for i, k in enumerate(cat_of_test):
        cfg = per_category.get(k)
        if cfg is None:
            cfg = {"multiplier": mult_global, "clip_p01": global_clip_p01, "clip_p99": global_clip_p99}
        pred_cat[i] = np.clip(pred_cat[i] * cfg["multiplier"], cfg["clip_p01"], cfg["clip_p99"])
    metrics_cat = {
        "mae_idr": float(np.mean(np.abs(y_test_price - pred_cat))),
        "mape": float(np.mean(np.abs(y_test_price - pred_cat) / np.maximum(y_test_price, 1.0)) * 100),
    }

    metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    metadata["test_metrics"] = {"global": metrics_global, "per_category": metrics_cat}
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Test metrics (global)     : {metrics_global}")
    print(f"Test metrics (per-cat)    : {metrics_cat}")


if __name__ == "__main__":
    main()