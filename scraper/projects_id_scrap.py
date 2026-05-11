import os
import re
import time
import random
import logging
import requests
import pandas as pd
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

OUTPUT_DIR  = os.path.join("..", "data", "raw", "projects")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "projects_raw.csv")
PAST_OUTPUT_FILE = os.path.join(OUTPUT_DIR, "projects_past_raw.csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL  = "https://projects.co.id"
DELAY_MIN = 1
DELAY_MAX = 2
MAX_PAGES = 10

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://projects.co.id/public/browse_projects/listing",
}

# URL kategori — dari sidebar Projects.co.id
# Format: /public/browse_projects/listing/ID_nama-kategori
TARGET_CATEGORIES = {
    "Web dan Pemrograman": [
        ("Website Development",  f"{BASE_URL}/public/browse_projects/listing/42_website-development"),
        ("Mobile Programming",   f"{BASE_URL}/public/browse_projects/listing/19_mobile-programming"),
        ("Desktop Programming",  f"{BASE_URL}/public/browse_projects/listing/5_desktop-programming"),
        ("Data Entry & Mining",  f"{BASE_URL}/public/browse_projects/listing/6_data-entry-and-data-mining"),
        ("Game Programming",     f"{BASE_URL}/public/browse_projects/listing/2_game-programming"),
        ("Network & System",     f"{BASE_URL}/public/browse_projects/listing/2_network-and-system-administration"),
    ],
    "Grafis & Desain": [
        ("Layout Logo Graphic",  f"{BASE_URL}/public/browse_projects/listing/10_layout-logo-and-graphic-design"),
    ],
    "Penulisan & Penerjemahan": [
        ("Writing & Translation", f"{BASE_URL}/public/browse_projects/listing/10_writing-and-translation"),
    ],
    "Pemasaran & Periklanan": [
        ("Internet Marketing",   f"{BASE_URL}/public/browse_projects/listing/28_internet-marketing-and-social-media"),
        ("SEO",                  f"{BASE_URL}/public/browse_projects/listing/4_seo-and-website-maintenance"),
        ("Accounting",           f"{BASE_URL}/public/browse_projects/listing/0_accounting-and-consultancy"),
    ],
    "Visual & Audio": [
        ("Audio Video Photo",    f"{BASE_URL}/public/browse_projects/listing/16_audio-video-and-photography"),
        ("3D Modeling",          f"{BASE_URL}/public/browse_projects/listing/5_3d-modeling-and-animation"),
    ],
    "Lainnya": [
        ("Others",               f"{BASE_URL}/public/browse_projects/listing/26_others"),
        ("Electronics",         f"{BASE_URL}/public/browse_projects/listing/0_electronics-and-robotics"),
    ],
}


# ============================================================
# PARSERS
# ============================================================

def parse_harga(text: str) -> int | None:
    """Handle format Projects.co.id: 'Rp 1,000,000 - 1,500,000' (koma = pemisah ribuan)"""
    if not text:
        return None
    cleaned = text.replace("Rp", "").replace(",", "").strip()
    numbers = [int(n) for n in re.findall(r'\d+', cleaned) if len(n) >= 4]
    if not numbers:
        return None
    return int(sum(numbers[:2]) / len(numbers[:2]))

def parse_durasi(text: str) -> int | None:
    if not text:
        return None
    match = re.search(r'(\d+)', text)
    if not match:
        return None
    angka = int(match.group(1))
    text_lower = text.lower()
    if "minggu" in text_lower or "week" in text_lower:
        return angka * 7
    elif "bulan" in text_lower or "month" in text_lower:
        return angka * 30
    return angka


# ============================================================
# SKILL KEYWORDS
# ============================================================

