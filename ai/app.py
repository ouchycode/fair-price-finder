# ============================================================================
# FASTAPI APP - Fair Price Finder
# 
# REST API untuk prediksi harga adil freelance project
# ============================================================================

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
try:
    from pydantic import BaseModel, Field, ConfigDict
except ImportError:
    from pydantic import BaseModel, Field
    ConfigDict = None
from typing import List, Optional, Literal, Dict, Any
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name('.env'), override=True)

from inference import (
    InferenceService,
    get_valid_skills,
    get_valid_categories,
    get_valid_platforms,
    MODEL_LOADED,
)
from consultation import ConsultationService


# ============================================================================
# 1. APP INITIALIZATION
# ============================================================================

app = FastAPI(
    title='Fair Price Finder API',
    description='REST API untuk prediksi harga adil freelance project Indonesia',
    version='1.0',
    contact={'name': 'Tim CC26-PSU164'}
)

# Allow CORS untuk frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_service = InferenceService()
consultation_service = ConsultationService()


# ============================================================================
# 2. PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================

class APIBaseModel(BaseModel):
    if ConfigDict is not None:
        model_config = ConfigDict(populate_by_name=True, extra='ignore')
    else:
        class Config:
            allow_population_by_field_name = True
            extra = 'ignore'


class SimplePredictionRequest(APIBaseModel):
    """User cuma kasih skills + durasi (MVP)."""
    skills: List[str] = Field(..., min_length=1, description='List skills')
    kategori: Optional[str] = Field(default=None, alias='category', description='Kategori proyek (opsional)')
    durasi_hari: int = Field(..., alias='duration', ge=1, le=365, description='Durasi pengerjaan (1-365 hari)')

    class Config:
        json_schema_extra = {
            'example': {
                'skills': ['figma', 'ui ux design'],
                'durasi_hari': 14,
                'category': 'Grafis & Desain'
            }
        }


class SimplePredictionResponse(APIBaseModel):
    """Response untuk simple prediction."""
    predicted_price: int
    price_min: int
    price_max: int
    min_price: int
    max_price: int
    median_price: int
    detected_category: Optional[str] = ""
    currency: str = 'IDR'
    confidence: str = 'medium'


class FullPredictionRequest(APIBaseModel):
    """Full input untuk advanced use case."""
    kategori: str = Field(..., alias='category')
    platform: str = 'fastwork'
    durasi_hari: int = Field(..., alias='duration', ge=1, le=365)
    skills: List[str] = Field(default_factory=list)
    has_rating: bool = True
    title_length: int = 50
    desc_length: int = 0
    has_urgency: bool = False


class ConsultationRequest(APIBaseModel):
    """Request untuk konsultasi harga."""
    skills: List[str] = Field(..., min_length=1, description='List skills')
    kategori: Optional[str] = Field(default=None, alias='category')
    durasi_hari: int = Field(..., alias='duration', ge=1, le=365, description='Durasi pengerjaan')
    role: Literal['freelancer', 'client'] = Field('freelancer', description="'freelancer' atau 'client'")

    class Config:
        json_schema_extra = {
            'example': {
                'skills': ['flutter'],
                'durasi_hari': 30,
                'role': 'freelancer',
                'category': 'Web dan Pemrograman'
            }
        }


class ConsultationResponse(BaseModel):
    """Response untuk konsultasi harga."""
    consultation: str
    predicted_price: int
    price_min: int
    price_max: int
    min_price: int
    max_price: int
    median_price: int
    detected_category: Optional[str] = ""
    currency: str = 'IDR'


class HealthResponse(BaseModel):
    """Response untuk health check."""
    status: str
    model_loaded: bool
    groq_available: bool
    timestamp: str


def format_prediction_response(result: Dict[str, Any], detected_category: Optional[str] = None) -> Dict[str, Any]:
    """Normalize output model agar frontend dan backend dapat field yang sama."""
    predicted_price = int(result['predicted_price'])
    price_min = int(result.get('price_min', result.get('min_price', predicted_price)))
    price_max = int(result.get('price_max', result.get('max_price', predicted_price)))
    detected_category = detected_category or result.get('detected_category') or ""

    return {
        'predicted_price': predicted_price,
        'price_min': price_min,
        'price_max': price_max,
        'min_price': price_min,
        'max_price': price_max,
        'median_price': predicted_price,
        'detected_category': detected_category,
        'currency': result.get('currency', 'IDR'),
        'confidence': result.get('confidence', 'medium'),
    }


