// SERVICE MARKET MENGAMBIL DATA TREN DAN KATEGORI DARI ML API
const mlClient = require('../utils/mlClient');

const SKILL_CATEGORY_MAP = {
  'Grafis & Desain': [
    'logo design', 'ui ux design', 'figma', 'branding',
    'animation', 'adobe xd', '3d modeling',
  ],
  'Web dan Pemrograman': [
    'python', 'react', 'laravel', 'javascript', 'nextjs',
    'html css', 'php', 'java', 'kotlin', 'flutter',
    'react native', 'mobile programming', 'website building',
    'website', 'laravel framework', 'wordpress', 'deep learning',
    'machine learning', 'data science', 'data analysis', 'excel',
    'tableau', 'power bi',
  ],
  'Pemasaran & Periklanan': [
    'seo', 'google ads', 'meta ads', 'facebook ads', 'tiktok ads',
    'instagram', 'copywriting', 'content writing',
  ],
  'Penulisan & Penerjemahan': [
    'translation', 'copywriting', 'content writing',
  ],
  'Visual & Audio': [
    'video editing', 'animation', 'after effects',
    'video production',
  ],
  'Lainnya': [
    'python', 'figma', 'seo', 'video editing', 'google ads',
    'content writing', 'data analysis', 'logo design',
  ],
};

// AMBIL DATA KATEGORI DARI ML API
exports.getCategories = async () => {
  const response = await mlClient.get('/categories');
  return response.data;
};

exports.getSkillsByCategory = async (category) => {
  
  let modelSkills = [];
  try {
    const skillsRes = await mlClient.get('/skills');
    modelSkills = skillsRes.data.skills || [];
  } catch (err) {
    console.warn('[Market Service] Gagal ambil skills dari ML API, pakai mapping lokal:', err.message);
  }

  const localMapped = SKILL_CATEGORY_MAP[category] || SKILL_CATEGORY_MAP['Lainnya'] || [];

  let filtered;
  if (modelSkills.length > 0) {
    filtered = localMapped.filter(s =>
      modelSkills.some(ms => ms.toLowerCase() === s.toLowerCase())
    );
    
    if (filtered.length === 0) filtered = localMapped;
  } else {
    filtered = localMapped;
  }

  return {
    category,
    skills: filtered,
    total: filtered.length,
  };
};

exports.getAllSkillsByCategory = async () => {
  let modelSkills = [];
  try {
    const skillsRes = await mlClient.get('/skills');
    modelSkills = skillsRes.data.skills || [];
  } catch (err) {
    console.warn('[Market Service] Gagal ambil skills dari ML API, pakai mapping lokal');
  }

  const result = {};
  for (const [cat, localSkills] of Object.entries(SKILL_CATEGORY_MAP)) {
    if (modelSkills.length > 0) {
      const filtered = localSkills.filter(s =>
        modelSkills.some(ms => ms.toLowerCase() === s.toLowerCase())
      );
      result[cat] = filtered.length > 0 ? filtered : localSkills;
    } else {
      result[cat] = localSkills;
    }
  }

  return result;
};

const stringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const generateStats = (name, index, isJob) => {
  const hash = stringHash(name);
  const rng = (hash % 1000) / 1000;
  
  const baseDemand = Math.floor(2000 - index * 50 + rng * 500);
  const prevDemand = Math.floor(baseDemand * (0.8 + rng * 0.4));
  
  const rateNumber = isJob
    ? Math.floor(15 + rng * 40) / 10
    : Math.floor(5 + rng * 20) * 10;

  return {
    name: name,
    demand: Math.max(100, baseDemand),
    prevDemand: Math.max(80, prevDemand),
    rate: isJob ? `Rp ${rateNumber.toFixed(1).replace('.0', '')}jt` : `Rp ${rateNumber}rb`,
    rateType: isJob ? "per project" : "per hour",
  };
};

const generateTrendData = (dataArray) => {
  const top3 = dataArray.slice(0, 3).map(item => item.name);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return {
    top3,
    history: months.map((m, mIdx) => {
      const dataPoint = { month: m };
      top3.forEach((name, i) => {
        const hash = stringHash(name + m);
        const rng = (hash % 1000) / 1000;
        const base = 1200 - i * 150;
        dataPoint[name] = Math.floor(base + mIdx * 120 + rng * 200);
      });
      return dataPoint;
    })
  };
};

// AMBIL DATA REAL DARI ML API (DIGUNAKAN UNTUK DASHBOARD)
exports.getTrends = async () => {
  try {
    const statsRes = await mlClient.get('/stats');
    const { jobsData, skillsData } = statsRes.data;
    
    return {
      jobsData: jobsData || [],
      skillsData: skillsData || [],
      source: 'ml_model_real_data',
    };
  } catch (error) {
    console.error('[Market Service] Gagal mengambil stats:', error.message);
    return {
      jobsData: [],
      skillsData: [],
      source: 'error',
    };
  }
};
