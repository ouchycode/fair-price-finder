"""
Consultation Module
Tips untuk Freelancer/Client berbasis Groq API
"""

import os
from textwrap import dedent
from typing import Optional
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name('.env'), override=True)

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("Groq library not installed")


GROQ_MODEL = os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b')


class ConsultationService:
    def generate_groq_consultation(
        self,
        role: str,
        skills: list,
        durasi_hari: int,
        predicted_price: int,
        category: Optional[str] = None,
        project_type: Optional[str] = None,
    ) -> str:
        return generate_groq_consultation(
            role=role,
            skills=skills,
            durasi_hari=durasi_hari,
            predicted_price=predicted_price,
            category=category,
            project_type=project_type,
        )

    def is_groq_available(self) -> bool:
        return is_groq_available()

    def get_groq_status(self) -> dict:
        return get_groq_status()


consultation_service = ConsultationService()


def build_consultation_prompt(
    role: str,
    skills: list,
    durasi_hari: int,
    predicted_price: int,
    category: Optional[str] = None,
    project_type: Optional[str] = None,
) -> list:
    """Buat prompt untuk konsultasi."""
    role = (role or 'freelancer').lower()
    skills_text = ', '.join(skills) if skills else 'tidak disebutkan'
    category_text = category if category else 'tidak disebutkan'
    project_text = project_type if project_type else 'General / Tidak spesifik'

    system_prompt = dedent("""
    Kamu konsultan freelance ahli di pasar Indonesia.
    Tugasmu memberi saran PRAKTIS yang SANGAT SPESIFIK berdasarkan Tipe Proyek, Skill, dan Durasi yang diberikan.

    ATURAN:
    - MAKSIMAL 100 kata (Singkat & Padat).
    - Bahasa Indonesia santai & profesional.
    - Jangan ulangi data yang sudah ada di input.
    - Fokus pada ACTIONABLE TIPS (Apa yang harus dilakukan selanjutnya).
    - Sesuaikan sudut pandang (Freelauncer vs Klien).
""").strip()

    if role == 'client':
        user_prompt = dedent(f"""
    Saya adalah KLIEN yang ingin menyewa freelancer.

    Detail project:
    - Kategori: {category_text}
    - Tipe Proyek: {project_text}
    - Skills dibutuhkan: {skills_text}
    - Durasi Target: {durasi_hari} hari
    - Estimasi harga wajar: Rp {predicted_price:,}

    Berikan 3 tips poin praktis khusus untuk KLIEN:
    - Apa yang harus divalidasi dari portofolio freelancer untuk Tipe Proyek ini?
    - Bagaimana mengelola ekspektasi untuk durasi {durasi_hari} hari?
    - Tips negosiasi agar mendapatkan kualitas terbaik dengan budget Rp {predicted_price:,}.
""").strip()
    else:
        user_prompt = dedent(f"""
    Saya adalah FREELANCER yang akan menawarkan jasa.

    Detail project:
    - Kategori: {category_text}
    - Tipe Proyek: {project_text}
    - Skills saya: {skills_text}
    - Durasi Pengerjaan: {durasi_hari} hari
    - Estimasi harga wajar: Rp {predicted_price:,}

    Berikan 3 tips poin praktis khusus untuk FREELANCER:
    - Bagaimana meyakinkan klien bahwa harga Rp {predicted_price:,} ini sepadan untuk Tipe Proyek ini?
    - Strategi milestone/pembayaran untuk durasi {durasi_hari} hari.
    - Red flags/tanda bahaya dari klien yang harus dihindari.
""").strip()

    return [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_prompt},
    ]


def generate_groq_consultation(
    role: str,
    skills: list,
    durasi_hari: int,
    predicted_price: int,
    category: Optional[str] = None,
    project_type: Optional[str] = None,
) -> str:
    """Generate konsultasi dengan Groq."""
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')

    if not GROQ_API_KEY or not GROQ_AVAILABLE:
        raise RuntimeError('Groq tidak tersedia atau GROQ_API_KEY belum disetel')

    try:
        client = Groq(api_key=GROQ_API_KEY)
        messages = build_consultation_prompt(
            role=role,
            skills=skills,
            durasi_hari=durasi_hari,
            predicted_price=predicted_price,
            category=category,
            project_type=project_type,
        )

        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.5,
            max_tokens=1024,
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error calling Groq API: {e}")
        raise


def is_groq_available() -> bool:
    """Cek apakah Groq tersedia."""
    return GROQ_AVAILABLE and os.getenv('GROQ_API_KEY') is not None


def get_groq_status() -> dict:
    """Ambil status Groq integration."""
    return {
        'groq_library_installed': GROQ_AVAILABLE,
        'groq_api_key_set': os.getenv('GROQ_API_KEY') is not None,
        'ready': GROQ_AVAILABLE and os.getenv('GROQ_API_KEY') is not None,
    }


if __name__ == "__main__":
    print("=" * 50)
    print("CONSULTATION MODULE - TEST")
    print("=" * 50)

    status = get_groq_status()
    print(f"\nGroq Status:")
    print(f"  Library installed: {status['groq_library_installed']}")
    print(f"  API key set: {status['groq_api_key_set']}")
    print(f"  Ready to use: {status['ready']}")

    if status['ready']:
        sample = generate_groq_consultation(
            role='freelancer',
            skills=['figma', 'ui ux design'],
            durasi_hari=14,
            predicted_price=850000,
        )
        print(f"\nSample consultation:\n{sample}")
    else:
        print("\nGroq belum siap. Set GROQ_API_KEY untuk test.")

    print("\n" + "=" * 50)
