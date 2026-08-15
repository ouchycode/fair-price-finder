"""
Retrain price model experiment
Membandingkan:
  A. Neural Network (arsitektur lama) pada target log1p(price_single)
  B. Gradient Boosting (HistGradientBoostingRegressor) pada target log1p(price_single)
Metrik dievaluasi pada skala IDR asli (expm1), + kalibrasi multiplier optimum.
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

OUTPUT_MODEL_JSON = MODELS_DIR / "retrain_candidates.json"

CLIP_MIN_IDR = 50_000.0
CLIP_MAX_IDR = 4_500_000.0


# Skills berharga tinggi (premium) diturunkan dari data training.
PREMIUM_SKILLS = [
    "machine learning", "flutter", "kotlin", "data science", "nextjs",
    "react native", "react", "deep learning", "python", "html css",
    "java", "swift", "laravel",
]


def build_features(df, add_derived=True):
    """Reproduksi fitur persis seperti notebook 01 + 2 fitur derivable.

    Fitur derivable dihitung dari skill yang dipilih user (bukan input baru):
      - skill_count        : banyaknya skill yang dipilih
      - has_premium_skill  : 1 jika ada skill premium dalam pilihan
    """
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
    """Split stratified by kategori, konsisten dengan notebook 01."""
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


def metrics_in_idr(y_price, pred_price):
    mae = float(np.mean(np.abs(y_price - pred_price)))
    mape = float(np.mean(np.abs(y_price - pred_price) / np.maximum(y_price, 1.0)) * 100)
    ss_res = np.sum((y_price - pred_price) ** 2)
    ss_tot = np.sum((y_price - np.mean(y_price)) ** 2)
    r2 = float(1 - ss_res / max(ss_tot, 1e-12))
    return {"mae_idr": mae, "mape": mape, "r2": r2}


def eval_with_multiplier(pred_log, y_log, mult):
    """Evaluasi pada skala IDR: price = clip(expm1(pred_log) * mult)."""
    y_price = np.expm1(y_log)
    pred_price = np.clip(np.expm1(pred_log) * mult, CLIP_MIN_IDR, CLIP_MAX_IDR)
    return metrics_in_idr(y_price, pred_price)


def tune_multiplier(pred_log, y_log, n=24):
    """Cari multiplier optimum via grid pada skala IDR."""
    y_price = np.expm1(y_log)
    base = np.expm1(pred_log)
    best = None
    for mult in np.linspace(0.4, 6.0, n):
        pred = np.clip(base * mult, CLIP_MIN_IDR, CLIP_MAX_IDR)
        mae = float(np.mean(np.abs(y_price - pred)))
        if best is None or mae < best[1]:
            best = (round(float(mult), 3), mae)
    return best


def train_nn(X_train, y_train, X_val, y_val):
    import tensorflow as tf
    from tensorflow.keras import Model, layers, regularizers, callbacks

    tf.random.set_seed(RANDOM_SEED)

    inputs = tf.keras.Input(shape=(X_train.shape[1],), name="features")
    x = layers.Dense(128, activation="swish",
                     kernel_regularizer=regularizers.l2(1e-5))(inputs)
    x = layers.Dropout(0.15)(x)
    x = layers.Dense(64, activation="swish",
                     kernel_regularizer=regularizers.l2(1e-5))(x)
    x = layers.Dropout(0.1)(x)
    x = layers.Dense(32, activation="relu")(x)
    outputs = layers.Dense(1, activation="linear", name="price_output")(x)
    model = Model(inputs=inputs, outputs=outputs)

    model.compile(
        optimizer=tf.keras.optimizers.AdamW(
            learning_rate=1e-3, weight_decay=1e-4, clipnorm=1.0
        ),
        loss="mse",
        metrics=["mae"],
    )

    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=120,
        batch_size=32,
        callbacks=[
            callbacks.EarlyStopping(
                monitor="val_loss", patience=20, restore_best_weights=True,
                min_delta=1e-5, verbose=0
            ),
            callbacks.ReduceLROnPlateau(
                monitor="val_loss", factor=0.5, patience=8, min_lr=1e-6
            ),
        ],
        verbose=0,
    )
    return model


def main():
    np.random.seed(RANDOM_SEED)

    df = pd.read_csv(INPUT_PATH)
    X, y, feature_cols = build_features(df)
    print(f"Data: {X.shape} fitur={len(feature_cols)}")

    idx_train, idx_val, idx_test = proper_split(df)
    print(f"Train {len(idx_train)} / Val {len(idx_val)} / Test {len(idx_test)}")

    X_train, X_val, X_test = X[idx_train], X[idx_val], X[idx_test]
    y_train, y_val, y_test = y[idx_train], y[idx_val], y[idx_test]

    from sklearn.preprocessing import StandardScaler
    from sklearn.compose import ColumnTransformer

    durasi_idx = feature_cols.index("durasi_hari")
    continuous_idx = [i for i, c in enumerate(feature_cols)
                      if c in ("durasi_hari", "skill_count")]
    binary_idx = [i for i in range(len(feature_cols)) if i not in continuous_idx]
    ct = ColumnTransformer([
        ("scale", StandardScaler(), continuous_idx),
        ("pass", "passthrough", binary_idx),
    ])
    X_train_s = ct.fit_transform(X_train)
    X_val_s = ct.transform(X_val)
    X_test_s = ct.transform(X_test)

    results = {}

    # ---- Model A: NN ----
    nn = train_nn(X_train_s, y_train, X_val_s, y_val)
    pred_val_log = nn.predict(X_val_s, verbose=0).ravel()
    mult_nn, _ = tune_multiplier(pred_val_log, y_val)
    pred_test_log = nn.predict(X_test_s, verbose=0).ravel()
    results["nn"] = {
        "multiplier": mult_nn,
        "metrics": eval_with_multiplier(pred_test_log, y_test, mult_nn),
    }
    print(f"NN  : mult={mult_nn} -> {results['nn']['metrics']}")

    # ---- Model B: Gradient Boosting ----
    from sklearn.ensemble import HistGradientBoostingRegressor

    gb = HistGradientBoostingRegressor(
        max_iter=400, learning_rate=0.05, max_depth=None, random_state=RANDOM_SEED,
        early_stopping=True, validation_fraction=0.15, n_iter_no_change=30,
    )
    gb.fit(X_train_s, y_train)
    pred_val_log = gb.predict(X_val_s)
    mult_gb, _ = tune_multiplier(pred_val_log, y_val)
    pred_test_log = gb.predict(X_test_s)
    results["gradient_boosting"] = {
        "multiplier": mult_gb,
        "metrics": eval_with_multiplier(pred_test_log, y_test, mult_gb),
    }
    print(f"GB  : mult={mult_gb} -> {results['gradient_boosting']['metrics']}")

    OUTPUT_MODEL_JSON.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nHasil eksperimen disimpan ke {OUTPUT_MODEL_JSON}")

    winner = min(results, key=lambda k: results[k]["metrics"]["mae_idr"])
    chosen_multiplier = results[winner]["multiplier"]
    print(f"\nPemenang: {winner} (mult={chosen_multiplier})")

    if winner == "nn":
        nn.save(str(MODELS_DIR / "freelance_pricer_final.keras"))
        nn.export(str(MODELS_DIR / "freelance_pricer_savedmodel"))
        MODEL_KIND = "keras_nn_log1p"
    else:
        (MODELS_DIR / "freelance_pricer_gb_log1p.pkl").write_bytes(pickle.dumps(gb))
        MODEL_KIND = "gradient_boosting_log1p"

    with open(PREPARED_DIR / "scaler.pkl", "wb") as f:
        pickle.dump(ct, f)
    with open(PREPARED_DIR / "feature_names.pkl", "wb") as f:
        pickle.dump(feature_cols, f)

    metadata = {
        "target": "log1p(price_single)",
        "model_kind": MODEL_KIND,
        "multiplier": chosen_multiplier,
        "n_features": len(feature_cols),
        "test_metrics": results[winner]["metrics"],
        "clipping_bounds": {
            "idr_p01": CLIP_MIN_IDR,
            "idr_p99": CLIP_MAX_IDR,
        },
    }
    (MODELS_DIR / "model_metadata.json").write_text(
        json.dumps(metadata, indent=2), encoding="utf-8"
    )
    print("Metadata, scaler, feature_names disimpan.")


if __name__ == "__main__":
    main()