import os
import re
import time
import random
import logging
import pandas as pd

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

OUTPUT_DIR  = os.path.join("..", "data", "raw", "fastwork")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "fastwork_raw_v2.csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DELAY_MIN  = 2
DELAY_MAX  = 4
MAX_PAGES  = 5
WAIT_TIME  = 10

# Delay khusus untuk scraping halaman detail (lebih pelan biar aman)
DETAIL_DELAY_MIN = 2
DETAIL_DELAY_MAX = 4

TARGET_CATEGORIES = {
    "Web dan Pemrograman": [
        ("Web Development",    "https://fastwork.id/web-development"),
        ("Mobile Application", "https://fastwork.id/mobile-application"),
        ("UI & UX Design",     "https://fastwork.id/ui-ux"),
        ("Data Science",       "https://fastwork.id/data-science"),
        ("Machine Learning",   "https://fastwork.id/machine-learning"),
        ("Data Analysis",      "https://fastwork.id/data-analysis"),
        ("Chatbot",            "https://fastwork.id/chatbot"),
        ("AI Automation",      "https://fastwork.id/ai-automation"),
    ],
    "Grafis & Desain": [
        ("Logo Design",        "https://fastwork.id/logo-design"),
        ("Web Design",         "https://fastwork.id/web-design"),
        ("Infografis",         "https://fastwork.id/infographics"),
        ("Presentasi",         "https://fastwork.id/presentation"),
    ],
    "Penulisan & Penerjemahan": [
        ("Penulisan Konten",   "https://fastwork.id/content-writing"),
        ("Penerjemahan",       "https://fastwork.id/translation"),
        ("Entri Data",         "https://fastwork.id/data-entry"),
    ],
    "Pemasaran & Periklanan": [
        ("SEO",                "https://fastwork.id/seo"),
        ("Digital Marketing",  "https://fastwork.id/digital-marketing"),
        ("Social Media Mgmt",  "https://fastwork.id/social-media-management"),
        ("Content Creator",    "https://fastwork.id/content-creator"),
    ],
    "Visual & Audio": [
        ("Video Editing",      "https://fastwork.id/video-editing"),
        ("Motion Graphics",    "https://fastwork.id/motion-graphics"),
    ],
}


# ============================================================
# DRIVER SETUP (sama seperti v1)
# ============================================================

def create_driver() -> webdriver.Chrome:
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--lang=id-ID")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    service = Service(ChromeDriverManager().install())
    driver  = webdriver.Chrome(service=service, options=options)
    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return driver


# ============================================================
# PARSER HELPERS (sama seperti v1)
# ============================================================

def parse_harga(text: str) -> int | None:
    if not text:
        return None
    cleaned = text.replace("Rp", "").replace(".", "").replace(",", "").strip()
    try:
        return int(cleaned)
    except ValueError:
        return None

def parse_rating(text: str) -> float | None:
    if not text:
        return None
    try:
        return float(text.strip().split()[0].replace(",", "."))
    except (ValueError, IndexError):
        return None

def parse_jumlah_order(text: str) -> int | None:
    if not text:
        return None
    cleaned = text.replace("Terjual", "").replace(".", "").strip()
    try:
        return int(cleaned)
    except ValueError:
        return None

def parse_durasi(text: str) -> int | None:
    """
    Ekstrak durasi dalam satuan HARI dari teks seperti:
    '3 Hari', '1 Minggu', '2 Bulan', '24 Jam'
    Return: jumlah hari (int), atau None kalau tidak bisa diparsing
    """
    if not text:
        return None
    text_lower = text.lower().strip()

    match = re.search(r'(\d+)\s*(hari|day|minggu|week|bulan|month|jam|hour)', text_lower)
    if not match:
        return None

    angka = int(match.group(1))
    satuan = match.group(2)

    if satuan in ("hari", "day"):
        return angka
    elif satuan in ("minggu", "week"):
        return angka * 7
    elif satuan in ("bulan", "month"):
        return angka * 30
    elif satuan in ("jam", "hour"):
        # Pembulatan ke atas, minimal 1 hari
        return max(1, round(angka / 24))
    return None

