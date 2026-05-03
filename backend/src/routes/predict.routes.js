const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predict.controller');

// POST /api/predict → estimasi harga freelance
router.post('/', predictController.getPriceEstimate);

module.exports = router;