SKILL_KEYWORDS = {
    "react": "React", "next.js": "Next.js", "nextjs": "Next.js",
    "vue": "Vue.js", "angular": "Angular", "laravel": "Laravel",
    "codeigniter": "CodeIgniter", "django": "Django", "flask": "Flask",
    "fastapi": "FastAPI", "node.js": "Node.js", "nodejs": "Node.js",
    "php": "PHP", "python": "Python", "javascript": "JavaScript",
    "typescript": "TypeScript", "golang": "Go", "java": "Java",
    "kotlin": "Kotlin", "flutter": "Flutter", "react native": "React Native",
    "wordpress": "WordPress", "shopify": "Shopify",
    "mysql": "MySQL", "postgresql": "PostgreSQL", "mongodb": "MongoDB",
    "firebase": "Firebase", "docker": "Docker", "aws": "AWS",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch",
    "tableau": "Tableau", "power bi": "Power BI",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "nlp": "NLP", "computer vision": "Computer Vision",
    "data analysis": "Data Analysis", "data science": "Data Science",
    "chatgpt": "ChatGPT", "openai": "OpenAI", "langchain": "LangChain",
    "figma": "Figma", "photoshop": "Photoshop", "illustrator": "Illustrator",
    "canva": "Canva", "after effects": "After Effects",
    "premiere": "Premiere Pro", "blender": "Blender",
    "seo": "SEO", "google ads": "Google Ads", "facebook ads": "Facebook Ads",
    "tiktok ads": "TikTok Ads", "copywriting": "Copywriting",
}

def extract_skills_from_text(text: str) -> list[str]:
    found = []
    text_lower = text.lower()
    for keyword, label in SKILL_KEYWORDS.items():
        if keyword in text_lower and label not in found:
            found.append(label)
    return found


# ============================================================
# FETCH
# ============================================================

def fetch_html(url: str, session: requests.Session) -> BeautifulSoup | None:
    try:
        resp = session.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        logger.warning(f"  Gagal fetch {url}: {e}")
        return None


# ============================================================
# PARSE LISTING PAGE
# Struktur berdasarkan inspect element:
# - Judul project: h2 > a[href*='/view/']
# - Tags/Skills: a.label atau span.label (chip warna-warni)
# - Budget: teks "Published Budget: Rp ..."
# - Durasi: teks "Finish Days: N"
# - Bid Count: teks "Bid Count: N"
# ============================================================

def scrape_listing_page(soup: BeautifulSoup, kategori: str, sub_kategori: str) -> list[dict]:
    results = []

    # Cari semua judul project (h2 yang punya link /view/)
    judul_links = soup.select("h2 a[href*='/view/'], h3 a[href*='/view/']")

    if not judul_links:
        logger.warning("  Tidak ada project ditemukan")
        return []

    logger.info(f"  {len(judul_links)} project ditemukan")

    for judul_el in judul_links:
        try:
            judul = judul_el.get_text(strip=True)
            href  = judul_el.get("href", "")
            url_listing = href if href.startswith("http") else f"{BASE_URL}{href}"

            # Naik ke parent card (div.col-md-10 atau div.row)
            card = judul_el.find_parent("div", class_=re.compile(r"col-md-\d+"))
            if not card:
                card = judul_el.find_parent("div")

            full_text = card.get_text(separator=" ") if card else ""

            # ── Tags/Skills eksplisit (chip) ──
            tag_els = card.select("a.label, span.label, a.badge, span.badge") if card else []
            # Filter noise: hapus kata-kata yang bukan skill
            NOISE_WORDS = {
                "published", "closed", "open", "status", "view", "bid",
                "place new bid", "ask owner", "chat with owner", "need weekly report"
            }
            explicit_tags = [
                t.get_text(strip=True) for t in tag_els
                if t.get_text(strip=True)
                and t.get_text(strip=True).lower() not in NOISE_WORDS
                and len(t.get_text(strip=True)) > 2
                and not t.get_text(strip=True).isdigit()
            ]

            # Fallback ke keyword extraction
            paras = [p.get_text(strip=True) for p in card.select("p")] if card else []
            deskripsi = " ".join(paras)[:400]
            teks_gabung = f"{judul} {deskripsi}".lower()
            keyword_skills = extract_skills_from_text(teks_gabung)

            all_skills = explicit_tags if explicit_tags else keyword_skills
            skills_str = ", ".join(all_skills) if all_skills else None

            # ── Budget ──
            budget_raw = None
            m = re.search(r'Published Budget\s*:?\s*(Rp[\s\d\.,\-]+)', full_text, re.I)
            if m:
                budget_raw = m.group(1).strip()
            harga = parse_harga(budget_raw)

            # ── Durasi ──
            durasi_raw = None
            m = re.search(r'Finish Days?\s*:?\s*(\d+)', full_text, re.I)
            if m:
                durasi_raw = f"{m.group(1)} hari"
            durasi_hari = parse_durasi(durasi_raw)

            # ── Bid Count ──
            jumlah_bid = None
            m = re.search(r'Bid Count\s*:?\s*(\d+)', full_text, re.I)
            if m:
                jumlah_bid = int(m.group(1))

            results.append({
                "platform":       "projects.co.id",
                "kategori_utama": kategori,
                "sub_kategori":   sub_kategori,
                "judul_listing":  judul,
                "harga":          harga,
                "durasi_hari":    durasi_hari,
                "jumlah_bid":     jumlah_bid,
                "skills":         skills_str,
                "url_listing":    url_listing,
                "budget_raw":     budget_raw,
                "durasi_raw":     durasi_raw,
                "deskripsi":      deskripsi,
            })

        except Exception as e:
            logger.warning(f"  Gagal parse card: {e}")
            continue

    return results


