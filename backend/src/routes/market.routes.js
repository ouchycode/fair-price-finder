const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// GET API MARKET TRENDS → TREN HARGA PASAR
router.get('/trends', marketController.getTrends);

// GET API MARKET CATEGORIES → DAFTAR KATEGORI JASA
router.get('/categories', marketController.getCategories);

// GET API MARKET SKILLS BY CATEGORY?CATEGORY → SKILLS PER KATEGORI
router.get('/skills-by-category', marketController.getSkillsByCategory);

module.exports = router;

