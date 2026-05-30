"""
Dashboard Explanatory Analysis — Fair Price Finder
Modern SaaS Style Dashboard
Tim: CC26-PSU164

Run:
streamlit run dashboard_fairPrice.py
"""


import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px


# CONFIG
st.set_page_config(
    page_title="Fair Price Finder",
    page_icon="../../frontend/src/assets/logo/logo-fpf.png",
    layout="wide",
    initial_sidebar_state="expanded"
)

BG_CARD = "#151925"

PURPLE = "#7B61FF"
BLUE   = "#3B82F6"
GREEN  = "#10B981"
ORANGE = "#F59E0B"
PINK   = "#EC4899"
GREY   = "#9CA3AF"

st.markdown("""
<style>

html, body, [class*="css"]{
    font-family:'Inter',sans-serif;
}

.main{
    background-color:#0b0d14;
    color:white;
}

.block-container{
    padding-top:1.5rem;
    padding-bottom:2rem;
    padding-left:2rem;
    padding-right:2rem;
}

section[data-testid="stSidebar"]{
    background:#090b12;
    border-right:1px solid #1d2230;
}

section[data-testid="stSidebar"] *{
    color:white;
}

.kpi-card{
    background:linear-gradient(145deg,#171b2b,#111522);
    border:1px solid #272b3d;
    padding:22px;
    border-radius:24px;
    box-shadow:0 0 18px rgba(123,97,255,0.10);
    text-align:center;
}

.kpi-title{
    color:#9CA3AF;
    font-size:15px;
    margin-bottom:10px;
}

.kpi-value{
    color:white;
    font-size:32px;
    font-weight:700;
}

.skill-legend{
    display:flex;
    gap:20px;
    margin-top:8px;
    font-size:13px;
    color:#9CA3AF;
}

.legend-dot{
    display:inline-block;
    width:12px;
    height:12px;
    border-radius:3px;
    margin-right:5px;
    vertical-align:middle;
}

</style>
""", unsafe_allow_html=True)

LEGEND_HTML = """
<div class="skill-legend">
    <span><span class="legend-dot" style="background:#7B61FF;"></span>Tech Skill</span>
    <span><span class="legend-dot" style="background:#EC4899;"></span>Marketing Skill</span>
    <span><span class="legend-dot" style="background:#F59E0B;"></span>Desain & Kreatif</span>
    <span><span class="legend-dot" style="background:#10B981;"></span>Video & Animasi</span>
    <span><span class="legend-dot" style="background:#38BDF8;"></span>Data & Analitik</span>
    <span><span class="legend-dot" style="background:#9CA3AF;"></span>Lainnya</span>
</div>
"""

# DATA
CSV_PATH = "../data/output/dataset_v2_finalmodel.csv"

CAT_MAP = {
    "Grafis & Desain": "kategori_Grafis & Desain",
    "Pemasaran & Periklanan": "kategori_Pemasaran & Periklanan",
    "Penulisan & Terjemahan": "kategori_Penulisan & Penerjemahan",
    "Visual & Audio": "kategori_Visual & Audio",
    "Web & Pemrograman": "kategori_Web dan Pemrograman",
}

PLAT_COLORS = {
    "Fastwork": BLUE,
    "Sribu": GREEN,
    "Projects": ORANGE
}

DUR_BINS = [0, 1, 3, 7, 14, 30, 999]

DUR_LABELS = [
    "1 Hari",
    "2-3 Hari",
    "4-7 Hari",
    "8-14 Hari",
    "15-30 Hari",
    ">30 Hari"
]

# LOAD DATA
@st.cache_data
def load_data():

    df = pd.read_csv(CSV_PATH)

    df["platform"] = "Fastwork"
    df.loc[df["platform_sribu"] == 1, "platform"] = "Sribu"
    df.loc[df["platform_projects"] == 1, "platform"] = "Projects"

    df["dur_bucket"] = pd.cut(
        df["durasi_hari"],
        bins=DUR_BINS,
        labels=DUR_LABELS
    )

    return df

