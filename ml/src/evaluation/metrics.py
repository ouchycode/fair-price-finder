"""
Evaluasi performa model prediksi harga.
"""

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np


def evaluate_model(y_true, y_pred):
    """Hitung metrik evaluasi regresi."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100

    print(f"MAE  : {mae:,.0f}")
    print(f"RMSE : {rmse:,.0f}")
    print(f"R²   : {r2:.4f}")
    print(f"MAPE : {mape:.2f}%")

    return {'mae': mae, 'rmse': rmse, 'r2': r2, 'mape': mape}
