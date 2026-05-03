const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skills.controller');

// GET /api/skills → list semua skill
router.get('/', skillsController.getAllSkills);

// GET /api/skills/popular → skill paling banyak dicari
router.get('/popular', skillsController.getPopularSkills);

module.exports = router;