try:
    df = load_data()
except:
    st.error("Dataset tidak ditemukan.")
    st.stop()

skill_cols = [
    c for c in df.columns
    if c.startswith("skill_")
]

# ALL SKILL DATA
all_skill_rows = []

for s in skill_cols:

    sub = df[df[s] == 1]["price_single"]

    if len(sub) < 10:
        continue

    all_skill_rows.append({
        "Skill":
        s.replace("skill_", "")
         .replace("_", " ")
         .title(),
        "Median": sub.median() / 1000,
        "Jumlah": len(sub),
        "col": s
    })

all_skill_df = pd.DataFrame(all_skill_rows)
all_skill_df = all_skill_df.sort_values("Median", ascending=False)

def fmt_rp(x):
    if x >= 1_000_000:
        return f"Rp {x/1e6:.1f} jt"
    return f"Rp {x/1e3:.0f} rb"

# SIDEBAR
with st.sidebar:

    st.image(
        "../../frontend/src/assets/logo/logo-fpf.png",
        width=85
    )

    st.markdown("# Fair Price Finder")
    st.caption("CC26-PSU164 | Coding Camp 2026")
    st.markdown("---")

    menu = st.radio(
        "Menu",
        ["Dashboard", "Skill Analysis"],
        label_visibility="collapsed"
    )

# COLOR HELPERS
dm_skills = [
    'skill_seo', 'skill_tiktok_ads', 'skill_instagram',
    'skill_google_ads', 'skill_meta_ads', 'skill_facebook_ads',
    'skill_copywriting', 'skill_content_writing'
]

tech_skills = [
    'skill_machine_learning', 'skill_python', 'skill_data_analysis',
    'skill_data_science', 'skill_deep_learning', 'skill_react',
    'skill_flutter', 'skill_javascript', 'skill_nextjs', 'skill_kotlin',
    'skill_laravel', 'skill_react_native', 'skill_wordpress',
    'skill_ui_ux_design', 'skill_figma', 'skill_php', 'skill_java',
    'skill_html_css', 'skill_mobile_programming', 'skill_swift',
    'skill_website', 'skill_website_building', 'skill_laravel_framework'
]

design_skills = [
    'skill_logo_design', 'skill_branding', 'skill_canva', 'skill_adobe_xd'
]

video_skills = [
    'skill_video_editing', 'skill_animation', 'skill_after_effects',
    'skill_video_production', 'skill_3d_modeling'
]

data_skills = [
    'skill_excel', 'skill_tableau', 'skill_power_bi'
]

def get_color(col):
    if col in dm_skills:
        return "#EC4899"
    if col in tech_skills:
        return "#7B61FF"
    if col in design_skills:
        return "#F59E0B"
    if col in video_skills:
        return "#10B981"
    if col in data_skills:
        return "#38BDF8"
    return "#9CA3AF"

