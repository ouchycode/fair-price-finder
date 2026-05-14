import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart2, Target, Scale, TrendingUp } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";

const features = [
  {
    icon: Target,
    color: "var(--indigo)",
    label: "Estimasi Akurat",
    desc: "Model deep learning dilatih dari data pasar freelance Indonesia yang terus diperbarui.",
    delay: 0,
  },
  {
    icon: TrendingUp,
    color: "var(--green)",
    label: "Insight Pasar",
    desc: "Tren harga per kategori jasa dan skill paling dicari di ekosistem freelance lokal.",
    delay: 100,
  },
  {
    icon: Scale,
    color: "var(--amber)",
    label: "Posisi Tawar",
    desc: "Data-driven pricing - bukan tebak-tebakan saat negosiasi dengan klien.",
    delay: 200,
  },
];

const stats = [
  { val: "59.4%", label: "pekerja sektor informal", src: "BPS 2025" },
  { val: "36.3%", label: "proporsi freelancer aktif", src: "Agustus 2025" },
  { val: "SDG 8", label: "decent work & growth", src: "target kami" },
];

const steps = [
  {
    n: "1",
    title: "Pilih Kategori",
    desc: "Tentukan kategori jasa yang sesuai dengan pekerjaan kamu.",
    delay: 0,
  },
  {
    n: "2",
    title: "Tambah Skill",
    desc: "Input skill yang dikuasai agar estimasi lebih presisi.",
    delay: 100,
  },
  {
    n: "3",
    title: "Dapatkan Estimasi",
    desc: "Lihat range harga min, median, dan maksimum secara instan.",
    delay: 200,
  },
];

const Home = () => (
  <div>
    {/* ── HERO ── */}
    <section
      style={{
        position: "relative",
        borderBottom: "1px solid var(--border)",
        padding: "clamp(72px,10vw,120px) 20px clamp(64px,8vw,96px)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          data-aos="fade-down"
          data-aos-duration="500"
          className="hero-badge"
        >
          <span className="hero-badge__tag">New</span>
          <span className="hero-badge__text">
            CC26-PSU164 · Future-Ready Work &amp; Economy
          </span>
        </div>

        <h1 data-aos="fade-up" data-aos-delay="60" className="hero-title">
          Harga jasa yang adil
          <br />
          <span style={{ color: "var(--fg-2)", fontWeight: 400 }}>
            berbasis data nyata
          </span>
        </h1>

        <p data-aos="fade-up" data-aos-delay="140" className="hero-subtitle">
          Platform AI untuk freelancer dan klien Indonesia menemukan standar
          harga yang objektif - bukan spekulasi.
        </p>

        <div data-aos="fade-up" data-aos-delay="220" className="hero-actions">
          <Link
            to="/estimator"
            className="btn-primary"
            style={{ fontSize: 13.5, padding: "9px 18px" }}
          >
            Mulai Estimasi <ArrowRight size={14} />
          </Link>
          <Link
            to="/dashboard"
            className="btn-secondary"
            style={{ fontSize: 13.5, padding: "9px 18px" }}
          >
            <BarChart2 size={14} /> Lihat Tren Pasar
          </Link>
        </div>

        <div data-aos="fade-up" data-aos-delay="300" className="social-proof">
          <div className="social-proof__avatars">
            {["#818cf8", "#34d399", "#fbbf24"].map((color, i) => (
              <div
                key={i}
                className="social-proof__avatar"
                style={{ background: color, marginLeft: i > 0 ? -7 : 0 }}
              />
            ))}
          </div>
          <span className="social-proof__text">
            Dirancang untuk freelancer Indonesia
          </span>
        </div>
      </div>
    </section>

    {/* ── STATS BAR ── */}
    <section className="stats-bar">
      <div className="container">
        <div className="stats-bar__inner">
          {stats.map(({ val, label, src }, i) => (
            <div
              key={val}
              data-aos="fade-up"
              data-aos-delay={i * 80}
              className="stats-bar__item"
            >
              <p className="stats-bar__val">{val}</p>
              <p className="stats-bar__label">
                {label}
                <span className="stats-bar__src">· {src}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section className="section">
      <p data-aos="fade-right" className="label-mono section-label">
        Platform
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="60"
        className="section-title"
        style={{ maxWidth: 420 }}
      >
        Dirancang untuk ekosistem freelance yang lebih sehat
      </h2>

      <div className="feature-grid">
        {features.map(({ icon: Icon, color, label, desc, delay }) => (
          <div
            key={label}
            data-aos="fade-up"
            data-aos-delay={delay}
            className="feature-card"
          >
            <div className="feature-card__icon-wrap">
              <Icon size={14} color={color} strokeWidth={1.8} />
            </div>
            <h3 className="feature-card__title">{label}</h3>
            <p className="feature-card__desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── SEPARATOR ── */}
    <div className="divider-wrap">
      <Separator.Root style={{ height: 1, background: "var(--border)" }} />
    </div>

    {/* ── HOW IT WORKS ── */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Cara Kerja
      </p>
      <h2 data-aos="fade-up" data-aos-delay="60" className="section-title-sm">
        Tiga langkah, estimasi instan
      </h2>
      <div className="steps-grid">
        {steps.map(({ n, title, desc, delay }) => (
          <div key={n} data-aos="fade-up" data-aos-delay={delay}>
            <div className="step-num">{n}</div>
            <h3 className="step-title">{title}</h3>
            <p className="step-desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA ── */}
    <section
      style={{
        borderTop: "1px solid var(--border)",
        padding: "clamp(56px,7vw,88px) 20px",
      }}
    >
      <div data-aos="fade-up" data-aos-duration="600" className="cta-inner">
        <p className="label-mono" style={{ marginBottom: 14 }}>
          Mulai sekarang - gratis
        </p>
        <h2 className="cta-title">
          Sudah tahu skill-mu,
          <br />
          sekarang ketahui nilainya.
        </h2>
        <p className="cta-desc">
          Isi kategori, skill, dan durasi - estimasi harga dalam hitungan detik.
        </p>
        <Link
          to="/estimator"
          className="btn-primary"
          style={{ fontSize: 14, padding: "9px 22px" }}
        >
          Coba Estimator <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  </div>
);

export default Home;
