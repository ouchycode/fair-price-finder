// ROUTES SKILLS DATA SKILL DARI ML API
const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');

// GET API SKILLS SEMUA SKILL VALID DARI MODEL
router.get('/', skillsController.getAllSkills);

// GET API SKILLS POPULAR SKILL PALING POPULER (TOP 20)
router.get('/popular', skillsController.getPopularSkills);

// GET API SKILLS PLATFORMS PLATFORM YANG DIDUKUNG
router.get('/platforms', skillsController.getPlatforms);

module.exports = router;
