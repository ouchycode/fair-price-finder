"""
Sribu.com Scraper v2 - Fair Price Finder Project
Fixes:
- no such window error (tab baru)
- harga selector yang tepat
- tambah durasi_hari dan skills
- semua kategori aktif
"""

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
from selenium.common.exceptions import TimeoutException, NoSuchWindowException
from webdriver_manager.chrome import ChromeDriverManager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

OUTPUT_DIR  = os.path.join("..", "..", "data", "raw", "sribu")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "sribu_raw_v2.csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DELAY_MIN  = 3
DELAY_MAX  = 5
MAX_PAGES  = 5
WAIT_TIME  = 15

TARGET_CATEGORIES = {
    "Web dan Pemrograman": [
        ("Web Development",    "https://www.sribu.com/id/website-development"),
        ("Mobile Application", "https://www.sribu.com/id/mobile-app-development"),
        ("UI & UX Design",     "https://www.sribu.com/id/ui-ux-design"),
    ],
    "Grafis & Desain": [
        ("Logo Design",        "https://www.sribu.com/id/logo-design"),
        ("Desain Grafis",      "https://www.sribu.com/id/graphic-design"),
    ],
    "Penulisan & Penerjemahan": [
        ("Penulisan Konten",   "https://www.sribu.com/id/content-writing"),
        ("Penerjemahan",       "https://www.sribu.com/id/translation"),
    ],
    "Pemasaran & Periklanan": [
        ("SEO",                "https://www.sribu.com/id/seo"),
        ("Digital Marketing",  "https://www.sribu.com/id/digital-marketing"),
        ("Social Media",       "https://www.sribu.com/id/social-media"),
    ],
    "Visual & Audio": [
        ("Video Editing",      "https://www.sribu.com/id/video-editing"),
    ],
}

# ============================================================
# SKILL KEYWORDS (sama dengan Fastwork)
# ============================================================

SKILL_KEYWORDS = {
    "react": "React", "next.js": "Next.js", "nextjs": "Next.js",
    "vue": "Vue.js", "angular": "Angular", "laravel": "Laravel",
    "codeigniter": "CodeIgniter", "django": "Django", "flask": "Flask",
    "fastapi": "FastAPI", "node.js": "Node.js", "nodejs": "Node.js",
    "php": "PHP", "python": "Python", "javascript": "JavaScript",
    "typescript": "TypeScript", "kotlin": "Kotlin", "flutter": "Flutter",
    "react native": "React Native", "wordpress": "WordPress",
    "shopify": "Shopify", "mysql": "MySQL", "postgresql": "PostgreSQL",
    "mongodb": "MongoDB", "firebase": "Firebase", "docker": "Docker",
    "aws": "AWS", "tensorflow": "TensorFlow", "pytorch": "PyTorch",
    "tableau": "Tableau", "power bi": "Power BI",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "nlp": "NLP", "computer vision": "Computer Vision",
    "data analysis": "Data Analysis", "data science": "Data Science",
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
# DRIVER
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
    # FIX: blokir popup/tab baru yang bikin no such window
    options.add_experimental_option("prefs", {
        "profile.default_content_setting_values.popups": 2
    })

    service = Service(ChromeDriverManager().install())
    driver  = webdriver.Chrome(service=service, options=options)
    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return driver

def ensure_main_window(driver: webdriver.Chrome, main_handle: str):
    """Pastikan driver kembali ke window utama — fix no such window."""
    try:
        current = driver.current_window_handle
        if current != main_handle:
            # Tutup tab lain, kembali ke main
            for handle in driver.window_handles:
                if handle != main_handle:
                    try:
                        driver.switch_to.window(handle)
                        driver.close()
                    except Exception:
                        pass
            driver.switch_to.window(main_handle)
    except NoSuchWindowException:
        # Main window hilang — switch ke window pertama yang tersedia
        try:
            driver.switch_to.window(driver.window_handles[0])
        except Exception:
            pass


# ============================================================
# PARSERS
# ============================================================

def parse_harga(text: str) -> int | None:
    if not text:
        return None
    cleaned = re.sub(r'[^\d]', '', text)
    try:
        return int(cleaned) if cleaned else None
    except ValueError:
        return None

def parse_rating(text: str) -> float | None:
    if not text:
        return None
    try:
        return float(text.strip().replace(",", "."))
    except ValueError:
        return None

def parse_jumlah_order(text: str) -> int | None:
    if not text:
        return None
    cleaned = re.sub(r'[^\d]', '', text)
    try:
        return int(cleaned) if cleaned else None
    except ValueError:
        return None

def parse_durasi(text: str) -> int | None:
    if not text:
        return None
    text_lower = text.lower().strip()
    match = re.search(r'(\d+)\s*(hari|day|minggu|week|bulan|month|jam|hour)', text_lower)
    if not match:
        return None
    angka  = int(match.group(1))
    satuan = match.group(2)
    if satuan in ("hari", "day"):      return angka
    elif satuan in ("minggu", "week"): return angka * 7
    elif satuan in ("bulan", "month"): return angka * 30
    elif satuan in ("jam", "hour"):    return max(1, round(angka / 24))
    return None


# ============================================================
# STEP 1: KUMPULKAN URL LISTING
# ============================================================

def collect_listing_urls(driver: webdriver.Chrome, base_url: str, main_handle: str) -> list[dict]:
    all_items = []

    for page in range(1, MAX_PAGES + 1):
        url = f"{base_url}?page={page}" if page > 1 else base_url
        logger.info(f"  Collect halaman {page}: {url}")

        try:
            ensure_main_window(driver, main_handle)
            driver.get(url)
            time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

            wait = WebDriverWait(driver, WAIT_TIME)
            try:
                wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "div[href*='/id/users/']")
                ))
            except TimeoutException:
                logger.warning(f"  Timeout halaman {page}, stop.")
                break

            cards_data = driver.execute_script("""
                const cards = document.querySelectorAll('div[href*="/id/users/"]');
                const results = [];
                cards.forEach(card => {
                    const href = card.getAttribute('href');
                    const imgs = card.querySelectorAll('img[alt]');
                    let judul = null;
                    imgs.forEach(img => {
                        const alt = img.getAttribute('alt');
                        if (alt && alt !== 'user-image' && alt.length > 3) {
                            judul = alt;
                        }
                    });
                    if (href && judul) {
                        results.push({ href, judul });
                    }
                });
                return results;
            """)

            if not cards_data:
                logger.info(f"  Halaman {page} kosong, stop.")
                break

            for item in cards_data:
                href  = item.get("href", "")
                judul = item.get("judul", "")
                if href and "/id/users/" in href:
                    full_url = "https://www.sribu.com" + href if href.startswith("/") else href
                    all_items.append({
                        "url_listing":   full_url,
                        "judul_listing": judul,
                    })

            logger.info(f"  Subtotal URL: {len(all_items)}")
            time.sleep(random.uniform(2, 3))

        except Exception as e:
            logger.error(f"  Error halaman {page}: {e}")
            ensure_main_window(driver, main_handle)
            break

    # Deduplikasi
    seen, unique = set(), []
    for item in all_items:
        if item["url_listing"] not in seen:
            seen.add(item["url_listing"])
            unique.append(item)

    logger.info(f"  Total URL unik: {len(unique)}")
    return unique


