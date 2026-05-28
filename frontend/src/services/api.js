import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

export const estimatePrice = (payload) => API.post('/estimates', payload);
export const consultPrice = (payload) => API.post('/estimates/consult', payload);
export const getMarketTrends = () => API.get('/market/trends');
export const getCategories = () => API.get('/market/categories');
export const getAllSkills = () => API.get('/skills');
export const getPopularSkills = () => API.get('/skills/popular');

// SKILLS PER KATEGORI — Untuk dropdown skill sesuai pekerjaan
export const getSkillsByCategory = (category) =>
  API.get('/market/skills-by-category', { params: { category } });
export const getAllSkillsByCategory = () =>
  API.get('/market/skills-by-category');

export default API;

