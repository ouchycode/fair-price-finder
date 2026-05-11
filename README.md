# Fair Price Finder for Freelancers
Capstone Project - Coding Camp 2026 powered by DBS Foundation  
**Tim:** CC26-PSU164

> Aplikasi prediksi harga wajar layanan freelance di Indonesia berdasarkan data riil dari Fastwork, Sribu, dan Projects.co.id.

---

## Struktur Folder

```
capstone_projek/
├── data/
│   ├── raw/
│   │   ├── fastwork/             ← hasil scraping Fastwork 
│   │   ├── sribu/                ← hasil scraping Sribu 
│   │   └── data/cleaned/
│   │       ├── merged_raw.csv          ← data mentah gabungan 3 platform (5461 baris)
│   │       ├── merged_raw_imputed.csv  ← setelah imputation missing values
│   │       ├── imputed_missing.py      ← script imputation
│   │       └── data_statistics.txt     ← statistik deskriptif
│   ├── cleaned/
│   │   └── merged_cleaned.csv    ← data siap EDA
│   └── final/                    ← dataset final untuk training model (TODO)
│
├── scraper/                      ← script scraping
│   ├── fastwork_scraper.py
│   ├── sribu_scraper.py
│   └── projects_id_scrap.py
│
├── notebooks/                    ← EDA & analisis
│   ├── eda_merged.ipynb          ← EDA utama (3 platform)
│   ├── explanatory_analysis.ipynb ← analisis per pertanyaan bisnis
│   ├── data_dictionary.ipynb     ← dokumentasi dataset
│   ├── eda_fastwork.ipynb        ← EDA per platform (arsip)
│   └── eda_sribu.ipynb           ← EDA per platform (arsip)
│
├── model/                        ← AI Engineer: model deep learning
│   ├── train.py
│   ├── predict.py
│   └── saved_model/
│
├── backend/                      ← Full Stack: REST API
│   ├── app.py
│   └── routes/
│
├── frontend/                     ← Full Stack: UI web
│   ├── src/
│   └── public/
│
├── .gitignore
└── README.md
```

---

---

## Progress

### Data Science
| Tahap | Status | Output |
|---|---|---|
| Scraping Fastwork | ✅ Done | `data/raw/fastwork/` |
| Scraping Sribu | ✅ Done | `data/raw/sribu/` |
| Scraping Projects.co.id | ✅ Done | `data/raw/projects/` |
| Merge data | ✅ Done | `merged_raw.csv` (5461 baris, 10 kolom) |
| Assessing data | ✅ Done | `data_statistics.txt` |
| Cleaning & Imputation | ✅ Done | `merged_raw_imputed.csv` (0 missing) |
| EDA | ✅ Done | `eda_merged.ipynb` |
| Explanatory Analysis | ✅ Done | `explanatory_analysis.ipynb` |
| Data Dictionary | ✅ Done | `data_dictionary.ipynb` |
| Feature Engineering | 🔄 In Progress | `data/final/` |
| Streamlit Dashboard | ⏳ Todo | — |

### AI Engineer
| Tahap | Status | Output |
|---|---|---|
| Dataset final dari DS | ⏳ Menunggu | `data/final/` |
| Model architecture | ⏳ Todo | `model/train.py` |
| Training | ⏳ Todo | `model/saved_model/` |
| Inference script | ⏳ Todo | `model/predict.py` |

### Full Stack
| Tahap | Status | Output |
|---|---|---|
| UI/UX design | 🔄 In Progress | `frontend/` |
| Backend API | 🔄 In Progress | `backend/` |
| Integrasi model | ⏳ Todo | — |
| Deployment | ⏳ Todo | — |

---

## Dataset

| | |
|---|---|
| **Sumber** | Fastwork, Sribu, Projects.co.id |
| **Total data** | 5.461 listing |
| **Kolom** | platform, kategori_utama, sub_kategori, judul_listing, harga, rating, jumlah_order, durasi_hari, skills, url_listing |
| **Kategori** | 7 kategori utama, 29 sub-kategori |
| **Range harga** | Rp 40.000 – Rp 50.000.000 |

### Pertanyaan Bisnis
1. Berapa rentang harga wajar untuk tiap sub-kategori layanan freelance di Indonesia?
2. Apakah platform mempengaruhi harga secara signifikan untuk layanan yang sama?
3. Skill apa yang paling berpengaruh terhadap harga tinggi?
4. Apakah freelancer dengan rating & order lebih tinggi cenderung memasang harga lebih mahal?
5. Berapa durasi pengerjaan yang umum untuk tiap kategori, dan apakah berkorelasi dengan harga?

---

## Timeline

| Tanggal | Milestone | Status |
|---|---|---|
| s/d 9 Mei | DS: Scraping + EDA. FS: UI/UX + Setup | ✅ Done |
| 9 – 15 Mei | AI: Training model. FS: Backend + Mock API | 🔄 In Progress |
| 15 – 20 Mei | AI: Finalisasi model. FS: Integrasi | ⏳ Todo |
| 20 – 30 Mei | Semua: Crosscheck + Deploy | ⏳ Todo |

---

## API Contract

```json
POST /predict
{
  "kategori": "Web dan Pemrograman",
  "sub_kategori": "Web Development",
  "skills": ["React", "Node.js"],
  "durasi_hari": 7,
  "level": "menengah"
}
```

```json
{
  "harga_min": 500000,
  "harga_max": 1500000,
  "harga_median": 900000
}
```

---

## Setup

### Menjalankan Imputation
```bash
cd data/raw/data/cleaned
python imputed_missing.py
```

### Menjalankan Notebook
```bash
cd notebooks
jupyter notebook
```