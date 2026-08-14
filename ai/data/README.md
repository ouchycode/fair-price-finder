# Data Dictionary — Fair Price Finder
**Dataset:** `dataset_v2_finalmodel.csv`  
**Tim:** CC26-PSU164 | Coding Camp 2026 DBS Foundation  
**Sumber Data:** Fastwork, Sribu, Projects.co.id  

---

## 1. Ringkasan Dataset

| Atribut | Nilai |
|---|---|
| Nama File | `dataset_v2_finalmodel.csv` |
| Jumlah Baris | 4.551 listing |
| Jumlah Kolom | 66 kolom |
| Sumber Data | Fastwork, Sribu, Projects.co.id |
| Target Variable | `price_single` (harga dalam IDR) |
| Encoding Skill | One-hot encoding (45 kolom `skill_*`) |
| Encoding Kategori | One-hot encoding (5 kolom `kategori_*`) |
| Encoding Platform | One-hot encoding (3 kolom `platform_*`) |

---

## 2. Kolom Numerik & Target

| Kolom | Tipe Data | Deskripsi | Range Nilai | Catatan |
|---|---|---|---|---|
| `price_single` | float64 | Harga jasa dalam Rupiah (IDR) | Rp 40.000 – Rp 15.000.000 | **Target variable** untuk model prediksi. Distribusi right-skewed. |
| `durasi_hari` | float64 | Estimasi durasi pengerjaan dalam hari | 1 – 365 hari | Nilai ekstrem (>365) sudah di-clip. Missing diisi median per kategori. |
| `rating_imputed` | float64 | Rating freelancer setelah imputation | 0.0 – 5.0 | 0.0 = seller baru / belum ada review. |
| `price_range_width` | float64 | Selisih antara harga max dan min (jika ada range harga) | 0 – bervariasi | 0 jika listing hanya punya satu harga tetap. |
| `title_length` | float64 | Jumlah karakter di judul listing | 5 – 200 | Fitur teks dari judul listing. |
| `title_word_count` | float64 | Jumlah kata di judul listing | 1 – 40 | Fitur teks dari judul listing. |
| `desc_length` | float64 | Jumlah karakter di deskripsi layanan | 0 – 5000 | 0 jika tidak ada deskripsi. |

---

## 3. Kolom Biner (Flag 0/1)

| Kolom | Tipe Data | Deskripsi | Nilai |
|---|---|---|---|
| `has_rating` | int64 | Apakah freelancer sudah punya rating? | 1 = punya rating, 0 = belum |
| `has_premium_skill` | int64 | Apakah listing memiliki skill bernilai tinggi (ML, Flutter, dll)? | 1 = ada skill premium, 0 = tidak |
| `has_price_range` | int64 | Apakah listing menampilkan range harga? | 1 = ada range, 0 = harga tetap |
| `has_description` | int64 | Apakah listing memiliki deskripsi? | 1 = ada, 0 = tidak |
| `has_urgency` | int64 | Apakah judul mengandung kata urgensi (cepat, express, dll)? | 1 = ada, 0 = tidak |
| `is_service_based` | int64 | Apakah listing berbasis jasa (bukan produk)? | 1 = jasa, 0 = lainnya |

---

## 4. Kolom Kategori Jasa (One-Hot)

Nilai 1 = listing termasuk kategori tersebut, 0 = tidak.

| Kolom | Kategori Jasa | Deskripsi Layanan |
|---|---|---|
| `kategori_Grafis & Desain` | Grafis & Desain | Logo, branding, ilustrasi, desain grafis |
| `kategori_Pemasaran & Periklanan` | Pemasaran & Periklanan | SEO, iklan digital, social media marketing |
| `kategori_Penulisan & Penerjemahan` | Penulisan & Terjemahan | Copywriting, content writing, terjemahan |
| `kategori_Visual & Audio` | Visual & Audio | Video editing, animasi, produksi audio/video |
| `kategori_Web dan Pemrograman` | Web & Pemrograman | Pengembangan web, mobile, data science, ML |

---

## 5. Kolom Platform (One-Hot)

