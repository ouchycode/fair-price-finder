const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// GET /api/market/trends → tren harga pasar
router.get('/trends', marketController.getTrends);

// GET /api/market/categories → daftar kategori jasa
router.get('/categories', marketController.getCategories);

module.exports = router;
