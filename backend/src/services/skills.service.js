// SERVICE SKILLS - MENGAMBIL DATA SKILL DARI ML API
const mlClient = require('../utils/mlClient');

// AMBIL SEMUA SKILL YANG VALID DARI ML API
exports.getAllSkills = async () => {
  const response = await mlClient.get('/skills');
  return response.data;
};

// AMBIL PLATFORM YANG DIDUKUNG DARI ML API
exports.getPlatforms = async () => {
  const response = await mlClient.get('/platforms');
  return response.data;
};
