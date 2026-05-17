# 💰 Fair Price Finder for Freelancers
**Capstone Project - Coding Camp 2026 powered by DBS Foundation**  
ID Tim: CC26-PSU164 | Tema: Future-Ready Work & Economy

> Aplikasi untuk membantu freelancer pemula dan client untuk mendapatkan perkiraan harga wajar untuk layanan freelance di Indonesia berdasarkan jenis layanan, skill, dan durasi pengerjaan. Perkiraan data ini didapat dari data riil dari Fastwork, Sribu, dan Projects.co.id yang telah diolah.

---

## 👥 Tim
| Nama | Role |
|------|------|
| Meyrica Dianiken Cintami | Data Scientist |
| Gabrielle Angelina Ambasalu | Data Scientist |
| Victor Thimothi Benyamin Loka | Full-Stack Web Developer |
| Kevin Ardiansyah | Full-Stack Web Developer |
| Felicia Audrey | AI Engineer |
| Evan Suryadinata S | AI Engineer |

## 📁 Struktur Proyek

```
fair-price-finder/
├── frontend/                 ← React + Vite app
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── styles/
│
├── backend/                  ← Express REST API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── services/
│
├── ai/                       ← Notebook, dashboard, dan script AI/DS
│   ├── notebooks/
│   ├── dashboard/
│   ├── scripts/
│   ├── scraper/
│   └── requirements.txt
│
├── data/                     ← Data mentah, bersih, dan output
├── docs/                     ← Dokumentasi API dan arsitektur
└── README.md
```

---

## 📦 Prasyarat

Sebelum menjalankan project ini, siapkan:

- Node.js 18+ dan npm
- Python 3.10 untuk folder `ai/`
- Git

Catatan: dependency Python di repo ini paling aman dipasang dengan Python 3.10 di Windows. Python 3.13 pernah memicu kegagalan build untuk beberapa paket seperti `numpy` dan `pandas`.

File yang masih bersifat standalone / template dan perlu disesuaikan sebelum dipakai penuh:

- `ai/scripts/api.py` → standalone FastAPI untuk testing inference
- `ai/scripts/ab_testing.py` → script eksperimen, bukan alur utama produk
- `ai/dashboard/app.py` → dashboard awal, masih ada placeholder yang perlu disesuaikan

---

## 🚀 Cara Menjalankan

### 1) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

Jika backend tidak memakai port default, buat file `.env` di `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2) Backend Express

```bash
cd backend
npm install
npm run dev
```

Backend berjalan di `http://localhost:5000`.

Env opsional di `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Endpoint utama:

- `GET /health`
- `POST /api/estimates`
- `GET /api/market/trends`
- `GET /api/market/categories`
- `GET /api/skills`
- `GET /api/skills/popular`

### 3) Notebook dan pipeline AI/Data Science

```bash
cd ai
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Setelah itu buka VS Code Notebook lalu jalankan notebook utama di folder `ai/models/`:

- `ai/models/01_data_preparation_capstone.ipynb`
- `ai/models/02_model_training.ipynb`
- `ai/models/03_inference_&_API.ipynb`

Kalau yang ingin dijalankan hanya alur model, cukup notebook di atas. Notebook lain di `ai/notebooks/` dipakai untuk analisis dan dokumentasi pendukung.

Kalau masih perlu alur data pendukung, jalankan juga:

- `ai/notebooks/01_data_pipeline.ipynb`
- `ai/notebooks/data_dictionary.ipynb`
- `ai/notebooks/eda_merged.ipynb`
- `ai/notebooks/explanatory_analysis.ipynb`

Notebook `01_data_pipeline.ipynb` akan membaca data dari folder `data/` dan menulis output ke `data/output/`.

### 4) Streamlit Dashboard

```bash
cd ai/dashboard
pip install -r requirements.txt
streamlit run app.py
```

Dashboard biasanya tersedia di `http://localhost:8501`.

### 5) FastAPI model API

```bash
cd ai
python scripts/api.py
```

Service ini berjalan di `http://localhost:8000`.
Ini opsional dan tidak wajib kalau kamu sudah menjalankan inference langsung dari notebook `ai/models/03_inference_&_API.ipynb`.

Kalau ingin menjalankan dengan `uvicorn`:

```bash
uvicorn scripts.api:app --reload --host 0.0.0.0 --port 8000
```

### 6) A/B Testing

```bash
cd ai
python scripts/ab_testing.py
```

---

## 🧭 Urutan Jalankan Semua Komponen

Kalau ingin menyalakan seluruh aplikasi dari nol, ikuti urutan ini:

1. Jalankan backend Express.
2. Jalankan frontend Vite.
3. Jalankan notebook pipeline AI/data untuk memastikan dataset output tersedia.
4. Jalankan Streamlit dashboard jika ingin melihat insight data.
5. Jalankan FastAPI hanya kalau butuh service model terpisah untuk testing.

---

## 📌 Catatan Penting

- Folder `frontend/` dan `backend/` sudah terpisah, jadi `npm install` harus dijalankan di masing-masing folder.
- Jika frontend tidak bisa memanggil API, cek nilai `VITE_API_BASE_URL` dan pastikan backend hidup di port yang sama.
- Jika notebook gagal membaca file CSV, pastikan `data/raw/` dan `data/output/` sudah ada.
- Untuk lingkungan Windows, aktifkan virtual environment sebelum menjalankan script Python di `ai/`.