# 💰 Fair Price Finder for Freelancers

**Capstone Project - Coding Camp 2026 powered by DBS Foundation**  
**ID Tim:** CC26-PSU164 | **Tema:** Future-Ready Work & Economy

> Aplikasi cerdas berbasis AI untuk membantu _freelancer_ pemula dan klien di Indonesia dalam mendapatkan **perkiraan harga wajar (Fair Price)** untuk layanan freelance. Prediksi didasarkan pada model Machine Learning yang dilatih menggunakan data riil dari platform terkemuka (Fastwork, Sribu, dan Projects.co.id).

---

## ✨ Fitur Utama

- 🤖 **AI Price Estimator:** Prediksi harga cerdas berdasarkan kategori, skill spesifik, dan durasi pengerjaan.
- 📊 **Market Intelligence Dashboard:** Analitik _real-time_ tren pasar, _leaderboard_ keahlian yang paling dicari, dan rentang harga kompetitif.
- 🎨 **Premium UI/UX:** Antarmuka modern yang dinamis dengan efek _glassmorphism_, _micro-animations_, dan desain responsif penuh.
- ⚡ **Performa Tinggi:** Arsitektur terpisah (_microservices_) antara Frontend (React/Vite), Backend (Node/Express), dan AI Engine (FastAPI).

---

## 🛠️ Tech Stack

**Frontend:**

- React (Vite)
- Vanilla CSS (BEM Architecture & CSS Variables)
- AOS (Animate on Scroll)
- Radix UI (Unstyled Accessible Components)

**Backend:**

- Node.js & Express.js
- RESTful API Architecture

**AI & Data Science:**

- Python & FastAPI (Inference Server)
- TensorFlow / Keras (Deep Learning Models)
- Scikit-Learn, Pandas, NumPy (Data Processing)
- Streamlit (Data Dashboard)

---

## 👥 Tim Pengembang

| Nama                              | Role                     |
| --------------------------------- | ------------------------ |
| **Meyrica Dianiken Cintami**      | Data Scientist           |
| **Gabrielle Angelina Ambasalu**   | Data Scientist           |
| **Victor Thimothi Benyamin Loka** | Full-Stack Web Developer |
| **Kevin Ardiansyah**              | Full-Stack Web Developer |
| **Felicia Audrey**                | AI Engineer              |
| **Evan Suryadinata S**            | AI Engineer              |

---

## 📁 Struktur Proyek

```text
fair-price-finder/
├── frontend/                 ← Antarmuka Web (React + Vite)
├── backend/                  ← REST API Server (Express.js)
├── ai/                       ← AI Inference (FastAPI) & Data Pipeline
├── data/                     ← Dataset mentah, bersih, & output
└── docs/                     ← Dokumentasi API & arsitektur
```

---

## 🚀 Cara Menjalankan Aplikasi (Local Development)

### Prasyarat

- **Node.js** (v18+) & **npm**
- **Python** (v3.10 sangat disarankan untuk stabilitas dependensi ML/AI)
- **Git**

### 1. Menjalankan AI Engine (FastAPI)

AI Engine bertugas untuk melayani prediksi harga (_inference_).

```bash
cd ai
python -m venv .venv
# Aktifkan virtual environment (Windows):
.venv\Scripts\activate
# Install dependensi:
pip install -r requirements.txt
# Jalankan server:
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

_Server AI akan berjalan di: `http://localhost:8000`_

### 2. Menjalankan Backend (Express.js)

```bash
cd backend
npm install
npm run dev
```

_Server Backend akan berjalan di: `http://localhost:5000`_

### 3. Menjalankan Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

_Aplikasi Web akan berjalan di: `http://localhost:5173`_

_(Opsional)_ Jika backend berjalan di port berbeda, buat file `.env` di folder `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📈 Menjalankan Data Pipeline & Dashboard AI

Jika Anda ingin melihat proses pengolahan data atau menjalankan visualisasi analitik berbasis Streamlit:

1. **Jalankan Notebook ML:**  
   Buka VS Code / Jupyter, lalu jalankan notebook di folder `ai/models/` (01, 02, 03) secara berurutan.
2. **Dashboard Streamlit:**
   ```bash
   cd ai/dashboard
   pip install -r requirements.txt
   streamlit run app.py
   ```
   _Dashboard analitik akan terbuka di: `http://localhost:8501`_

---

## 📌 Catatan Penting

- Ketiga _service_ (**Frontend**, **Backend**, dan **AI Engine**) harus berjalan secara bersamaan agar seluruh fitur aplikasi (khususnya Estimator) dapat berfungsi penuh.
- Lingkungan Windows memerlukan virtual environment (`venv`) khusus saat menginstal dependensi Python (`requirements.txt`) untuk mencegah konflik versi pada `numpy` dan `pandas`.
