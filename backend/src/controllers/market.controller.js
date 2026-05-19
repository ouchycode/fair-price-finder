// CONTROLLER MARKET - MENANGANI REQUEST DATA PASAR DAN KATEGORI
const marketService = require('../services/market.service');

// GET /api/market/trends - TREN HARGA PASAR DARI ML API
exports.getTrends = async (req, res, next) => {
  try {
    const data = await marketService.getTrends();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/market/categories - DAFTAR KATEGORI DARI ML MODEL
exports.getCategories = async (req, res, next) => {
  try {
    const data = await marketService.getCategories();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