# ============================================================
# STEP 2: SCRAPE DETAIL — HARGA, RATING, DURASI, SKILLS
# ============================================================

def scrape_listing_detail(driver: webdriver.Chrome, url: str, judul: str, main_handle: str) -> dict:
    empty = {
        "harga": None, "rating": None, "jumlah_order": None,
        "durasi_hari": None, "skills": None,
        "harga_raw": None, "rating_raw": None,
        "jumlah_order_raw": None, "durasi_raw": None,
    }

    try:
        ensure_main_window(driver, main_handle)
        driver.get(url)
        time.sleep(random.uniform(2, 3))

        data = driver.execute_script("""
            const allEl = Array.from(document.querySelectorAll('span, p, div, h1, h2, h3, li'));

            // ── Harga ──
            let harga_raw = null;
            for (const el of allEl) {
                const txt = (el.childNodes.length <= 3)
                    ? el.textContent.trim() : '';
                if (txt.startsWith('Rp') && txt.length < 25 && /\\d/.test(txt)) {
                    harga_raw = txt;
                    break;
                }
            }

            // ── Rating ──
            let rating_raw = null;
            for (const el of allEl) {
                const txt = el.textContent.trim();
                if (/^[1-5][.,]\\d$/.test(txt)) {
                    rating_raw = txt;
                    break;
                }
            }

            // ── Jumlah order/ulasan ──
            let ulasan_raw = null;
            for (const el of allEl) {
                const txt = el.textContent.trim();
                if ((txt.includes('Ulasan') || txt.includes('Terjual') ||
                     txt.includes('ulasan') || txt.includes('review')) 
                    && txt.length < 30) {
                    ulasan_raw = txt;
                    break;
                }
            }

            // ── Durasi ──
            let durasi_raw = null;
            const durasiPattern = /\\d+\\s*(hari|minggu|bulan|jam|day|week|month|hour)/i;
            for (const el of allEl) {
                const txt = el.textContent.trim();
                if (txt.length < 40 && durasiPattern.test(txt)) {
                    durasi_raw = txt;
                    break;
                }
            }

            // ── Skills (tag eksplisit) ──
            // Sribu biasanya punya tag skill di halaman detail seller
            const skillEls = Array.from(document.querySelectorAll(
                'span.tag, div.tag, a.tag, span.skill, div.skill, ' +
                '[class*="skill"] span, [class*="tag"] span, ' +
                'ul.tags li, div.tags span'
            ));
            const skills = skillEls
                .map(e => e.textContent.trim())
                .filter(s => s.length > 1 && s.length < 50);

            return { harga_raw, rating_raw, ulasan_raw, durasi_raw, skills };
        """)

        harga_raw        = data.get("harga_raw")
        rating_raw       = data.get("rating_raw")
        jumlah_order_raw = data.get("ulasan_raw")
        durasi_raw       = data.get("durasi_raw")
        explicit_skills  = data.get("skills", [])

        # Fallback skills dari judul
        if not explicit_skills:
            explicit_skills = extract_skills_from_text(judul)

        return {
            "harga":            parse_harga(harga_raw),
            "rating":           parse_rating(rating_raw),
            "jumlah_order":     parse_jumlah_order(jumlah_order_raw),
            "durasi_hari":      parse_durasi(durasi_raw),
            "skills":           ", ".join(explicit_skills) if explicit_skills else None,
            "harga_raw":        harga_raw,
            "rating_raw":       rating_raw,
            "jumlah_order_raw": jumlah_order_raw,
            "durasi_raw":       durasi_raw,
        }

    except Exception as e:
        logger.warning(f"  Error detail {url}: {e}")
        ensure_main_window(driver, main_handle)
        return empty


