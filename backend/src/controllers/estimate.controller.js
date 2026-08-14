
const estimateService = require('../services/estimate.service');

// POST API ESTIMATES ESTIMASI HARGA FREELANCE
exports.getPriceEstimate = async (req, res, next) => {
  try {
    const { category, project_type, skills, duration } = req.body;

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

    const result = await estimateService.estimatePrice({ category, project_type, skills, duration });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// POST API ESTIMATES CONSULT KONSULTASI HARGA BERBASIS AI
exports.getConsultation = async (req, res, next) => {
  try {
    const { category, project_type, skills, duration, role } = req.body;

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

    const result = await estimateService.consultPrice({ category, project_type, skills, duration, role });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
