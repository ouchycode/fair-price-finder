// AXIOS CLIENT - TERPUSAT UNTUK KOMUNIKASI KE ML API (FASTAPI)
const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

const mlClient = axios.create({
  baseURL: ML_API_URL,
  timeout: 30000, // 30 DETIK - MODEL ML BUTUH WAKTU LOAD
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - LOG SETIAP REQUEST KE ML API
mlClient.interceptors.request.use(
  (config) => {
    console.log(`[ML API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR - TANGKAP ERROR DARI ML API
mlClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      const err = new Error('ML API tidak dapat dijangkau. Pastikan FastAPI berjalan di port 8000.');
      err.statusCode = 503;
      return Promise.reject(err);
    }
    if (error.response) {
      const err = new Error(error.response.data?.detail || 'Error dari ML API');
      err.statusCode = error.response.status;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

module.exports = mlClient;
