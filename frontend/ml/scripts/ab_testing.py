"""
A/B Testing untuk membandingkan performa model.
Side Quest - Data Science requirement.
"""

import numpy as np
from scipy import stats


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
        'model_a_mae': round(mae_a, 2),
        'model_b_mae': round(mae_b, 2),
        't_statistic': round(t_stat, 4),
        'p_value': round(p_value, 4),
        'significant': p_value < alpha,
        'winner': 'A' if mae_a < mae_b else 'B'
    }

    print(f"Model A MAE : {result['model_a_mae']:,.0f}")
    print(f"Model B MAE : {result['model_b_mae']:,.0f}")
    print(f"p-value     : {result['p_value']}")
    print(f"Signifikan  : {'Ya' if result['significant'] else 'Tidak'}")
    print(f"Pemenang    : Model {result['winner']}")

    return result
