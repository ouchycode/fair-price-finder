"""
Standalone REST API untuk serving model ML.
Framework: FastAPI (Side Quest requirement)
Digunakan oleh: AI Engineer
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
import os
import sys
from pathlib import Path

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(
    title="Fair Price Finder - ML API",
    description="REST API untuk prediksi harga jasa freelance",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model saat startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    # Keep the original model filename used by Notebook 02
    model_path = Path(__file__).resolve().parents[1] / "data" / "models" / "best_model_fit.keras"
    try:
        import tensorflow as tf
        from src.models.deep_learning_model import PriceNormalizationLayer, WeightedMAELoss
        model = tf.keras.models.load_model(
            str(model_path),
            custom_objects={
                'PriceNormalizationLayer': PriceNormalizationLayer,
                'WeightedMAELoss': WeightedMAELoss
            }
        )
        print(f"✅ Model berhasil dimuat: {model_path.name}")
    except Exception as e:
        print(f"⚠️ Model belum tersedia: {e}")


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────
class PredictRequest(BaseModel):
    category: str
    skills: List[str]
    duration: int  # dalam hari

class PredictResponse(BaseModel):
    min_price: float
    median_price: float
    max_price: float
    currency: str = "IDR"
    confidence: float = 0.0


# ─────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────
@app.post("/predict", response_model=PredictResponse)
async def predict_price(request: PredictRequest):
    """Prediksi estimasi harga jasa freelance."""
    if model is None:
        raise HTTPException(status_code=503, detail="Model belum dimuat")

    try:
        # TODO: gunakan preprocessor nyata setelah model dilatih
        # features = preprocess(request.category, request.skills, request.duration)
        # prediction = model.predict(np.array([features]))[0][0]
        raise NotImplementedError("Sambungkan ke preprocessing pipeline")

    except NotImplementedError:
        # Mock fallback untuk development
        return PredictResponse(
            min_price=500000,
            median_price=1200000,
            max_price=2500000,
            confidence=0.0
        )


@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "model_loaded": model is not None,
        "project": "Fair Price Finder - CC26-PSU164"
    }


@app.get("/model/info")
def model_info():
    """Informasi model yang sedang dipakai."""
    if model is None:
        return {"status": "Model belum dimuat"}
    return {
        "name": model.name,
        "input_shape": str(model.input_shape),
        "total_params": model.count_params()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
