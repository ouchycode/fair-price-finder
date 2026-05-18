# ============================================================================
# CONSULTATION MODULE - Fair Price Finder
#
# Berisi fungsi untuk konsultasi harga berbasis Groq
# ============================================================================

import os
from textwrap import dedent
from typing import Optional, Dict
import json
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name('.env'), override=True)

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except Exception:
    PANDAS_AVAILABLE = False

# Cached DataFrame for merged cleaned data
_MERGED_DF = None

def load_merged_data():
    """Lazily load merged cleaned data if available (returns pandas.DataFrame or None)."""
    global _MERGED_DF
    if _MERGED_DF is not None:
        return _MERGED_DF
    if not PANDAS_AVAILABLE:
        return None

    candidates = [
        Path(__file__).parent.parent / 'data' / 'raw' / 'data' / 'cleaned' / 'merged_cleaned.csv',
        Path(__file__).parent.parent / 'data' / 'raw' / 'data' / 'cleaned' / 'merged_raw_imputed.csv',
    ]
    for p in candidates:
        try:
            if p.exists():
                _MERGED_DF = pd.read_csv(p)
                return _MERGED_DF
        except Exception as e:
            print(f"⚠️  Could not load merged data {p}: {e}")
    return None

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("Groq library tidak terinstall.")

# Import inference module untuk context
try:
    from inference import detect_category, get_valid_skills, get_valid_categories
    INFERENCE_AVAILABLE = True
except ImportError:
    INFERENCE_AVAILABLE = False
    detect_category = None


# ============================================================================
# 1. GROQ CONFIGURATION
# ============================================================================

GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')


class ConsultationService:
    def get_market_context(self) -> Dict:
        return get_market_context()

    def get_skill_price_context(self, skills: list) -> Dict:
        return get_skill_price_context(skills)

    def build_market_context_text(
        self,
        skills: list,
        durasi_hari: int,
        predicted_price: int,
        price_min: int,
        price_max: int,
    ) -> str:
        return build_market_context_text(
            skills=skills,
            durasi_hari=durasi_hari,
            predicted_price=predicted_price,
            price_min=price_min,
            price_max=price_max,
        )

    def build_consultation_prompt(
        self,
        role: str,
        skills: list,
        durasi_hari: int,
        predicted_price: int,
        price_min: int,
        price_max: int,
        market_context_text: str = '',
    ) -> list:
        return build_consultation_prompt(
            role=role,
            skills=skills,
            durasi_hari=durasi_hari,
            predicted_price=predicted_price,
            price_min=price_min,
            price_max=price_max,
            market_context_text=market_context_text,
        )

    def generate_groq_consultation(
        self,
        role: str,
        skills: list,
        durasi_hari: int,
        predicted_price: int,
        price_min: int,
        price_max: int,
        category: Optional[str] = None,
    ) -> str:
        return generate_groq_consultation(
            role=role,
            skills=skills,
            durasi_hari=durasi_hari,
            predicted_price=predicted_price,
            price_min=price_min,
            price_max=price_max,
            category=category,
        )

    def is_groq_available(self) -> bool:
        return is_groq_available()

    def get_groq_status(self) -> dict:
        return get_groq_status()


consultation_service = ConsultationService()


# ============================================================================
# 2. MARKET CONTEXT PROVIDERS
# ============================================================================

