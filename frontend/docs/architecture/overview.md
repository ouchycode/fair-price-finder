# Arsitektur Sistem - Fair Price Finder

```
┌─────────────┐     HTTP      ┌─────────────────┐     HTTP     ┌──────────────┐
│   Frontend  │ ────────────► │  Backend (Node) │ ──────────► │  ML API      │
│  (React)    │ ◄──────────── │  Express REST   │ ◄────────── │  (FastAPI)   │
└─────────────┘               └─────────────────┘             └──────────────┘
                                       │                              │
                                       ▼                              ▼
                               ┌──────────────┐             ┌──────────────────┐
                               │   Database   │             │  Trained Model   │
                               │  (Optional)  │             │  (.keras file)   │
                               └──────────────┘             └──────────────────┘
```

## Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | React + Vite + Axios |
| Backend | Node.js + Express |
| ML API | Python + FastAPI |
| Model | TensorFlow / Keras |
| Data | Pandas, Scikit-learn |
| Visualisasi | Plotly, Streamlit |
