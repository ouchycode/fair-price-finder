# Gunakan image Python yang ringan
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements terlebih dahulu (untuk caching)
COPY requirements.txt .

# Install dependencies Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh source code AI
COPY . .

# Cloud Run secara otomatis mengirimkan environment variable PORT (default 8080)
ENV HOST=0.0.0.0
ENV PORT=8080

# Ekspos port
EXPOSE 8080

# Jalankan aplikasi FastAPI
CMD ["python", "app.py"]
