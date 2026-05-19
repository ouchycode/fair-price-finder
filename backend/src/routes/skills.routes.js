// ROUTES SKILLS - DATA SKILL DARI ML API
const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');

// GET /api/skills - SEMUA SKILL VALID DARI MODEL
router.get('/', skillsController.getAllSkills);

// GET /api/skills/popular - SKILL PALING POPULER (TOP 20)
router.get('/popular', skillsController.getPopularSkills);

// GET /api/skills/platforms - PLATFORM YANG DIDUKUNG
router.get('/platforms', skillsController.getPlatforms);

module.exports = router;
