# API Endpoints - Fair Price Finder

## Base URL
`http://localhost:5000/api`

## Endpoints

### POST /predict
Estimasi harga jasa freelance.

**Request Body:**
```json
{
  "category": "Web Development",
  "skills": ["React", "Node.js", "MongoDB"],
  "duration": 14
}
```

**Response:**
```json
{
  "min_price": 500000,
  "median_price": 1200000,
  "max_price": 2500000,
  "currency": "IDR"
}
```

### GET /market/categories
Daftar kategori jasa freelance.

### GET /market/trends
Tren harga pasar per kategori.

### GET /skills
Daftar semua skill yang tersedia.

### GET /skills/popular
Skill paling banyak dicari di pasar.
