import pandas as pd
import numpy as np

df = pd.read_csv("merged_raw.csv")
print(f"Shape awal: {df.shape}")
print("Missing sebelum:\n", df.isnull().sum())

# ── 1. HARGA ───────────────────────────────────────────────
# Isi dengan median per platform + sub_kategori
df["harga"] = df.groupby(["platform", "sub_kategori"])["harga"].transform(
    lambda x: x.fillna(x.median())
)
# Fallback: median global sub_kategori
df["harga"] = df.groupby("sub_kategori")["harga"].transform(
    lambda x: x.fillna(x.median())
)

# ── 2. DURASI_HARI ─────────────────────────────────────────
df["durasi_hari"] = df.groupby(["platform", "sub_kategori"])["durasi_hari"].transform(
    lambda x: x.fillna(x.median())
)
df["durasi_hari"] = df.groupby("sub_kategori")["durasi_hari"].transform(
    lambda x: x.fillna(x.median())
)
df["durasi_hari"] = df["durasi_hari"].fillna(df["durasi_hari"].median()).astype(int)

# ── 3. RATING ──────────────────────────────────────────────
# projects.co.id tidak punya sistem rating → biarkan NaN
# Fastwork/Sribu tanpa order → 0.0 (seller baru)
# Fastwork/Sribu ada order tapi rating kosong → median platform
for platform in ["fastwork", "sribu"]:
    mask_new = (
        (df["platform"] == platform)
        & df["rating"].isnull()
        & df["jumlah_order"].isnull()
    )
    df.loc[mask_new, "rating"] = 0.0

    mask_has_order = (
        (df["platform"] == platform)
        & df["rating"].isnull()
        & df["jumlah_order"].notna()
    )
    median_r = df[df["platform"] == platform]["rating"].median()
    df.loc[mask_has_order, "rating"] = median_r

df["rating"] = df["rating"].fillna(df["rating"].median())


# ── 4. JUMLAH_ORDER ────────────────────────────────────────
# Seller baru (rating 0) → order 0
df.loc[df["rating"] == 0.0, "jumlah_order"] = (
    df.loc[df["rating"] == 0.0, "jumlah_order"].fillna(0)
)
# Sisanya → median per platform + sub_kategori
df["jumlah_order"] = df.groupby(["platform", "sub_kategori"])["jumlah_order"].transform(
    lambda x: x.fillna(x.median())
)
df["jumlah_order"] = df.groupby("platform")["jumlah_order"].transform(
    lambda x: x.fillna(x.median())
)
df["jumlah_order"] = df["jumlah_order"].fillna(0).astype(int)

# ── 5. SKILLS ──────────────────────────────────────────────
# Inferensikan dari sub_kategori + hints di judul_listing
SKILLS_MAP = {
    "Web Development":    "Web Development",
    "Web Design":         "UI/UX, Figma, Web Design",
    "Mobile Application": "Flutter, Android, iOS",
    "UI & UX Design":     "Figma, Adobe XD, Prototyping",
    "Logo Design":        "Adobe Illustrator, CorelDraw, Branding",
    "Infografis":         "Adobe Illustrator, Canva, Infografis",
    "Presentasi":         "PowerPoint, Canva, Presentasi",
    "Motion Graphics":    "After Effects, Motion Graphics, Adobe Premiere",
    "Video Editing":      "Adobe Premiere, DaVinci Resolve, Video Editing",
    "Digital Marketing":  "Google Ads, Meta Ads, Digital Marketing",
    "SEO":                "SEO, Google Analytics, Keyword Research",
    "Social Media Mgmt":  "Content Planning, Copywriting, Social Media",
    "Content Creator":    "Copywriting, Content Strategy, Social Media",
    "Penulisan Konten":   "Copywriting, Content Writing, SEO Writing",
    "Penerjemahan":       "Terjemahan, Bahasa Inggris, Bahasa Indonesia",
    "Entri Data":         "Microsoft Excel, Data Entry, Google Sheets",
    "Data Analysis":      "Python, Excel, Tableau, Data Analysis",
    "Data Science":       "Python, Machine Learning, Data Science",
    "Machine Learning":   "Python, TensorFlow, Scikit-learn, Machine Learning",
    "Chatbot":            "Python, Dialogflow, Chatbot Development",
    "AI Automation":      "Python, AI, Automation, LLM",
}

KEYWORD_MAP = {
    "wordpress": "WordPress", "laravel": "Laravel", "react": "React",
    "flutter": "Flutter", "python": "Python", "seo": "SEO",
    "figma": "Figma", "shopify": "Shopify", "codeigniter": "CodeIgniter",
    "node": "Node.js", "vue": "Vue.js", "android": "Android",
    "ios": "iOS", "kotlin": "Kotlin", "swift": "Swift",
    "tensorflow": "TensorFlow", "tableau": "Tableau", "sql": "SQL",
    "google ads": "Google Ads", "meta ads": "Meta Ads",
    "after effects": "After Effects", "premiere": "Adobe Premiere",
}

def infer_skills(row):
    if pd.notna(row["skills"]):
        return row["skills"]
    base = SKILLS_MAP.get(row["sub_kategori"], row["sub_kategori"])
    judul = str(row["judul_listing"]).lower()
    extras = [
        skill for kw, skill in KEYWORD_MAP.items()
        if kw in judul and skill not in base
    ]
    return base + (", " + ", ".join(extras) if extras else "")

df["skills"] = df.apply(infer_skills, axis=1)

# ── OUTPUT ─────────────────────────────────────────────────
print(f"\nShape akhir: {df.shape}")
print("Missing sesudah:\n", df.isnull().sum())
df.to_csv("merged_raw_imputed.csv", index=False)
print("\nSaved: merged_raw_imputed.csv")