def get_text_safe(element, selector: str) -> str | None:
    try:
        return element.find_element(By.CSS_SELECTOR, selector).text.strip()
    except NoSuchElementException:
        return None


# ============================================================
# STEP 1: SCRAPE LISTING CARDS (sama seperti v1)
# ============================================================

def scrape_page(driver: webdriver.Chrome, url: str, kategori: str, sub_kategori: str) -> list[dict]:
    try:
        driver.get(url)
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

        wait = WebDriverWait(driver, WAIT_TIME)

        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.card-product")))
            cards = driver.find_elements(By.CSS_SELECTOR, "a.card-product")
        except TimeoutException:
            logger.warning(f"  Timeout di {url}")
            return []

        if not cards:
            logger.warning(f"  Tidak ada card di {url}")
            return []

        logger.info(f"  {len(cards)} card ditemukan")

        results = []
        for card in cards:
            try:
                rating_raw       = get_text_safe(card, "div.rating span")
                jumlah_order_raw = get_text_safe(card, "div.sell-count span")
                harga_raw        = get_text_safe(card, "span.price-number")

                data = {
                    "platform":         "fastwork",
                    "kategori_utama":   kategori,
                    "sub_kategori":     sub_kategori,
                    "judul_listing":    get_text_safe(card, "h3.title"),
                    "harga":            parse_harga(harga_raw),
                    "rating":           parse_rating(rating_raw),
                    "jumlah_order":     parse_jumlah_order(jumlah_order_raw),
                    "url_listing":      card.get_attribute("href"),
                    "harga_raw":        harga_raw,
                    "rating_raw":       rating_raw,
                    "jumlah_order_raw": jumlah_order_raw,
                    # Placeholder — akan diisi di Step 2
                    "durasi_hari":      None,
                    "durasi_raw":       None,
                    "skills":           None,
                }

                results.append(data)

            except Exception as e:
                logger.warning(f"  Gagal parse card: {e}")
                continue

        return results

    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return []


def scrape_category_listings(driver: webdriver.Chrome, url: str, kategori: str, sub_kategori: str) -> list[dict]:
    all_results = []
    for page in range(1, MAX_PAGES + 1):
        page_url = f"{url}?page={page}" if page > 1 else url
        logger.info(f"  Halaman {page}: {page_url}")

        results = scrape_page(driver, page_url, kategori, sub_kategori)
        if not results:
            logger.info(f"  Halaman {page} kosong, stop.")
            break

        all_results.extend(results)
        logger.info(f"  Subtotal: {len(all_results)} listing")
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    return all_results


# ============================================================
# STEP 2: SCRAPE DETAIL PAGE — DURASI & SKILLS (BARU)
# ============================================================

