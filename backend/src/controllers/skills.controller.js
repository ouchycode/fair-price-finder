// CONTROLLER SKILLS MENANGANI REQUEST DATA SKILL DARI ML API
const skillsService = require('../services/skills.service');

// GET API SKILLS SEMUA SKILL VALID DARI MODEL
exports.getAllSkills = async (req, res, next) => {
  try {
    const data = await skillsService.getAllSkills();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET API SKILLS POPULAR SKILL POPULER (TOP 20 DARI MODEL)
exports.getPopularSkills = async (req, res, next) => {
  try {
    const data = await skillsService.getAllSkills();
    const popular = (data.skills || []).slice(0, 20);
    res.json({ success: true, data: { skills: popular, total: popular.length } });
  } catch (err) {
    next(err);
  }
};

// GET API SKILLS PLATFORMS PLATFORM YANG DIDUKUNG MODEL
exports.getPlatforms = async (req, res, next) => {
  try {
    const data = await skillsService.getPlatforms();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
