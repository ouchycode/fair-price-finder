const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');

// GET TREN HARGA PASAR
router.get('/trends', marketController.getTrends);

// GET DAFTAR KATEGORI JASA
router.get('/categories', marketController.getCategories);

// GET SKILLS PER KATEGORI
router.get('/skills-by-category', marketController.getSkillsByCategory);

module.exports = router;