# ============================================================
# SCRAPE KATEGORI + PAGINATION
# ============================================================

def scrape_category(session, base_url, kategori, sub_kategori):
    all_results = []
    for page in range(1, MAX_PAGES + 1):
        url = base_url if page == 1 else f"{base_url}/page/{page}"
        logger.info(f"  Halaman {page}: {url}")
        soup = fetch_html(url, session)
        if not soup:
            break
        results = scrape_listing_page(soup, kategori, sub_kategori)
        if not results:
            logger.info(f"  Halaman {page} kosong, stop.")
            break
        all_results.extend(results)
        logger.info(f"  Subtotal: {len(all_results)} project")
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))
    return all_results



# ============================================================
# SCRAPE PAST PROJECTS
# URL: /public/past_projects/listing
# Tambahan kolom: accepted_budget, status
# ============================================================

def scrape_past_listing_page(soup: BeautifulSoup, kategori: str, sub_kategori: str) -> list[dict]:
    results = []

    judul_links = soup.select("h2 a[href*='/view/'], h3 a[href*='/view/']")
    if not judul_links:
        logger.warning("  Tidak ada project ditemukan")
        return []

    logger.info(f"  {len(judul_links)} past project ditemukan")

    NOISE_WORDS = {
        "published", "closed", "open", "status", "view", "bid",
        "coder selected", "place new bid", "ask owner", "chat with owner",
        "need weekly report", "private project"
    }

    for judul_el in judul_links:
        try:
            judul = judul_el.get_text(strip=True)
            href  = judul_el.get("href", "")
            url_listing = href if href.startswith("http") else f"{BASE_URL}{href}"

            card = judul_el.find_parent("div", class_=re.compile(r"col-md-\d+"))
            if not card:
                card = judul_el.find_parent("div")

            full_text = card.get_text(separator=" ") if card else ""

            # Tags/Skills
            tag_els = card.select("a.label, span.label, a.badge, span.badge") if card else []
            explicit_tags = [
                t.get_text(strip=True) for t in tag_els
                if t.get_text(strip=True)
                and t.get_text(strip=True).lower() not in NOISE_WORDS
                and len(t.get_text(strip=True)) > 2
                and not t.get_text(strip=True).isdigit()
            ]

            paras = [p.get_text(strip=True) for p in card.select("p")] if card else []
            deskripsi = " ".join(paras)[:400]
            teks_gabung = f"{judul} {deskripsi}".lower()
            keyword_skills = extract_skills_from_text(teks_gabung)
            all_skills = explicit_tags if explicit_tags else keyword_skills
            skills_str = ", ".join(all_skills) if all_skills else None

            # Published Budget
            budget_raw = None
            m = re.search(r'Published Budget\s*:?\s*(Rp[\s\d\.,\-]+)', full_text, re.I)
            if m:
                budget_raw = m.group(1).strip()

            # Accepted Budget (harga final — lebih akurat!)
            accepted_budget_raw = None
            m = re.search(r'Accepted Budget\s*:?\s*(Rp[\s\d\.,\-]+)', full_text, re.I)
            if m:
                accepted_budget_raw = m.group(1).strip()

            # Gunakan accepted budget kalau ada, fallback ke published budget
            harga_raw = accepted_budget_raw or budget_raw
            harga = parse_harga(harga_raw)

            # Durasi
            durasi_raw = None
            m = re.search(r'Finish Days?\s*:?\s*(\d+)', full_text, re.I)
            if m:
                durasi_raw = f"{m.group(1)} hari"
            durasi_hari = parse_durasi(durasi_raw)

            # Bid Count
            jumlah_bid = None
            m = re.search(r'Bid Count\s*:?\s*(\d+)', full_text, re.I)
            if m:
                jumlah_bid = int(m.group(1))

            results.append({
                "platform":            "projects.co.id",
                "kategori_utama":      kategori,
                "sub_kategori":        sub_kategori,
                "judul_listing":       judul,
                "harga":               harga,
                "durasi_hari":         durasi_hari,
                "jumlah_bid":          jumlah_bid,
                "skills":              skills_str,
                "url_listing":         url_listing,
                "budget_raw":          budget_raw,
                "accepted_budget_raw": accepted_budget_raw,
                "durasi_raw":          durasi_raw,
                "deskripsi":           deskripsi,
                "tipe":                "past",
            })

        except Exception as e:
            logger.warning(f"  Gagal parse card: {e}")
            continue

    return results