# ══════════════════════════════════════════════
# DASHBOARD PAGE
# ══════════════════════════════════════════════
if menu == "Dashboard":

    st.title("Fair Price Finder Dashboard")
    st.caption("Modern Analytics Dashboard for Freelance Pricing")
    st.markdown("<br>", unsafe_allow_html=True)

    # KPI CARDS
    c1, c2, c3, c4 = st.columns(4)

    with c1:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Total Jasa Freelance</div>
            <div class="kpi-value">{len(df):,}</div>
        </div>
        """, unsafe_allow_html=True)

    with c2:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Median Harga</div>
            <div class="kpi-value">{fmt_rp(df["price_single"].median())}</div>
        </div>
        """, unsafe_allow_html=True)

    with c3:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Platform</div>
            <div class="kpi-value">{df["platform"].nunique()}</div>
        </div>
        """, unsafe_allow_html=True)

    with c4:
        st.markdown(f"""
        <div class="kpi-card">
            <div class="kpi-title">Skill</div>
            <div class="kpi-value">{len(skill_cols)}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # DROPDOWN FILTER KATEGORI SKILL
    SKILL_CATEGORY_MAP = {
        "Overall": None,
        "Tech Skill": tech_skills,
        "Marketing Skill": dm_skills,
        "Desain & Kreatif": design_skills,
        "Video & Animasi": video_skills,
        "Data & Analitik": data_skills,
    }

    filter_col, _ = st.columns([2, 8])
    with filter_col:
        selected_cat = st.selectbox(
            "Filter Kategori Skill",
            list(SKILL_CATEGORY_MAP.keys()),
            index=0
        )

    if SKILL_CATEGORY_MAP[selected_cat] is None:
        filtered_skill_df = all_skill_df.copy()
    else:
        filtered_skill_df = all_skill_df[
            all_skill_df["col"].isin(SKILL_CATEGORY_MAP[selected_cat])
        ].copy()

    # TOP & BOTTOM SKILL
    left, right = st.columns(2)

    # TOP 10
    with left:

        st.subheader("Top 10 Skill Harga Tertinggi")

        top10 = filtered_skill_df.head(10).copy()
        top10["Color"] = top10["col"].apply(get_color)

        fig = px.bar(
            top10[::-1],
            x="Median",
            y="Skill",
            orientation="h",
            text="Median",
            color="Color",
            color_discrete_map="identity"
        )

        fig.update_traces(
            texttemplate="Rp %{x:.0f}K",
            textposition="outside"
        )

        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor=BG_CARD,
            plot_bgcolor=BG_CARD,
            font_color="white",
            height=500,
            showlegend=False,
            xaxis_title="Median Harga (Rp ribu)",
            yaxis_title=""
        )

        st.plotly_chart(fig, width="stretch")
        st.markdown(LEGEND_HTML, unsafe_allow_html=True)

    # BOTTOM 10
    with right:

        st.subheader("Top 10 Skill Harga Terendah")

        bottom10 = (
            filtered_skill_df.sort_values("Median", ascending=True)
            .head(10)
            .sort_values("Median", ascending=False)
            .copy()
        )

        skill_order = bottom10["Skill"].tolist()
        bottom10["Color"] = bottom10["col"].apply(get_color)

        fig = px.bar(
            bottom10,
            x="Median",
            y="Skill",
            orientation="h",
            text="Median",
            color="Color",
            color_discrete_map="identity"
        )

        fig.update_traces(
            texttemplate="Rp %{x:.0f}K",
            textposition="outside"
        )

        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor=BG_CARD,
            plot_bgcolor=BG_CARD,
            font_color="white",
            height=500,
            showlegend=False,
            xaxis_title="Median Harga (Rp ribu)",
            yaxis_title="",
            yaxis=dict(
                categoryorder="array",
                categoryarray=skill_order
            )
        )

        st.plotly_chart(fig, width="stretch")
        st.markdown(LEGEND_HTML, unsafe_allow_html=True)

    # ROW 2
    col1, col2, col3 = st.columns([1.3, 1, 1])

    # BAR CHART KATEGORI
    with col1:

        st.subheader("Median Harga per Kategori")

        kategori_rows = []
        for nama, col in CAT_MAP.items():
            sub = df[df[col] == 1]["price_single"]
            kategori_rows.append({
                "Kategori": nama,
                "MedianHarga": sub.median() / 1000
            })

        kategori_df = pd.DataFrame(kategori_rows)

        fig = px.bar(
            kategori_df,
            x="Kategori",
            y="MedianHarga",
            color="Kategori",
            text="MedianHarga",
            color_discrete_sequence=[PURPLE, BLUE, GREEN, ORANGE, PINK]
        )

        fig.update_traces(
            texttemplate="Rp %{y:.0f}K",
            textposition="outside"
        )

        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor=BG_CARD,
            plot_bgcolor=BG_CARD,
            font_color="white",
            showlegend=False,
            height=470,
            xaxis_title="Kategori",
            yaxis_title="Median Harga (Rp ribu)",
            margin=dict(l=10, r=10, t=30, b=20)
        )

        st.plotly_chart(fig, width="stretch")

    # PLATFORM PIE
    with col2:

        st.subheader("Median Harga Platform")

        rows = []
        for p in ["Fastwork", "Sribu", "Projects"]:
            rows.append({
                "Platform": p,
                "Median": df[df["platform"] == p]["price_single"].median() / 1000
            })

        med_df = pd.DataFrame(rows)

        fig = px.pie(
            med_df,
            values="Median",
            names="Platform",
            hole=0.72,
            color="Platform",
            color_discrete_map=PLAT_COLORS
        )

        fig.update_traces(
            textinfo="percent+label",
            hovertemplate="<b>%{label}</b><br>Median Harga: Rp %{value:.0f}K<extra></extra>"
        )

        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor=BG_CARD,
            plot_bgcolor=BG_CARD,
            font_color="white",
            height=470,
            showlegend=False,
            margin=dict(l=10, r=10, t=30, b=10)
        )

        st.plotly_chart(fig, width="stretch")

    # RATING PIE
    with col3:

        st.subheader("Freelancer Rating")

        rating_counts = df["has_rating"].value_counts()

        fig = px.pie(
            values=rating_counts.values,
            names=["Has Rating", "No Rating"],
            hole=0.72,
            color_discrete_sequence=[PURPLE, GREY]
        )

        fig.update_layout(
            template="plotly_dark",
            paper_bgcolor=BG_CARD,
            plot_bgcolor=BG_CARD,
            font_color="white",
            height=470
        )

        st.plotly_chart(fig, width="stretch")

    # ROW 3 — DURASI
    st.subheader("Harga berdasarkan Durasi dan Kategori")

    durasi_rows = []
    for nama, col in CAT_MAP.items():
        temp = (
            df[df[col] == 1]
            .groupby("dur_bucket", observed=True)["price_single"]
            .median()
            .reset_index()
        )
        temp["Kategori"] = nama
        temp["MedianHarga"] = temp["price_single"] / 1000
        durasi_rows.append(temp)

    dur_df = pd.concat(durasi_rows)

    fig = px.bar(
        dur_df,
        x="dur_bucket",
        y="MedianHarga",
        color="Kategori",
        barmode="group",
        text="MedianHarga",
        color_discrete_sequence=[PURPLE, BLUE, GREEN, ORANGE, PINK]
    )

    fig.update_traces(
        texttemplate="Rp %{y:.0f}K",
        textposition="outside"
    )

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor=BG_CARD,
        plot_bgcolor=BG_CARD,
        font_color="white",
        height=550,
        xaxis_title="Durasi Project",
        yaxis_title="Median Harga (Rp ribu)",
        legend_title="Kategori",
        bargap=0.25,
        bargroupgap=0.08
    )

    st.plotly_chart(fig, width="stretch")

