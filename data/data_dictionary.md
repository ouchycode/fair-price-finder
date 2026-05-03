# Data Dictionary - Fair Price Finder
**CC26-PSU164**

## Dataset: freelance_projects

| Kolom | Tipe | Deskripsi | Contoh |
|-------|------|-----------|--------|
| `id` | int | ID unik proyek | 1001 |
| `title` | str | Judul proyek | "Buat website company profile" |
| `category` | str | Kategori jasa (label) | "Web Development" |
| `skills` | list[str] | Daftar skill yang dibutuhkan | ["React", "Node.js"] |
| `duration_days` | int | Estimasi durasi pengerjaan (hari) | 14 |
| `price_idr` | float | **TARGET** - Harga dalam IDR | 1500000 |
| `complexity` | str | Tingkat kompleksitas proyek | "Medium" |
| `platform` | str | Sumber data (platform scraping) | "Sribulancer" |
| `scraped_at` | datetime | Waktu data diambil | 2025-04-01 |

## Feature Matrix (setelah preprocessing)

| Fitur | Tipe Encoded | Keterangan |
|-------|-------------|------------|
| `category_encoded` | int (LabelEncoded) | Kategori jasa → angka |
| `skill_*` | int (0/1) | Multi-hot encoding per skill |
| `duration_normalized` | float | Duration / max_duration |
| `price_idr` | float | **TARGET** - jangan masuk fitur training |

## Catatan Penting
- Kolom `price_idr` adalah TARGET → **DILARANG** dimasukkan ke fitur training (data leakage)
- Data mentah disimpan di `data/raw/` → jangan diubah
- Data siap model ada di `data/processed/`
