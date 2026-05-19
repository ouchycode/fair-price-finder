// SERVICE ESTIMATE - MENERUSKAN REQUEST KE ML API
const mlClient = require('../utils/mlClient');

// PREDIKSI HARGA - FORWARD KE POST /predict DI ML API
exports.estimatePrice = async ({ category, skills, duration }) => {
  const response = await mlClient.post('/predict', {
    category,
    skills,
    duration,
  });
  return response.data;
};

// KONSULTASI HARGA - FORWARD KE POST /consult DI ML API
exports.consultPrice = async ({ category, skills, duration, role }) => {
  const response = await mlClient.post('/consult', {
    category,
    skills,
    duration,
    role: role || 'freelancer',
  });
  return response.data;
};
