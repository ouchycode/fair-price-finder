// MIDDLEWARE ERROR HANDLER - TERPUSAT UNTUK SEMUA ROUTE
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[ERROR] ${req.method} ${req.path} → ${statusCode}: ${err.message}`);

  // PESAN RAMAH UNTUK ERROR KONEKSI KE ML API
  if (err.code === 'ECONNREFUSED' || statusCode === 503) {
    return res.status(503).json({
      success: false,
      error: 'ML API tidak tersedia',
      message: 'Pastikan FastAPI (AI service) berjalan di port 8000. Jalankan: uvicorn app:app --reload',
    });
  }

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : err.message,
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

module.exports = errorHandler;
