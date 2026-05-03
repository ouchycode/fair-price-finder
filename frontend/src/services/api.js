import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

export const predictPrice = (payload) => API.post('/predict', payload);
export const getMarketTrends = () => API.get('/market/trends');
export const getCategories = () => API.get('/market/categories');
export const getAllSkills = () => API.get('/skills');
export const getPopularSkills = () => API.get('/skills/popular');

export default API;