def scrape_detail(driver: webdriver.Chrome, url: str) -> dict:
    """
    Masuk ke halaman detail listing dan ekstrak:
    - durasi_raw  : teks asli durasi (mis. '3 Hari')
    - durasi_hari : durasi dalam hari (int)
    - skills      : string skills dipisah koma (mis. 'React,Node.js,MySQL')
    """
    empty = {"durasi_raw": None, "durasi_hari": None, "skills": None}

    if not url:
        return empty

    try:
        driver.get(url)
        time.sleep(random.uniform(DETAIL_DELAY_MIN, DETAIL_DELAY_MAX))

        # --- DURASI ---
        # Fastwork menampilkan durasi pengerjaan di dalam paket harga
        # Biasanya dalam elemen seperti: "3 Hari", "1 Minggu"
        # Coba beberapa selector yang umum digunakan Fastwork
        durasi_raw = None
        durasi_selectors = [
            "div.package-delivery",           # Paket delivery section
            "span.delivery-time",             # Delivery time badge
            "div.work-duration",              # Alternatif
            "[class*='delivery'] span",       # Wildcard class delivery
            "[class*='duration'] span",       # Wildcard class duration
        ]
        for sel in durasi_selectors:
            try:
                el = driver.find_element(By.CSS_SELECTOR, sel)
                text = el.text.strip()
                if text and re.search(r'\d+\s*(hari|minggu|bulan|jam|day|week|month|hour)', text, re.I):
                    durasi_raw = text
                    break
            except NoSuchElementException:
                continue

        # Fallback: scan semua teks halaman untuk pola durasi
        if not durasi_raw:
            try:
                all_elements = driver.find_elements(By.CSS_SELECTOR, "span, p, div, li")
                for el in all_elements:
                    try:
                        text = el.text.strip()
                        # Hanya ambil teks pendek yang berisi pola durasi
                        if text and len(text) < 30 and re.search(
                            r'\d+\s*(hari|minggu|bulan|jam|day|week|month|hour)', text, re.I
                        ):
                            durasi_raw = text
                            break
                    except Exception:
                        continue
            except Exception:
                pass

        # --- SKILLS ---
        # Fastwork punya tag/chip skills di halaman detail seller atau listing
        skills_list = []
        skills_selectors = [
            "div.skills-tag span",            # Tag skill seller
            "div.seller-skills span",         # Alternatif
            "span.skill-tag",                 # Chip skill
            "div.tags span",                  # Generic tags
            "[class*='skill'] span",          # Wildcard
            "[class*='tag'] span",            # Wildcard tags
            "ul.skill-list li",               # List skill
        ]
        for sel in skills_selectors:
            try:
                els = driver.find_elements(By.CSS_SELECTOR, sel)
                found = [e.text.strip() for e in els if e.text.strip() and len(e.text.strip()) < 50]
                if found:
                    skills_list = found
                    break
            except Exception:
                continue

        # Fallback: ekstrak skills dari judul listing menggunakan keyword dict
        # (dipakai kalau halaman detail tidak punya tag skill eksplisit)
        if not skills_list:
            try:
                judul_el = driver.find_element(By.CSS_SELECTOR, "h1")
                judul_text = judul_el.text.strip().lower()
                skills_list = extract_skills_from_text(judul_text)
            except Exception:
                pass

        return {
            "durasi_raw":  durasi_raw,
            "durasi_hari": parse_durasi(durasi_raw),
            "skills":      ", ".join(skills_list) if skills_list else None,
        }

    except Exception as e:
        logger.warning(f"  Gagal scrape detail {url}: {e}")
        return empty


# ============================================================
# FALLBACK: EKSTRAK SKILLS DARI TEKS JUDUL
# ============================================================

# Keyword mapping: teknologi/skill yang umum muncul di judul listing Fastwork
SKILL_KEYWORDS = {
    # Web & Programming
    "react": "React", "next.js": "Next.js", "nextjs": "Next.js",
    "vue": "Vue.js", "angular": "Angular", "svelte": "Svelte",
    "laravel": "Laravel", "codeigniter": "CodeIgniter", "django": "Django",
    "flask": "Flask", "fastapi": "FastAPI", "node.js": "Node.js",
    "nodejs": "Node.js", "express": "Express.js", "php": "PHP",
    "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript",
    "golang": "Go", "java": "Java", "kotlin": "Kotlin", "swift": "Swift",
    "flutter": "Flutter", "react native": "React Native",
    "wordpress": "WordPress", "webflow": "Webflow", "shopify": "Shopify",
    "mysql": "MySQL", "postgresql": "PostgreSQL", "mongodb": "MongoDB",
    "firebase": "Firebase", "supabase": "Supabase",
    "restful": "REST API", "graphql": "GraphQL", "docker": "Docker",
    "kubernetes": "Kubernetes", "aws": "AWS", "gcp": "GCP", "azure": "Azure",
    # Data & AI
    "tensorflow": "TensorFlow", "pytorch": "PyTorch", "scikit-learn": "Scikit-learn",
    "pandas": "Pandas", "tableau": "Tableau", "power bi": "Power BI",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "nlp": "NLP", "computer vision": "Computer Vision",
    "data analysis": "Data Analysis", "data science": "Data Science",
    "chatgpt": "ChatGPT", "openai": "OpenAI", "langchain": "LangChain",
    # Design
    "figma": "Figma", "adobe xd": "Adobe XD", "sketch": "Sketch",
    "photoshop": "Photoshop", "illustrator": "Illustrator",
    "canva": "Canva", "after effects": "After Effects",
    "premiere": "Premiere Pro", "blender": "Blender",
    # Marketing
    "seo": "SEO", "google ads": "Google Ads", "meta ads": "Meta Ads",
    "facebook ads": "Facebook Ads", "tiktok ads": "TikTok Ads",
    "instagram": "Instagram", "copywriting": "Copywriting",
}

