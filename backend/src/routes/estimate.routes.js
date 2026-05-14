const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimate.controller');

// POST /api/estimates → estimasi harga freelance
router.post('/', estimateController.getPriceEstimate);

module.exports = router;
