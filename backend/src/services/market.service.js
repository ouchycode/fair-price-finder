// SERVICE MARKET - MENGAMBIL DATA TREN DAN KATEGORI DARI ML API
const mlClient = require('../utils/mlClient');

// AMBIL DATA KATEGORI DARI ML API
exports.getCategories = async () => {
  const response = await mlClient.get('/categories');
  return response.data;
};

// AMBIL DATA SKILL POPULER DARI ML API (DIGUNAKAN UNTUK TREN)
exports.getTrends = async () => {
  const [categoriesRes, skillsRes] = await Promise.all([
    mlClient.get('/categories'),
    mlClient.get('/skills'),
  ]);

  const categories = categoriesRes.data.categories || [];
  const skills = skillsRes.data.skills || [];

  // BENTUK DATA TREN BERDASARKAN KATEGORI DAN SKILL DARI MODEL
  return {
    categories,
    top_skills: skills,
    total_categories: categories.length,
    total_skills: skills.length,
    source: 'ml_model',
  };
};