# ============================================================
# SCRAPE PER KATEGORI
# ============================================================

def scrape_category(
    driver: webdriver.Chrome,
    base_url: str,
    kategori: str,
    sub_kategori: str,
    main_handle: str
) -> list[dict]:
    logger.info(f"  Step 1: Kumpulkan URL listing...")
    items = collect_listing_urls(driver, base_url, main_handle)

    if not items:
        logger.warning("  Tidak ada URL!")
        return []

    logger.info(f"  Step 2: Scrape {len(items)} listing...")
    results = []

    for i, item in enumerate(items, 1):
        url   = item["url_listing"]
        judul = item["judul_listing"]
        logger.info(f"  [{i}/{len(items)}] {judul[:50]}")

        detail = scrape_listing_detail(driver, url, judul, main_handle)

        logger.info(f"    harga   : {detail['harga_raw']} → {detail['harga']}")
        logger.info(f"    durasi  : {detail['durasi_raw']} → {detail['durasi_hari']} hari")
        logger.info(f"    skills  : {detail['skills']}")

        results.append({
            "platform":       "sribu",
            "kategori_utama": kategori,
            "sub_kategori":   sub_kategori,
            "judul_listing":  judul,
            "url_listing":    url,
            "harga":          detail["harga"],
            "rating":         detail["rating"],
            "jumlah_order":   detail["jumlah_order"],
            "durasi_hari":    detail["durasi_hari"],
            "skills":         detail["skills"],
            "harga_raw":      detail["harga_raw"],
            "rating_raw":     detail["rating_raw"],
            "jumlah_order_raw": detail["jumlah_order_raw"],
            "durasi_raw":     detail["durasi_raw"],
        })

        time.sleep(random.uniform(1, 2))

    return results


# ============================================================
# MAIN
# ============================================================

def main():
    logger.info("Mulai scraping Sribu.com v2...")
    logger.info(f"Output: {os.path.abspath(OUTPUT_FILE)}")

    driver      = create_driver()
    main_handle = driver.current_window_handle
    all_data    = []

    try:
        for kategori, sub_list in TARGET_CATEGORIES.items():
            logger.info(f"\n{'='*55}")
            logger.info(f"Kategori: {kategori}")
            logger.info(f"{'='*55}")

            for sub_kategori, url in sub_list:
                logger.info(f"\n  {sub_kategori}")
                data = scrape_category(driver, url, kategori, sub_kategori, main_handle)
                all_data.extend(data)
                logger.info(f"  Total sejauh ini: {len(all_data)} listing")

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

        df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

        logger.info(f"\nSELESAI!")
        logger.info(f"   Total listing : {len(df)}")
        logger.info(f"   Disimpan ke   : {os.path.abspath(OUTPUT_FILE)}")
        logger.info(f"\nDistribusi kategori:")
        logger.info(df["kategori_utama"].value_counts().to_string())
        logger.info(f"\nMissing values:")
        logger.info(df[["harga","rating","jumlah_order","durasi_hari","skills"]].isna().sum().to_string())
    else:
        logger.warning("Tidak ada data!")


if __name__ == "__main__":
    main()