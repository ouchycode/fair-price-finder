const axios = require('axios');

/**
 * Kirim request ke ML API untuk mendapat estimasi harga
 */
exports.estimatePrice = async ({ category, skills, duration }) => {
  try {
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';

    const response = await axios.post(`${mlApiUrl}/predict`, {
      category,
      skills,
      duration
    });

    return response.data;
  } catch (err) {
    // Fallback: mock response jika ML API belum ready
    console.warn('ML API tidak tersedia, menggunakan mock response');
    return {
      min_price: 500000,
      max_price: 2000000,
      median_price: 1200000,
      currency: 'IDR',
      note: 'Mock response - ML API belum terhubung'
    };
  }
};

exports.consultPrice = async ({ category, skills, role, duration }) => {
  try {
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';

    const response = await axios.post(`${mlApiUrl}/consult`, {
      category,
      skills,
      role,
      duration
    });

    return response.data;
  } catch (err) {
    // Fallback: mock response jika ML API belum ready
    console.warn('ML API tidak tersedia, menggunakan mock response');
    return {
      min_price: 500000,
      max_price: 2000000,
      median_price: 1200000,
      currency: 'IDR',
      note: 'Mock response - ML API belum terhubung'
    };
  }
};

