const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/estimates', require('./routes/estimate.routes'));
app.use('/api/market', require('./routes/market.routes'));
app.use('/api/skills', require('./routes/skills.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', project: 'Fair Price Finder', team: 'CC26-PSU164' });
});

// Error handler (wajib setelah routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