def extract_skills_from_text(text: str) -> list[str]:
    """Ekstrak skill dari teks bebas berdasarkan keyword dictionary."""
    found = []
    text_lower = text.lower()
    for keyword, label in SKILL_KEYWORDS.items():
        if keyword in text_lower and label not in found:
            found.append(label)
    return found


# ============================================================
# MAIN
# ============================================================

def main():
    logger.info("Mulai scraping Fastwork.id (v2 — dengan durasi & skills)...")
    logger.info(f"Output: {os.path.abspath(OUTPUT_FILE)}")

    driver   = create_driver()
    all_data = []

    try:
        # ── STEP 1: Kumpulkan semua listing dari halaman kategori ──
        logger.info("\n" + "="*55)
        logger.info("STEP 1: Scraping listing cards...")
        logger.info("="*55)

        for kategori, sub_list in TARGET_CATEGORIES.items():
            logger.info(f"\nKategori: {kategori}")
            for sub_kategori, url in sub_list:
                logger.info(f"  {sub_kategori}")
                data = scrape_category_listings(driver, url, kategori, sub_kategori)
                all_data.extend(data)

        logger.info(f"\nStep 1 selesai. Total listing: {len(all_data)}")

        # ── STEP 2: Kunjungi halaman detail untuk durasi & skills ──
        logger.info("\n" + "="*55)
        logger.info("STEP 2: Scraping detail page (durasi & skills)...")
        logger.info("="*55)

        for i, row in enumerate(all_data):
            url = row.get("url_listing")
            if not url:
                continue

            logger.info(f"  [{i+1}/{len(all_data)}] {str(row.get('judul_listing', ''))[:50]}")
            detail = scrape_detail(driver, url)

            row["durasi_raw"]  = detail["durasi_raw"]
            row["durasi_hari"] = detail["durasi_hari"]
            row["skills"]      = detail["skills"]

            logger.info(f"    durasi : {detail['durasi_raw']} → {detail['durasi_hari']} hari")
            logger.info(f"    skills : {detail['skills']}")

            time.sleep(random.uniform(DETAIL_DELAY_MIN, DETAIL_DELAY_MAX))

    finally:
        driver.quit()
        logger.info("\nBrowser ditutup.")

    if all_data:
        df = pd.DataFrame(all_data)

        cols = [
            "platform", "kategori_utama", "sub_kategori",
            "judul_listing", "harga", "rating", "jumlah_order",
            "durasi_hari", "skills",
            "url_listing",
            "harga_raw", "rating_raw", "jumlah_order_raw", "durasi_raw",
        ]
        cols = [c for c in cols if c in df.columns]
        df   = df[cols]

        # Append ke data yang sudah ada
        # if os.path.exists(OUTPUT_FILE):
        #     df_existing = pd.read_csv(OUTPUT_FILE)
        #     df = pd.concat([df_existing, df], ignore_index=True)

        df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

        logger.info(f"\nSELESAI!")
        logger.info(f"   Total listing : {len(df)}")
        logger.info(f"   Disimpan ke   : {os.path.abspath(OUTPUT_FILE)}")
        logger.info(f"\nDistribusi kategori:")
        logger.info(df["kategori_utama"].value_counts().to_string())
        logger.info(f"\nMissing values:")
        logger.info(df[["harga", "rating", "jumlah_order", "durasi_hari", "skills"]].isna().sum().to_string())
    else:
        logger.warning("Tidak ada data!")


if __name__ == "__main__":
    main()