def get_market_context() -> Dict:
    """
    Get market context data dari model metadata.
    Ini digunakan untuk kasih Groq informasi tentang market yang lebih lengkap.
    """
    # Prefer model metadata if present
    try:
        metadata_path = Path(__file__).parent.parent / 'data' / 'models' / 'model_metadata.json'
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"Peringatan: gagal memuat metadata pasar: {e}")

    # Otherwise try to build summary from merged cleaned dataset
    df = load_merged_data()
    if df is not None:
        try:
            prices = pd.to_numeric(df.get('harga', df.get('price', [])), errors='coerce').dropna()
            dataset_size = int(len(df))
            avg_price = int(prices.mean()) if not prices.empty else 0
            median_price = int(prices.median()) if not prices.empty else 0
            price_p25 = int(prices.quantile(0.25)) if not prices.empty else 0
            price_p75 = int(prices.quantile(0.75)) if not prices.empty else 0

            categories = df.get('kategori_utama', df.get('category', pd.Series())).dropna().unique().tolist()

            # extract popular skills from skills_text or skills column
            popular_skills = []
            if 'skills_text' in df.columns:
                try:
                    skills_series = df['skills_text'].dropna().astype(str).str.split(',').explode().str.strip()
                    popular_skills = skills_series.value_counts().head(12).index.tolist()
                except Exception:
                    popular_skills = []

            return {
                'dataset_size': dataset_size,
                'avg_price': avg_price,
                'median_price': median_price,
                'price_p25': price_p25,
                'price_p75': price_p75,
                'categories': categories,
                'popular_skills': popular_skills,
            }
        except Exception as e:
            print(f"⚠️  Error summarizing merged data: {e}")

    # Minimal fallback to avoid baked-in biases.
    return {
        'dataset_size': 0,
        'avg_price': 0,
        'median_price': 0,
        'price_p25': 0,
        'price_p75': 0,
        'categories': [],
        'popular_skills': [],
    }


def get_skill_price_context(skills: list) -> Dict:
    """
    Get pricing context untuk skill-skill yang diberikan.
    """
    df = load_merged_data()
    if df is None:
        # If no data available, raise — we intentionally do not fallback to hardcoded mapping
        raise ValueError('Merged dataset not available to compute skill pricing context')

    # normalize skills to lowercase for matching
    skills_norm = [s.strip().lower() for s in skills if isinstance(s, str) and s.strip()]
    if not skills_norm:
        raise ValueError('No valid skills provided')

    prices = []
    for sk in skills_norm:
        # look for skills_text column (comma-separated) or skills list
        if 'skills_text' in df.columns:
            matches = df[df['skills_text'].fillna('').str.lower().str.contains(sk)]
        elif 'skills' in df.columns:
            matches = df[df['skills'].apply(lambda x: sk in str(x).lower())]
        else:
            matches = df.iloc[0:0]

        # collect numeric harga values
        if not matches.empty:
            try:
                vals = pd.to_numeric(matches.get('harga', matches.get('price', [])), errors='coerce').dropna()
                if not vals.empty:
                    prices.append(int(vals.mean()))
            except Exception:
                pass

    if not prices:
        # no data found for provided skills
        raise ValueError('Tidak ada pricing context dalam dataset untuk skills yang diberikan')

    avg_price_for_skills = sum(prices) // len(prices)
    return {
        'avg_price_for_skills': int(avg_price_for_skills),
        'skill_count': len(skills_norm),
        'complexity': 'high' if len(skills_norm) > 3 else 'medium' if len(skills_norm) > 1 else 'low'
    }


