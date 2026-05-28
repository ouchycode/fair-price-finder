// SERVICE ESTIMATE MENERUSKAN REQUEST KE ML API
const mlClient = require('../utils/mlClient');

// PREDIKSI HARGA FORWARD KE POST PREDICT DI ML API
exports.estimatePrice = async ({ category, project_type, skills, duration }) => {
  const response = await mlClient.post('/predict', {
    category,
    project_type,
    skills,
    duration,
  });
  return response.data;
};

// KONSULTASI HARGA FORWARD KE POST CONSULT DI ML API
exports.consultPrice = async ({ category, project_type, skills, duration, role }) => {
  const response = await mlClient.post('/consult', {
    category,
    project_type,
    skills,
    duration,
    role: role || 'freelancer',
  });
  return response.data;
};
