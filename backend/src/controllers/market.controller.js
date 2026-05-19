const estimateService = require('../services/estimate.service');
const marketService = require('../services/market.service');
exports.getTrends = async (req, res) => {
  // TODO: ambil dari DB / ML output
  res.json({ message: 'Market trends endpoint', data: [] });
};

exports.getCategories = async (req, res) => {
  try {
    const result = await marketService.getCategories();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil daftar kategori' });
  }
};
