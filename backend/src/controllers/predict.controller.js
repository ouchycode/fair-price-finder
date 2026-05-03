const predictService = require('../services/predict.service');

exports.getPriceEstimate = async (req, res) => {
  try {
    const { category, skills, duration } = req.body;

    if (!category || !skills || !duration) {
      return res.status(400).json({ error: 'category, skills, dan duration wajib diisi' });
    }

    const result = await predictService.estimatePrice({ category, skills, duration });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memproses prediksi harga' });
  }
};
