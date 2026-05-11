"""
Sribu.com Scraper - Fair Price Finder Project
DS: Gabrielle (Sribu)
Versi: Selenium - Rebuild

Strategi: 
1. Kumpulkan semua URL listing dari halaman kategori via JavaScript
2. Scrape data dari tiap halaman listing individu
3. Hindari stale element error

Jalankan dari dalam folder:
capstone_projek/scraper/

Output otomatis ke:
capstone_projek/data/raw/sribu/sribu_raw.csv
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
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

# =============================================
# LOGGING
# =============================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================
# OUTPUT PATH
# =============================================
OUTPUT_DIR  = os.path.join("..", "data", "raw", "sribu")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "sribu_raw.csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# =============================================
# KONFIGURASI
# =============================================
DELAY_MIN  = 3
DELAY_MAX  = 5
MAX_PAGES  = 5
WAIT_TIME  = 15

TARGET_CATEGORIES = {
    "Web dan Pemrograman": [
        ("Web Development",    "https://www.sribu.com/id/website-development"),
        # ("Mobile Application", "https://www.sribu.com/id/mobile-app-development"),
        # ("UI & UX Design",     "https://www.sribu.com/id/ui-ux-design"),
    ],
    # "Grafis & Desain": [
    #     ("Logo Design",        "https://www.sribu.com/id/logo-design"),
    #     ("Desain Grafis",      "https://www.sribu.com/id/graphic-design"),
    # ],
    # "Penulisan & Penerjemahan": [
    #     ("Penulisan Konten",   "https://www.sribu.com/id/content-writing"),
    #     ("Penerjemahan",       "https://www.sribu.com/id/translation"),
    # ],
    # "Pemasaran & Periklanan": [
    #     ("SEO",                "https://www.sribu.com/id/seo"),
    #     ("Digital Marketing",  "https://www.sribu.com/id/digital-marketing"),
    # ],
    # "Visual & Audio": [
    #     ("Video Editing",      "https://www.sribu.com/id/video-editing"),
    # ],
}

# =============================================
# SETUP DRIVER
# =============================================
def create_driver() -> webdriver.Chrome:
    options = Options()
    # options.add_argument("--headless")
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

# =============================================
# HELPER FUNCTIONS
# =============================================
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

# =============================================
# STEP 1: KUMPULKAN URL LISTING
# =============================================
def collect_listing_urls(driver: webdriver.Chrome, base_url: str) -> list[dict]:
    """Kumpulkan URL + judul dari halaman listing via JavaScript."""
    all_items = []

    for page in range(1, MAX_PAGES + 1):
        url = f"{base_url}?page={page}" if page > 1 else base_url
        logger.info(f"  Collect halaman {page}: {url}")

        try:
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

            # Ambil semua card via JavaScript — tidak kena stale element
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
            break

    # Deduplikasi
    seen = set()
    unique = []
    for item in all_items:
        if item["url_listing"] not in seen:
            seen.add(item["url_listing"])
            unique.append(item)

    logger.info(f"  Total URL unik: {len(unique)}")
    return unique

# =============================================
# STEP 2: SCRAPE DATA DARI HALAMAN LISTING
# =============================================
def scrape_listing_detail(driver: webdriver.Chrome, url: str) -> dict:
    """Scrape harga, rating, ulasan dari halaman listing individu."""
    try:
        driver.get(url)
        time.sleep(random.uniform(2, 3))

        data = driver.execute_script("""
            // Harga: cari elemen text yang mengandung "Rp"
            let harga_raw = null;
            const allText = document.querySelectorAll('span, p, div, h1, h2, h3');
            for (const el of allText) {
                const txt = el.childNodes.length === 1 
                    && el.childNodes[0].nodeType === 3
                    ? el.textContent.trim() : '';
                if (txt.startsWith('Rp') && txt.length < 20) {
                    harga_raw = txt;
                    break;
                }
            }

            // Rating: angka format "5.0" atau "4,9"
            let rating_raw = null;
            for (const el of allText) {
                const txt = el.textContent.trim();
                if (/^[45][.,]\\d$/.test(txt)) {
                    rating_raw = txt;
                    break;
                }
            }

            // Ulasan/order
            let ulasan_raw = null;
            for (const el of allText) {
                const txt = el.textContent.trim();
                if ((txt.includes('Ulasan') || txt.includes('Terjual')) 
                    && txt.length < 30) {
                    ulasan_raw = txt;
                    break;
                }
            }

            return { harga_raw, rating_raw, ulasan_raw };
        """)

        return {
            "harga_raw":        data.get("harga_raw"),
            "rating_raw":       data.get("rating_raw"),
            "jumlah_order_raw": data.get("ulasan_raw"),
            "harga":            parse_harga(data.get("harga_raw")),
            "rating":           parse_rating(data.get("rating_raw")),
            "jumlah_order":     parse_jumlah_order(data.get("ulasan_raw")),
        }

    except Exception as e:
        logger.warning(f"  Error detail {url}: {e}")
        return {
            "harga_raw": None, "rating_raw": None, "jumlah_order_raw": None,
            "harga": None, "rating": None, "jumlah_order": None,
        }

# =============================================
# MAIN SCRAPER
# =============================================
def scrape_category(driver: webdriver.Chrome, base_url: str, kategori: str, sub_kategori: str) -> list[dict]:
    logger.info(f"  Step 1: Kumpulkan URL listing...")
    items = collect_listing_urls(driver, base_url)

    if not items:
        logger.warning("  Tidak ada URL!")
        return []

    logger.info(f"  Step 2: Scrape {len(items)} listing...")
    results = []

    for i, item in enumerate(items, 1):
        logger.info(f"  [{i}/{len(items)}] {item['judul_listing'][:50]}...")
        detail = scrape_listing_detail(driver, item["url_listing"])

        print(f"judul : {item['judul_listing']}")
        print(f"harga : {detail['harga_raw']} → {detail['harga']}")
        print(f"rating: {detail['rating_raw']} → {detail['rating']}")
        print(f"order : {detail['jumlah_order_raw']} → {detail['jumlah_order']}")
        print("---")

        results.append({
            "platform":         "sribu",
            "kategori_utama":   kategori,
            "sub_kategori":     sub_kategori,
            "judul_listing":    item["judul_listing"],
            "url_listing":      item["url_listing"],
            **detail,
        })

        time.sleep(random.uniform(1, 2))

    return results

# =============================================
# MAIN
# =============================================
def main():
    logger.info("Mulai scraping Sribu.com...")
    logger.info(f"Output: {os.path.abspath(OUTPUT_FILE)}")

    driver   = create_driver()
    all_data = []

    try:
        for kategori, sub_list in TARGET_CATEGORIES.items():
            logger.info(f"\n{'='*55}")
            logger.info(f"Kategori: {kategori}")
            logger.info(f"{'='*55}")

            for sub_kategori, url in sub_list:
                logger.info(f"\n  {sub_kategori}")
                data = scrape_category(driver, url, kategori, sub_kategori)
                all_data.extend(data)

    finally:
        driver.quit()
        logger.info("\nBrowser ditutup.")

    if all_data:
        df = pd.DataFrame(all_data)

        cols = [
            "platform", "kategori_utama", "sub_kategori",
            "judul_listing", "harga", "rating", "jumlah_order",
            "url_listing", "harga_raw", "rating_raw", "jumlah_order_raw",
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
        logger.info(df[["harga", "rating", "jumlah_order"]].isna().sum().to_string())
    else:
        logger.warning("Tidak ada data!")


if __name__ == "__main__":
    main()