Nilai 1 = listing berasal dari platform tersebut, 0 = tidak.

| Kolom | Platform | Karakteristik |
|---|---|---|
| `platform_fastwork` | Fastwork | Seller-driven marketplace, dominan desain & web |
| `platform_projects` | Projects.co.id | Job posting berbasis bidding dari client |
| `platform_sribu` | Sribu | Seller-driven marketplace, fokus desain & konten |

---

## 6. Kolom Skill (One-Hot)

45 kolom skill hasil one-hot encoding. Nilai 1 = freelancer memiliki skill tersebut dalam listing, 0 = tidak. Satu listing bisa memiliki lebih dari satu skill.

### Tech Skill

| Kolom | Nama Skill |
|---|---|
| `skill_machine_learning` | Machine Learning / AI |
| `skill_python` | Python |
| `skill_data_analysis` | Data Analysis |
| `skill_data_science` | Data Science |
| `skill_deep_learning` | Deep Learning |
| `skill_react` | React.js |
| `skill_flutter` | Flutter (Mobile) |
| `skill_javascript` | JavaScript |
| `skill_nextjs` | Next.js |
| `skill_kotlin` | Kotlin (Android) |
| `skill_laravel` | Laravel (PHP Framework) |
| `skill_react_native` | React Native (Mobile) |
| `skill_wordpress` | WordPress |
| `skill_ui_ux_design` | UI/UX Design |
| `skill_figma` | Figma |
| `skill_php` | PHP |
| `skill_java` | Java |
| `skill_html_css` | HTML & CSS |
| `skill_mobile_programming` | Mobile Programming (umum) |
| `skill_swift` | Swift (iOS) |
| `skill_website` | Pembuatan Website (umum) |
| `skill_website_building` | Website Building (no-code/low-code) |
| `skill_laravel_framework` | Laravel Framework |

### Marketing Skill

| Kolom | Nama Skill |
|---|---|
| `skill_seo` | Search Engine Optimization |
| `skill_tiktok_ads` | TikTok Ads |
| `skill_instagram` | Instagram Marketing |
| `skill_google_ads` | Google Ads |
| `skill_meta_ads` | Meta Ads (Facebook/Instagram) |
| `skill_facebook_ads` | Facebook Ads |
| `skill_copywriting` | Copywriting |
| `skill_content_writing` | Content Writing |

### Desain & Kreatif

| Kolom | Nama Skill |
|---|---|
| `skill_logo_design` | Logo Design |
| `skill_branding` | Branding |
| `skill_canva` | Canva |
| `skill_adobe_xd` | Adobe XD |

### Video & Animasi

| Kolom | Nama Skill |
|---|---|
| `skill_video_editing` | Video Editing |
| `skill_animation` | Animasi |
| `skill_after_effects` | Adobe After Effects |
| `skill_video_production` | Produksi Video |
| `skill_3d_modeling` | 3D Modeling |

### Data & Analitik

| Kolom | Nama Skill |
|---|---|
| `skill_excel` | Microsoft Excel |
| `skill_tableau` | Tableau |
| `skill_power_bi` | Power BI |

### Lainnya

| Kolom | Nama Skill |
|---|---|
| `skill_translation` | Terjemahan |
| `skill_running` | Running (olahraga/event) |

---

## 7. Catatan Teknis

| Topik | Keterangan |
|---|---|
| Missing Values | Semua missing sudah diimputasi sebelum feature engineering. Dataset ini sudah bersih. |
| Log Transform | `price_single` perlu `log1p` transform sebelum training model regresi karena distribusi sangat right-skewed. |
| Augmentasi Data | Dataset asli 4.551 baris. Dataset combined (dengan augmentasi sintetis) ada 10.051 baris di `dataset_v2_combined.csv`. |
| `log_price_single` | Tidak ada di file ini. Dibuat saat training dengan `np.log1p(price_single)`. |
| Threshold Skill | Skill yang muncul < 10 kali di dataset tidak dimasukkan sebagai fitur. |
| Versi Dataset | V2 Final — digunakan untuk training model `freelance_pricer_savedmodel`. |