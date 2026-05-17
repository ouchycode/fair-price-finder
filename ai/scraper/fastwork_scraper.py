import os
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

OUTPUT_DIR  = os.path.join("..", "..", "data", "raw", "fastwork")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "fastwork_raw.csv")
os.makedirs(OUTPUT_DIR, exist_ok=True)

DELAY_MIN  = 2
DELAY_MAX  = 4
MAX_PAGES  = 5
WAIT_TIME  = 10

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
        # Copywriting → 0 listing di Fastwork, sudah tercakup di Penulisan Konten
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

def get_text_safe(element, selector: str) -> str | None:
    try:
        return element.find_element(By.CSS_SELECTOR, selector).text.strip()
    except NoSuchElementException:
        return None

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
                }

                results.append(data)

            except Exception as e:
                logger.warning(f"  Gagal parse card: {e}")
                continue

        return results

    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return []


def scrape_category(driver: webdriver.Chrome, url: str, kategori: str, sub_kategori: str) -> list[dict]:
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

#main function
def main():
    logger.info("Mulai scraping Fastwork.id...")
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

        # Append ke data yang sudah ada
        if os.path.exists(OUTPUT_FILE):
            df_existing = pd.read_csv(OUTPUT_FILE)
            df = pd.concat([df_existing, df], ignore_index=True)

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