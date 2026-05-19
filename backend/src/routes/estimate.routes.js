// ROUTES ESTIMATE - ESTIMASI DAN KONSULTASI HARGA
const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimate.controller');

// POST /api/estimates - ESTIMASI HARGA FREELANCE
router.post('/', estimateController.getPriceEstimate);

// POST /api/estimates/consult - KONSULTASI HARGA DENGAN AI
router.post('/consult', estimateController.getConsultation);

module.exports = router;
