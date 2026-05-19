const axios = require('axios');

/**
 * Kirim request ke ML API untuk mendapat estimasi harga
 */

exports.getCategories = async (req, res) => {
  try {
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';

    const response = await axios.get(`${mlApiUrl}/categories`);

    return response.data;
  } catch (err) {
    // Fallback: mock response jika ML API belum ready
    console.warn('ML API tidak tersedia, menggunakan mock response');
    return ['Web Development', 'Mobile Development', 'UI/UX Design'];
  }
};
