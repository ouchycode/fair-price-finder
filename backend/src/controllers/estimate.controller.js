// CONTROLLER ESTIMATE - MENANGANI REQUEST ESTIMASI DAN KONSULTASI HARGA
const estimateService = require('../services/estimate.service');

// POST /api/estimates - ESTIMASI HARGA FREELANCE
exports.getPriceEstimate = async (req, res, next) => {
  try {
    const { category, skills, duration } = req.body;

    // VALIDASI INPUT WAJIB
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        error: 'Validasi gagal',
        message: 'Field "skills" wajib diisi dan harus berupa array',
      });
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) < 1) {
      return res.status(400).json({
        error: 'Validasi gagal',
        message: 'Field "duration" wajib diisi dan harus berupa angka >= 1',
      });
    }

    const result = await estimateService.estimatePrice({ category, skills, duration });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST /api/estimates/consult - KONSULTASI HARGA BERBASIS AI
exports.getConsultation = async (req, res, next) => {
  try {
    const { category, skills, duration, role } = req.body;

    // VALIDASI INPUT WAJIB
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        error: 'Validasi gagal',
        message: 'Field "skills" wajib diisi dan harus berupa array',
      });
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) < 1) {
      return res.status(400).json({
        error: 'Validasi gagal',
        message: 'Field "duration" wajib diisi dan harus berupa angka >= 1',
      });
    }
    if (role && !['freelancer', 'client'].includes(role)) {
      return res.status(400).json({
        error: 'Validasi gagal',
        message: 'Field "role" hanya boleh bernilai "freelancer" atau "client"',
      });
    }

    const result = await estimateService.consultPrice({ category, skills, duration, role });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
