# PERLU DI UPDATE

"""
Streamlit Dashboard - Fair Price Finder
Data Science requirement: interactive dashboard untuk insight pasar freelance.
Deploy ke Streamlit Cloud (Side Quest).
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(
    page_title="Fair Price Finder - Dashboard",
    page_icon="💰",
    layout="wide"
)

st.title("💰 Fair Price Finder - Market Insight Dashboard")
st.caption("CC26-PSU164 | Coding Camp 2026 powered by DBS Foundation")

# ─────────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────────
st.sidebar.header("Filter Data")
category_filter = st.sidebar.multiselect(
    "Kategori Jasa",
    ["Web Development", "Mobile Development", "UI/UX Design",
     "Data Science", "Content Writing", "Digital Marketing"],
    default=["Web Development"]
)

# ─────────────────────────────────────────────
# MAIN CONTENT - akan diisi setelah data tersedia
# ─────────────────────────────────────────────
col1, col2, col3 = st.columns(3)

with col1:
    st.metric("Rata-rata Harga", "Rp 1.200.000", "+5% vs bulan lalu")

with col2:
    st.metric("Total Data Proyek", "0", "Belum ada data")

with col3:
    st.metric("Skill Paling Dicari", "-", "")

st.divider()

# Section: Distribusi Harga per Kategori
st.subheader("📊 Distribusi Harga per Kategori Jasa")
st.info("📌 Visualisasi akan muncul setelah data scraping selesai.")

# Placeholder chart
sample_data = pd.DataFrame({
    'Kategori': ["Web Dev", "Mobile Dev", "UI/UX", "Data Science", "Copywriting"],
    'Harga Median': [1500000, 2000000, 1200000, 2500000, 800000]
})
fig = px.bar(sample_data, x='Kategori', y='Harga Median',
             title='Contoh: Median Harga per Kategori (Sample Data)',
             color='Harga Median', color_continuous_scale='Blues')
st.plotly_chart(fig, use_container_width=True)

# Section: Skill Demand
st.subheader("🔥 Top Skills by Demand")
st.info("📌 Akan diisi dari hasil EDA dataset scraping.")

# Section: Business Questions
st.subheader("❓ Business Questions")
st.markdown("""
1. **Faktor apa yang paling mempengaruhi harga jasa freelance?**  
   → Dijawab di notebook `01_EDA.ipynb`

2. **Berapa harga yang wajar untuk proyek Web Development 2 minggu dengan skill React & Node.js?**  
   → Dijawab oleh model prediksi

3. **Skill apa yang paling bernilai tinggi di pasar Indonesia?**  
   → Dijawab dari analisis korelasi skill vs harga
""")