def scrape_past_projects(session: requests.Session, max_pages: int = 50) -> list[dict]:
    """Scrape semua past projects (tidak per kategori — langsung dari /past_projects/listing)"""
    all_results = []
    base_url = f"{BASE_URL}/public/past_projects/listing"

    logger.info("\nScraping Past Projects...")
    logger.info(f"  Max halaman: {max_pages}")

    for page in range(1, max_pages + 1):
        url = base_url if page == 1 else f"{base_url}/page/{page}"
        logger.info(f"  Halaman {page}: {url}")

        soup = fetch_html(url, session)
        if not soup:
            logger.info("  Gagal fetch, stop.")
            break

        results = scrape_past_listing_page(soup, "Past Project", "All")
        if not results:
            logger.info(f"  Halaman {page} kosong, stop.")
            break

        all_results.extend(results)
        logger.info(f"  Subtotal: {len(all_results)} past project")
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    return all_results

# ============================================================
# MAIN
# ============================================================

def main():
    logger.info("Mulai scraping Projects.co.id...")
    logger.info(f"Output: {os.path.abspath(OUTPUT_FILE)}")

    session  = requests.Session()
    all_data = []

    for kategori, sub_list in TARGET_CATEGORIES.items():
        logger.info(f"\n{'='*55}")
        logger.info(f"Kategori: {kategori}")
        logger.info(f"{'='*55}")
        for sub_kategori, url in sub_list:
            logger.info(f"\n  Sub-kategori: {sub_kategori}")
            data = scrape_category(session, url, kategori, sub_kategori)
            all_data.extend(data)
            logger.info(f"  Total sejauh ini: {len(all_data)} project")

    # ── PAST PROJECTS ──
    past_data = scrape_past_projects(session, max_pages=50)

    # Gabung active + past
    all_data.extend(past_data)

    if all_data:
        df = pd.DataFrame(all_data)
        cols = [
            "platform", "kategori_utama", "sub_kategori",
            "judul_listing", "harga", "durasi_hari", "jumlah_bid", "skills",
            "url_listing", "budget_raw", "accepted_budget_raw", "durasi_raw",
            "deskripsi", "tipe",
        ]
        cols = [c for c in cols if c in df.columns]
        df = df[cols]

        before = len(df)
        df = df.drop_duplicates(subset=["url_listing"]).reset_index(drop=True)
        logger.info(f"\nDedup: {before} → {len(df)} project unik")

        df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

        logger.info(f"\nSELESAI!")
        logger.info(f"   Total project : {len(df)}")
        logger.info(f"   Disimpan ke   : {os.path.abspath(OUTPUT_FILE)}")
        logger.info(f"\nDistribusi tipe:")
        logger.info(df["tipe"].value_counts().to_string() if "tipe" in df.columns else "N/A")
        logger.info(f"\nDistribusi kategori:")
        logger.info(df["kategori_utama"].value_counts().to_string())
        logger.info(f"\nMissing values:")
        logger.info(df[["harga","durasi_hari","jumlah_bid","skills"]].isna().sum().to_string())
        logger.info(f"\nSample 3 baris:")
        logger.info(df[["judul_listing","harga","durasi_hari","skills"]].head(3).to_string())
    else:
        logger.warning("Tidak ada data!")
        logger.warning("Kemungkinan URL kategori perlu disesuaikan.")
        logger.warning("Cek sidebar Projects.co.id dan update TARGET_CATEGORIES.")


if __name__ == "__main__":
    main()