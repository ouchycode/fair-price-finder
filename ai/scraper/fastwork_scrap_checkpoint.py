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
DETAIL_DELAY_MIN = 2
DETAIL_DELAY_MAX = 4
MAX_PAGES  = 5
WAIT_TIME  = 10

TARGET_CATEGORIES = {
    "Web dan Pemrograman": [
        ("Web Development", "https://fastwork.id/web-development"),
        ("Data Science", "https://fastwork.id/data-science"),
    ],
}

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
    service = Service(ChromeDriverManager().install())
    driver  = webdriver.Chrome(service=service, options=options)
    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    return driver

# ============================================================
# PARSER
# ============================================================

def parse_harga(text):
    if not text:
        return None
    cleaned = text.replace("Rp", "").replace(".", "").replace(",", "").strip()
    try:
        return int(cleaned)
    except:
        return None

def parse_rating(text):
    if not text:
        return None
    try:
        return float(text.strip().split()[0].replace(",", "."))
    except:
        return None

def parse_jumlah_order(text):
    if not text:
        return None
    cleaned = text.replace("Terjual", "").replace(".", "").strip()
    try:
        return int(cleaned)
    except:
        return None

def parse_durasi(text):
    if not text:
        return None
    text = text.lower()
    match = re.search(r'(\d+)\s*(hari|minggu|bulan|jam)', text)
    if not match:
        return None
    angka = int(match.group(1))
    satuan = match.group(2)
    if satuan == "hari":
        return angka
    if satuan == "minggu":
        return angka * 7
    if satuan == "bulan":
        return angka * 30
    if satuan == "jam":
        return max(1, round(angka / 24))
    return None

def get_text_safe(element, selector):
    try:
        return element.find_element(By.CSS_SELECTOR, selector).text.strip()
    except:
        return None

# ============================================================
# SCRAPE LISTING
# ============================================================

def scrape_page(driver, url, kategori, sub_kategori):
    try:
        driver.get(url)
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

        wait = WebDriverWait(driver, WAIT_TIME)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.card-product")))
        cards = driver.find_elements(By.CSS_SELECTOR, "a.card-product")

        results = []
        for card in cards:
            data = {
                "platform": "fastwork",
                "kategori_utama": kategori,
                "sub_kategori": sub_kategori,
                "judul_listing": get_text_safe(card, "h3.title"),
                "harga": parse_harga(get_text_safe(card, "span.price-number")),
                "rating": parse_rating(get_text_safe(card, "div.rating span")),
                "jumlah_order": parse_jumlah_order(get_text_safe(card, "div.sell-count span")),
                "url_listing": card.get_attribute("href"),
                "durasi_hari": None,
                "durasi_raw": None,
                "skills": None,
            }
            results.append(data)

        return results

    except Exception as e:
        logger.warning(f"Gagal scrape {url}: {e}")
        return []

def scrape_category_listings(driver, url, kategori, sub_kategori):
    all_results = []
    for page in range(1, MAX_PAGES + 1):
        page_url = f"{url}?page={page}" if page > 1 else url
        logger.info(f"Scrape: {page_url}")
        results = scrape_page(driver, page_url, kategori, sub_kategori)
        if not results:
            break
        all_results.extend(results)
    return all_results

# ============================================================
# SCRAPE DETAIL
# ============================================================

def scrape_detail(driver, url):
    empty = {"durasi_raw": None, "durasi_hari": None, "skills": None}
    try:
        driver.get(url)
        time.sleep(random.uniform(DETAIL_DELAY_MIN, DETAIL_DELAY_MAX))

        durasi_raw = None
        elements = driver.find_elements(By.CSS_SELECTOR, "span, p, div")
        for el in elements:
            text = el.text.strip()
            if re.search(r'\d+\s*(hari|minggu|bulan|jam)', text, re.I):
                durasi_raw = text
                break

        return {
            "durasi_raw": durasi_raw,
            "durasi_hari": parse_durasi(durasi_raw),
            "skills": None
        }

    except:
        return empty

# ============================================================
# MAIN (RESUME + CHECKPOINT ENABLED)
# ============================================================

def main():
    logger.info("Start scraping Fastwork (RESUME MODE ENABLED)")

    scraped_urls = set()
    df_existing = None

    if os.path.exists(OUTPUT_FILE):
        df_existing = pd.read_csv(OUTPUT_FILE)
        scraped_urls = set(
            df_existing.loc[df_existing["durasi_hari"].notna(), "url_listing"]
        )
        logger.info(f"Resume mode: {len(scraped_urls)} detail sudah ada.")

    driver = create_driver()
    all_data = []

    try:
        # STEP 1
        for kategori, sub_list in TARGET_CATEGORIES.items():
            for sub_kategori, url in sub_list:
                data = scrape_category_listings(driver, url, kategori, sub_kategori)
                all_data.extend(data)

        logger.info(f"Total listing ditemukan: {len(all_data)}")

        # STEP 2 (RESUME SAFE)
        for i, row in enumerate(all_data):

            url = row["url_listing"]
            if not url:
                continue

            if url in scraped_urls:
                logger.info(f"SKIP (sudah ada): {url}")
                continue

            logger.info(f"[{i+1}/{len(all_data)}] {row['judul_listing']}")

            detail = scrape_detail(driver, url)
            row["durasi_raw"] = detail["durasi_raw"]
            row["durasi_hari"] = detail["durasi_hari"]
            row["skills"] = detail["skills"]

            scraped_urls.add(url)

            # CHECKPOINT setiap 10 detail
            if len(scraped_urls) % 10 == 0:
                df_temp = pd.DataFrame(all_data)
                if df_existing is not None:
                    df_temp = pd.concat([df_existing, df_temp], ignore_index=True)
                df_temp = df_temp.drop_duplicates(subset=["url_listing"], keep="last")
                df_temp.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
                logger.info("Checkpoint saved.")

    except KeyboardInterrupt:
        logger.info("Dihentikan manual (Ctrl+C). Saving progress...")

    finally:
        driver.quit()

    # FINAL SAVE
    df_new = pd.DataFrame(all_data)

    if df_existing is not None:
        df_final = pd.concat([df_existing, df_new], ignore_index=True)
    else:
        df_final = df_new

    df_final = df_final.drop_duplicates(subset=["url_listing"], keep="last")
    df_final.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

    logger.info("Selesai. Data aman tersimpan.")

if __name__ == "__main__":
    main()