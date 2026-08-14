
const marketService = require('../services/market.service');

// GET API MARKET TRENDS TREN HARGA PASAR DARI ML API
exports.getTrends = async (req, res, next) => {
  try {
    const data = await marketService.getTrends();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET API MARKET CATEGORIES DAFTAR KATEGORI DARI ML MODEL
exports.getCategories = async (req, res, next) => {
  try {
    const data = await marketService.getCategories();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET API MARKET SKILLS BY CATEGORY?CATEGORY — SKILLS PER KATEGORI
exports.getSkillsByCategory = async (req, res, next) => {
  try {
    const { category } = req.query;
    if (!category) {
      // TANPA QUERY PARAM KEMBALIKAN SEMUA KATEGORI DAN SKILL
      const data = await marketService.getAllSkillsByCategory();
      return res.json({ success: true, data });
    }
    const data = await marketService.getSkillsByCategory(category);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

