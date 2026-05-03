# Fair Price Finder for Freelancers
**Coding Camp 2026 powered by DBS Foundation**  
Team ID: CC26-PSU164 | Tema: Future-Ready Work & Economy

---

## Checklist Requirements

### Main Quest - AI Engineer
- [x] Functional API / Model Subclassing → `ml/src/models/deep_learning_model.py`
- [x] Custom Layer (`PriceNormalizationLayer`)
- [x] Custom Loss Function (`WeightedMAELoss`)
- [x] Custom Callback (`PriceModelCallback`)
- [x] Save model `.keras` format → `ml/saved_models/`
- [x] Inference code → `ml/notebooks/04_Inference.ipynb`

### Main Quest - Data Science
- [x] Data Wrangling (Gathering, Assessing, Cleaning) → `ml/src/data/`
- [x] EDA → `ml/notebooks/01_EDA.ipynb`
- [x] Visualisasi & Explanatory Analysis → `ml/notebooks/01_EDA.ipynb`
- [x] Streamlit Dashboard → `ml/dashboard/app.py`
- [x] Data Dictionary → `data/data_dictionary.md`

### Main Quest - Front End & Back End
- [x] RESTful API (Express) → `backend/src/`
- [x] RESTful API URL konvensi → routes mengikuti `/api/resource`
- [x] Module bundler (Vite) → `frontend/vite.config.js`
- [x] Networking calls (Axios) → `frontend/src/services/api.js`
- [x] Integrasi AI/ML → `backend/src/services/predict.service.js`

### Side Quest - AI Engineer
- [x] Standalone FastAPI → `ml/scripts/api.py`
- [x] tf.GradientTape training loop → `ml/src/models/deep_learning_model.py`
- [x] TensorBoard integration → callback di training
- [ ] Target: Accuracy ≥ 85%, MAE ≤ 0.02 (dicapai saat training)

### Side Quest - Data Science
- [x] A/B Testing → `ml/scripts/ab_testing.py`
- [ ] Deploy Streamlit Cloud (dilakukan setelah model jadi)
- [ ] Technical Report PDF (akhir proyek)

---

## Struktur Proyek
```
fair-price-finder/
├── frontend/          → React + Vite (UI interaktif)
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/api.js
├── backend/           → Express.js REST API
│   └── src/
│       ├── routes/    → /predict, /market, /skills
│       ├── controllers/
│       └── services/
├── ml/                → Python / TensorFlow
│   ├── notebooks/     → 01_EDA → 02_Preprocessing → 03_Training → 04_Inference
│   ├── src/
│   │   ├── data/      → scraper.py, preprocessor.py
│   │   ├── features/  → feature_engineering.py
│   │   ├── models/    → deep_learning_model.py (Functional API)
│   │   └── evaluation/→ metrics.py
│   ├── dashboard/     → Streamlit app
│   ├── scripts/       → api.py (FastAPI), ab_testing.py
│   ├── saved_models/  → model.keras
│   └── logs/          → TensorBoard logs
├── data/
│   ├── raw/           → data mentah hasil scraping
│   ├── interim/       → data setengah bersih
│   ├── processed/     → dataset final siap training
│   └── data_dictionary.md
└── docs/
    ├── api/endpoints.md
    └── architecture/overview.md
```

## Cara Menjalankan

### Frontend
```bash
cd frontend && npm install && npm run dev
```

### Backend (Express)
```bash
cd backend && npm install && npm run dev
```

### ML API (FastAPI)
```bash
cd ml && pip install -r requirements.txt
python scripts/api.py
```

### Streamlit Dashboard
```bash
cd ml/dashboard && streamlit run app.py
```

### TensorBoard
```bash
tensorboard --logdir ml/logs
```

## Tim
| Nama | Role |
|------|------|
| Meyrica Dianiken Cintami | Data Scientist |
| Victor Thimothi Benyamin Loka | Full-Stack Web Developer |
| Kevin Ardiansyah | Full-Stack Web Developer |
| Gabrielle Angelina Ambasalu | Data Scientist |
| Felicia Audrey | AI Engineer |
| Evan Suryadinata S | AI Engineer |
