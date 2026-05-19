// ENTRY POINT - FAIR PRICE FINDER BACKEND API
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// MIDDLEWARE
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use('/api/estimates', require('./routes/estimate.routes'));
app.use('/api/market',    require('./routes/market.routes'));
app.use('/api/skills',    require('./routes/skills.routes'));

// HEALTH CHECK - STATUS BACKEND DAN KONFIGURASI ML API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    project: 'Fair Price Finder',
    team: 'CC26-PSU164',
    environment: process.env.NODE_ENV || 'development',
    ml_api_url: ML_API_URL,
    endpoints: {
      estimates:  'POST /api/estimates',
      consult:    'POST /api/estimates/consult',
      trends:     'GET  /api/market/trends',
      categories: 'GET  /api/market/categories',
      skills:     'GET  /api/skills',
      popular:    'GET  /api/skills/popular',
      platforms:  'GET  /api/skills/platforms',
    },
  });
});

// ERROR HANDLER (WAJIB SETELAH SEMUA ROUTES)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('  Fair Price Finder - Backend API');
  console.log('='.repeat(50));
  console.log(`  Server   : http://localhost:${PORT}`);
  console.log(`  ML API   : ${ML_API_URL}`);
  console.log(`  Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health   : http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('');
});

module.exports = app;