def build_market_context_text(
    skills: list,
    durasi_hari: int,
    predicted_price: int,
    price_min: int,
    price_max: int
) -> str:
    """
    Build konteks market yang kaya untuk diberikan ke Groq.
    """
    market = get_market_context()
    skill_context = get_skill_price_context(skills)
    
    # Calculate rate per hari
    rate_per_day = predicted_price // durasi_hari if durasi_hari > 0 else 0
    
    context_lines = [
        f"Market Context:",
        f" - Dataset yang digunakan: {market.get('dataset_size', '1000+')} proyek freelance",
        f" - Harga rata-rata market: Rp {market.get('avg_price', 1200000):,}",
        f" - Harga median: Rp {market.get('median_price', 950000):,}",
        f" - Quartil 25%: Rp {market.get('price_p25', 500000):,}",
        f" - Quartil 75%: Rp {market.get('price_p75', 1800000):,}",
        f"",
        f"Project Context:",
        f" - Skill complexity: {skill_context.get('complexity', 'low')}",
        f" - Rata-rata price untuk skills serupa: Rp {skill_context.get('avg_price_for_skills', 1200000):,}",
        f" - Rate per hari yang diprediksi: Rp {rate_per_day:,}/hari",
        f" - Durasi: {durasi_hari} hari",
    ]
    # Jika data gabungan tersedia, tambahkan contoh listing untuk konteks
    df = load_merged_data()
    if df is not None and len(df) > 0:
        try:
            # find rows that match any of the skills
            skills_lower = [s.lower() for s in skills]
            def row_matches(skills_text):
                if not isinstance(skills_text, str):
                    return False
                st = skills_text.lower()
                return any(sk in st for sk in skills_lower)

            examples = df[df['skills_text'].apply(lambda x: row_matches(x) if pd.notna(x) else False)]
            if examples.shape[0] == 0:
                examples = df.sample(min(3, len(df)))
            else:
                examples = examples.head(3)

            context_lines.append("")
            context_lines.append("Contoh listing serupa di marketplace:")
            for _, r in examples.iterrows():
                title = r.get('judul_listing') or r.get('judul') or ''
                price = int(r.get('harga', 0)) if pd.notna(r.get('harga', None)) else ''
                url = r.get('url_listing') or r.get('url', '')
                context_lines.append(f" - {title} - Rp {price:,} - {url}")
        except Exception as e:
            # ignore example retrieval errors
            pass

    return '\n'.join(context_lines)


# ============================================================================
# 3. PROMPT BUILDERS
# ============================================================================

def build_consultation_prompt(
    role: str,
    skills: list,
    durasi_hari: int,
    predicted_price: int,
    price_min: int,
    price_max: int,
    market_context_text: str = '',
) -> list:
    """
    Build prompt untuk konsultasi harga yang user-facing.
    
    Args:
        role: 'freelancer' atau 'client'
        skills: list of skills
        durasi_hari: durasi project
        predicted_price: prediksi harga dari model
        price_min: minimum price range
        price_max: maximum price range
    Returns:
        list: messages untuk Groq API
    """
    role = (role or 'freelancer').lower()
    skills_text = ', '.join(skills) if skills else 'tidak disebutkan'
    
    system_prompt = dedent("""
    Kamu adalah konsultan pricing freelance Indonesia
    yang membantu freelancer pemula dan client memahami
    harga project secara realistis.

    Jawaban harus:
    - singkat dan praktis
    - fokus pada workload dan scope project
    - tidak terlalu teoritis atau motivasional
    - menggunakan Bahasa Indonesia yang mudah dipahami

    Untuk setiap jawaban:
    1. jelaskan scope project yang biasanya sesuai dengan range harga tersebut
    2. beri saran negosiasi yang realistis
    3. beri warning jika ada risiko underpaid atau scope terlalu besar
    4. sebutkan faktor yang bisa membuat harga naik atau turun
    5. sebutkan biaya tambahan hanya jika memang relevan dengan skills/project

    Hindari jawaban generic seperti:
    - "harga masih wajar"
    - "boleh dinegosiasikan"
    tanpa penjelasan tambahan.

    Fokus pada:
    - jumlah pekerjaan
    - revisi
    - kompleksitas skill
    - effort pengerjaan
    - ekspektasi client
""").strip()
    
    if role == 'client':
       user_prompt = dedent(f"""
    {market_context_text}

    User adalah freelancer pemula dengan detail project:

    - Skills: {skills_text}
    - Durasi pengerjaan: {durasi_hari} hari
    - Estimasi harga model: Rp {predicted_price:,}
    - Range harga market: Rp {price_min:,} - Rp {price_max:,}

    Berikan konsultasi pricing yang realistis dan actionable.

    Jelaskan:
    - scope project yang biasanya sesuai dengan range harga ini
    - kapan freelancer sebaiknya menaikkan harga
    - kapan harga bisa diturunkan agar tetap kompetitif
    - risiko jika mengambil harga terlalu rendah
    - cara negosiasi yang sopan dan realistis

    Jika relevan, sebutkan biaya tambahan yang sering muncul
    berdasarkan skills project.

    Jangan memberikan jawaban terlalu umum.
    Gunakan reasoning berdasarkan workload dan ekspektasi project.
""").strip()
    else:
        user_prompt = dedent(f"""
    {market_context_text}

    User adalah client dengan detail project:

    - Skills: {skills_text}
    - Durasi pengerjaan: {durasi_hari} hari
    - Estimasi harga model: Rp {predicted_price:,}
    - Range harga market: Rp {price_min:,} - Rp {price_max:,}

    Berikan konsultasi budget yang realistis dan praktis.

    Jelaskan:
    - scope project yang biasanya didapat pada range harga ini
    - bagaimana menyesuaikan scope jika budget terbatas
    - kapan client perlu menaikkan budget
    - hal yang sebaiknya diklarifikasi sebelum deal project
    - cara negosiasi yang sopan tanpa merugikan freelancer

    Jika relevan, sebutkan biaya tambahan yang mungkin muncul.

    Jangan memberi jawaban generic.
    Fokus pada workload, kompleksitas project, dan ekspektasi hasil.
""").strip()
    return [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_prompt},
    ]

