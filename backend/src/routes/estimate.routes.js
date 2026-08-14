
const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimate.controller');

// POST API ESTIMATES ESTIMASI HARGA FREELANCE
router.post('/', estimateController.getPriceEstimate);

// POST API ESTIMATES CONSULT KONSULTASI HARGA DENGAN AI
router.post('/consult', estimateController.getConsultation);

module.exports = router;
