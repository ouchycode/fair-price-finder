# Gunakan image Python yang ringan
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements terlebih dahulu (untuk caching)
COPY requirements-runtime.txt requirements.txt ./

# Install dependencies Python (hanya kebutuhan runtime)
RUN pip install --no-cache-dir -r requirements-runtime.txt

# Copy seluruh source code AI
COPY . .

# Environment variables dasar (bisa di-override lewat docker-compose)
ENV HOST=0.0.0.0

# Ekspos port (default 8000, di-override oleh PORT dari environment)
EXPOSE 8000

# Jalankan aplikasi FastAPI menggunakan uvicorn
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]