# ============================================================================
# 4. CONSULTATION GENERATOR
# ============================================================================

def generate_groq_consultation(
    role: str,
    skills: list,
    durasi_hari: int,
    predicted_price: int,
    price_min: int,
    price_max: int,
    category: Optional[str] = None
) -> str:
    """Generate konsultasi pricing dengan Groq dan konteks market."""
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    role = (role or 'freelancer').lower().strip()

    if not category and INFERENCE_AVAILABLE:
        category = detect_category(skills)
    # If category still None, proceed without it (user requested no hardcoded categories)

    market_context_text = build_market_context_text(skills, durasi_hari, predicted_price, price_min, price_max)

    if not GROQ_API_KEY or not GROQ_AVAILABLE:
        raise RuntimeError('Groq tidak tersedia atau GROQ_API_KEY belum disetel')

    try:
        client = Groq(api_key=GROQ_API_KEY)
        messages = build_consultation_prompt(
            role=role,
            skills=skills,
            durasi_hari=durasi_hari,
            predicted_price=predicted_price,
            price_min=price_min,
            price_max=price_max,
            market_context_text=market_context_text,
        )

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.4,
            max_tokens=400,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        print(f"⚠️  Error calling Groq API: {e}")
        raise


# ============================================================================
# 5. HELPER FUNCTIONS
# ============================================================================

def is_groq_available() -> bool:
    """Check if Groq API is available."""
    return GROQ_AVAILABLE and os.getenv('GROQ_API_KEY') is not None


def get_groq_status() -> dict:
    """Get status Groq integration."""
    return {
        'groq_library_installed': GROQ_AVAILABLE,
        'groq_api_key_set': os.getenv('GROQ_API_KEY') is not None,
        'ready': GROQ_AVAILABLE and os.getenv('GROQ_API_KEY') is not None,
    }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("CONSULTATION MODULE - TEST")
    print("="*60)

    status = get_groq_status()
    print(f"\n📊 Groq Status:")
    print(f"   Library installed: {status['groq_library_installed']}")
    print(f"   API key set: {status['groq_api_key_set']}")
    print(f"   Ready to use: {status['ready']}")

    if status['ready']:
        sample = generate_groq_consultation(
            role='freelancer',
            skills=['figma', 'ui ux design'],
            durasi_hari=14,
            predicted_price=850000,
            price_min=680000,
            price_max=1020000,
        )
        print(f"\nSample consultation:\n{sample}")
    else:
        print("\nGroq belum siap. Set GROQ_API_KEY untuk menjalankan tes konsultasi.")

    print("\n" + "="*60)
