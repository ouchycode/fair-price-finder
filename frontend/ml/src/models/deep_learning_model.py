"""
Model Deep Learning - Price Prediction
Menggunakan TensorFlow Functional API (sesuai requirement Main Quest).
Digunakan oleh: AI Engineer
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np


# ─────────────────────────────────────────────
# CUSTOM LAYER (Main Quest requirement)
# ─────────────────────────────────────────────
class PriceNormalizationLayer(layers.Layer):
    """Custom layer untuk normalisasi fitur harga secara adaptif."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        self.scale = self.add_weight(
            name='scale', shape=(input_shape[-1],),
            initializer='ones', trainable=True
        )
        self.bias = self.add_weight(
            name='bias', shape=(input_shape[-1],),
            initializer='zeros', trainable=True
        )

    def call(self, inputs):
        return inputs * self.scale + self.bias

    def get_config(self):
        return super().get_config()


# ─────────────────────────────────────────────
# CUSTOM LOSS FUNCTION (Main Quest requirement)
# ─────────────────────────────────────────────
class WeightedMAELoss(keras.losses.Loss):
    """
    Custom loss: MAE dengan penalti lebih besar untuk underprice.
    Underpricing (prediksi < aktual) lebih merugikan freelancer.
    """

    def __init__(self, underestimate_penalty=1.5, **kwargs):
        super().__init__(**kwargs)
        self.underestimate_penalty = underestimate_penalty

    def call(self, y_true, y_pred):
        error = y_true - y_pred
        weight = tf.where(error > 0, self.underestimate_penalty, 1.0)
        return tf.reduce_mean(weight * tf.abs(error))

    def get_config(self):
        return {**super().get_config(), 'underestimate_penalty': self.underestimate_penalty}


# ─────────────────────────────────────────────
# CUSTOM CALLBACK (Main Quest requirement)
# ─────────────────────────────────────────────
class PriceModelCallback(keras.callbacks.Callback):
    """
    Custom callback untuk logging metrik tiap epoch
    dan menyimpan best model otomatis.
    """

    def __init__(self, log_dir='../../ml/logs'):
        super().__init__()
        self.log_dir = log_dir
        self.best_val_mae = float('inf')

    def on_epoch_end(self, epoch, logs=None):
        val_mae = logs.get('val_mae', float('inf'))
        print(f"\n[Epoch {epoch+1}] MAE: {logs.get('mae'):.4f} | Val MAE: {val_mae:.4f}")

        if val_mae < self.best_val_mae:
            self.best_val_mae = val_mae
            self.model.save('../../ml/saved_models/best_model.keras')
            print(f"  ✅ Model terbaik disimpan (val_mae={val_mae:.4f})")

    def on_train_end(self, logs=None):
        print(f"\n🏁 Training selesai. Best Val MAE: {self.best_val_mae:.4f}")


# ─────────────────────────────────────────────
# MODEL ARCHITECTURE - Functional API
# ─────────────────────────────────────────────
def build_model(input_dim: int) -> keras.Model:
    """
    Bangun model prediksi harga menggunakan Functional API.

    Args:
        input_dim: jumlah fitur input (kategori + skills + durasi)
    Returns:
        model keras Functional API siap dilatih
    """
    inputs = keras.Input(shape=(input_dim,), name='features')

    # Custom normalization layer
    x = PriceNormalizationLayer(name='price_norm')(inputs)

    # Deep layers
    x = layers.Dense(256, name='dense_1')(x)
    x = layers.BatchNormalization(name='bn_1')(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.3, name='dropout_1')(x)

    x = layers.Dense(128, name='dense_2')(x)
    x = layers.BatchNormalization(name='bn_2')(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.2, name='dropout_2')(x)

    x = layers.Dense(64, activation='relu', name='dense_3')(x)

    # Output: estimasi harga (regresi)
    output = layers.Dense(1, name='price_output')(x)

    model = keras.Model(inputs=inputs, outputs=output, name='FairPriceModel')

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss=WeightedMAELoss(underestimate_penalty=1.5),
        metrics=['mae', 'mse']
    )
    return model


# ─────────────────────────────────────────────
# TRAINING
# ─────────────────────────────────────────────
def train_model(model, X_train, y_train, X_val, y_val, epochs=100, log_dir='../../ml/logs'):
    """Latih model dengan callback lengkap."""
    callbacks = [
        PriceModelCallback(log_dir=log_dir),
        keras.callbacks.EarlyStopping(monitor='val_mae', patience=10, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(monitor='val_mae', patience=5, factor=0.5),
        keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1),  # Side Quest
    ]

    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=32,
        callbacks=callbacks
    )
    return history


# ─────────────────────────────────────────────
# CUSTOM TRAINING LOOP - tf.GradientTape (Side Quest)
# ─────────────────────────────────────────────
def train_with_gradient_tape(model, X_train, y_train, X_val, y_val, epochs=50):
    """
    Training loop kustom dari awal menggunakan tf.GradientTape.
    Side Quest requirement.
    """
    optimizer = keras.optimizers.Adam(learning_rate=1e-3)
    loss_fn = WeightedMAELoss(underestimate_penalty=1.5)

    train_dataset = tf.data.Dataset.from_tensor_slices((X_train, y_train)).batch(32)

    for epoch in range(epochs):
        epoch_loss = []

        for X_batch, y_batch in train_dataset:
            with tf.GradientTape() as tape:
                y_pred = model(X_batch, training=True)
                loss = loss_fn(y_batch, y_pred)

            grads = tape.gradient(loss, model.trainable_variables)
            optimizer.apply_gradients(zip(grads, model.trainable_variables))
            epoch_loss.append(loss.numpy())

        val_pred = model(X_val, training=False)
        val_loss = loss_fn(y_val, val_pred).numpy()
        print(f"[GradientTape] Epoch {epoch+1}/{epochs} | Loss: {np.mean(epoch_loss):.4f} | Val Loss: {val_loss:.4f}")


# ─────────────────────────────────────────────
# SAVE & INFERENCE
# ─────────────────────────────────────────────
def save_model(model, path: str = '../../ml/saved_models/price_model.keras'):
    """Simpan model dalam format .keras (production-ready)."""
    model.save(path)
    print(f"✅ Model disimpan ke {path}")


def load_and_infer(model_path: str, input_features: list) -> dict:
    """
    Inference sederhana: load model dan prediksi harga.

    Args:
        model_path: path ke file .keras
        input_features: list fitur numerik hasil preprocessing

    Returns:
        dict dengan estimasi harga min/median/max
    """
    model = keras.models.load_model(
        model_path,
        custom_objects={
            'PriceNormalizationLayer': PriceNormalizationLayer,
            'WeightedMAELoss': WeightedMAELoss
        }
    )

    features = np.array([input_features])
    prediction = model.predict(features)[0][0]

    # Estimasi range ±20%
    return {
        'min_price': round(prediction * 0.80),
        'median_price': round(prediction),
        'max_price': round(prediction * 1.20),
        'currency': 'IDR'
    }