def format_consultation_response(result: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize response konsultasi supaya mudah dipakai frontend."""
    prediction_part = format_prediction_response(result, result.get('detected_category'))
    return {
        'consultation': result['consultation'],
        **prediction_part,
    }


# ============================================================================
# 3. ENDPOINTS
# ============================================================================

@app.get('/')
def root():
    """Root endpoint - info tentang API."""
    model_status = inference_service.get_model_status()
    return {
        'service': 'Fair Price Finder API',
        'version': '1.0',
        'status': 'online',
        'team': 'CC26-PSU164',
        'docs': '/docs',
        'model_status': 'loaded' if model_status['loaded'] else 'failed',
        'model_name': model_status['model_name'],
        'description': 'REST API untuk prediksi harga adil freelance project Indonesia'
    }


@app.get('/health', response_model=HealthResponse)
def health():
    """Health check endpoint."""
    from datetime import datetime
    groq_status = consultation_service.get_groq_status()
    return {
        'status': 'healthy',
        'model_loaded': MODEL_LOADED,
        'groq_available': groq_status['ready'],
        'model': inference_service.get_model_status(),
        'timestamp': datetime.utcnow().isoformat()
    }


@app.post('/predict', response_model=SimplePredictionResponse)
def predict(request: SimplePredictionRequest):
    """
    Endpoint prediksi sederhana untuk frontend.
    User cuma kasih skills + durasi.
    
    ### Example Request
    ```json
    {
        "skills": ["figma", "ui ux design"],
        "durasi_hari": 14
    }
    ```
    
    ### Example Response
    ```json
    {
        "predicted_price": 850000,
        "price_min": 680000,
        "price_max": 1020000,
        "detected_category": "Grafis & Desain",
        "currency": "IDR"
    }
    ```
    """
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded. Please check server logs.")
    
    try:
        result = inference_service.predict_price_simple(
            skills=request.skills,
            durasi_hari=request.durasi_hari,
            kategori=request.kategori,
        )
        return format_prediction_response(result, result.get('detected_category'))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post('/predict_advanced')
def predict_advanced(request: FullPredictionRequest):
    """
    Advanced prediction endpoint dengan full control input.
    
    Gunakan endpoint ini jika ingin specify semua parameter detail.
    """
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded. Please check server logs.")
    
    try:
        payload = request.model_dump(by_alias=False) if hasattr(request, 'model_dump') else request.dict()
        result = inference_service.predict_price(payload)
        return format_prediction_response(result, payload.get('kategori'))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post('/consult', response_model=ConsultationResponse)
def consult(request: ConsultationRequest):
    """
    Endpoint konsultasi harga berbasis prediksi model dan Groq.
    
    ### Example Request (Freelancer)
    ```json
    {
        "skills": ["flutter"],
        "durasi_hari": 30,
        "role": "freelancer"
    }
    ```
    
    ### Example Request (Client dengan offer)
    ```json
    {
        "skills": ["flutter"],
        "durasi_hari": 30,
        "role": "client"
    }
    ```
    """
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded. Please check server logs.")
    
    try:
        pred = inference_service.predict_price_simple(
            request.skills,
            request.durasi_hari,
            kategori=request.kategori,
        )
        consultation_text = consultation_service.generate_groq_consultation(
            role=request.role,
            skills=request.skills,
            durasi_hari=request.durasi_hari,
            predicted_price=pred['predicted_price'],
            price_min=pred['price_min'],
            price_max=pred['price_max'],
            category=request.kategori or pred.get('detected_category'),
        )
        
        return format_consultation_response({
            'consultation': consultation_text,
            **pred,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Consultation error: {str(e)}")


@app.get('/skills')
def get_skills():
    """List valid skills untuk frontend dropdown."""
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    
    skills = get_valid_skills()
    return {
        'skills': skills,
        'total': len(skills)
    }


@app.get('/categories')
def get_categories():
    """List valid categories untuk frontend dropdown."""
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    
    categories = get_valid_categories()
    return {
        'categories': categories,
        'total': len(categories)
    }


@app.get('/platforms')
def get_platforms():
    """List valid platforms."""
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    
    platforms = get_valid_platforms()
    return {
        'platforms': platforms,
        'total': len(platforms)
    }


@app.get('/status')
def get_status():
    """Get detailed status tentang API dan dependencies."""
    groq_status = consultation_service.get_groq_status()
    
    return {
        'api': 'operational',
        'model': 'loaded' if MODEL_LOADED else 'failed',
        'model_details': inference_service.get_model_status(),
        'groq': {
            'library_installed': groq_status['groq_library_installed'],
            'api_key_configured': groq_status['groq_api_key_set'],
            'ready': groq_status['ready']
        },
        'endpoints': {
            '/docs': 'Interactive API documentation (Swagger UI)',
            '/predict': 'Main prediction endpoint',
            '/predict_advanced': 'Advanced prediction with full parameters',
            '/consult': 'Consultation endpoint',
            '/skills': 'List available skills',
            '/categories': 'List available categories',
            '/platforms': 'List available platforms',
        }
    }


# ============================================================================
# 4. ERROR HANDLERS
# ============================================================================

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    return JSONResponse(
        status_code=500,
        content={
            'error': str(exc),
            'type': type(exc).__name__,
        },
    )


# ============================================================================
# 5. STARTUP/SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Log ketika API startup."""
    print("\n" + "="*60)
    print("Fair Price Finder API starting")
    print("="*60)
    print(f"Model loaded: {MODEL_LOADED}")
    
    groq_status = consultation_service.get_groq_status()
    print(f"Groq available: {groq_status['ready']}")
    
    print("API ready for requests")
    print("API Docs: http://localhost:8000/docs")
    print("="*60 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Log ketika API shutdown."""
    print("\n🛑 Fair Price Finder API Shutting down...")


# ============================================================================
# 6. MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Get config dari environment atau default
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    
    print(f"\n🌐 Starting API server on {HOST}:{PORT}")
    
    uvicorn.run(
        "app:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
        log_level="info"
    )