# ══════════════════════════════════════════════
# SKILL ANALYSIS PAGE
# ══════════════════════════════════════════════
elif menu == "Skill Analysis":

    st.title("All Skill Analysis")

    col1, col2 = st.columns([1, 8])

    with col1:
        jumlah_skill = st.selectbox(
            "Top Skill",
            [5, 10, 15, 20, 30],
            index=1
        )

    show_df = all_skill_df.head(jumlah_skill)

    fig = px.bar(
        show_df[::-1],
        x="Median",
        y="Skill",
        orientation="h",
        text="Median",
        color="Median",
        color_continuous_scale=["#4F46E5", "#7C3AED", "#A855F7"]
    )

    fig.update_traces(
        texttemplate="Rp %{x:.0f}K",
        textposition="outside"
    )

    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor=BG_CARD,
        plot_bgcolor=BG_CARD,
        font_color="white",
        height=max(450, len(show_df) * 45),
        coloraxis_showscale=False,
        margin=dict(l=20, r=60, t=30, b=20),
        xaxis_title="Median Harga (Rp ribu)",
        yaxis_title=""
    )

    st.plotly_chart(fig, width="stretch")

# FOOTER
st.markdown("<br><br>", unsafe_allow_html=True)
st.caption("Fair Price Finder Dashboard • CC26-PSU164")