import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart2, Target, Scale, TrendingUp } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import StatCounter from "../components/features/StatCounter";
import FaqItem from "../components/features/FaqItem";

import step1Img from "../assets/images/step-1.png";
import step2Img from "../assets/images/step-2.png";
import step3Img from "../assets/images/step-3.png";

// DATA STATIS
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
    img: step1Img,
  },
  {
    n: "2",
    title: "Tambah Skill",
    desc: "Input skill yang dikuasai agar estimasi lebih presisi.",
    delay: 100,
    img: step2Img,
  },
  {
    n: "3",
    title: "Dapatkan Estimasi",
    desc: "Lihat range harga min, median, dan maksimum secara instan.",
    delay: 200,
    img: step3Img,
  },
];

const faqs = [
  {
    q: "Dari mana data harga berasal?",
    a: "Data harga berasal dari pengumpulan data mentah pasar freelance di Indonesia. Pengumpulan data ini dilakukan melalui metode web scraping pada proyek-proyek freelance dari platform-platform yang menjadi sumber data relevan.",
  },
  {
    q: "Apakah estimasi ini akurat 100%?",
    a: "Tidak, estimasi ini tidak dijamin 100% akurat. Sistem ini dirancang hanya untuk memberikan rentang estimasi (harga adil), bukan harga pasti. Karena ada risiko akurasi prediksi yang rendah, tim akan terus mengoptimalkan model AI tersebut dan memvalidasi hasilnya dengan data harga aktual di lapangan untuk meminimalisir kesalahan.",
  },
  {
    q: "Apakah platform ini gratis?",
    a: "Ya, FairPrice Finder adalah proyek open-source capstone yang dirancang gratis untuk seluruh freelancer Indonesia tanpa biaya apapun.",
  },
  {
    q: "Apa itu SDG 8 dan apa hubungannya?",
    a: "SDG 8 adalah tujuan pembangunan berkelanjutan nomor 8 - Decent Work and Economic Growth. Platform ini berkontribusi dengan membantu freelancer mendapatkan harga yang adil dan transparan.",
  },
];

// HALAMAN HERO
const Home = () => (
  <div>
    {/* HERO */}
    <section className="hero-section">
      <div className="hero-dot-grid" />
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
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
            {["#cc0000", "#ffdc13", "#ffffff"].map((color, i) => (
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

    {/* BILAH STATISTIK */}
    <section className="stats-bar">
      <div className="container">
        <div className="stats-bar__inner">
          {stats.map(({ val, label, src }, i) => (
            <StatCounter
              key={val}
              val={val}
              label={label}
              src={src}
              delay={i * 80}
            />
          ))}
        </div>
      </div>
    </section>

    {/* FITUR */}
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

    {/* PEMISAH */}
    <div className="divider-wrap">
      <Separator.Root style={{ height: 1, background: "var(--border)" }} />
    </div>

    {/* CARA KERJA */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Cara Kerja
      </p>
      <h2 data-aos="fade-up" data-aos-delay="60" className="section-title-sm">
        Tiga langkah, estimasi instan
      </h2>
      <div className="steps-grid">
        {steps.map(({ n, title, desc, delay, img }) => (
          <div
            key={n}
            data-aos="fade-up"
            data-aos-delay={delay}
            className="step-item"
          >
            <div className="step-num">{n}</div>
            <h3 className="step-title">{title}</h3>
            <p className="step-desc">{desc}</p>
            <div className="step-img-wrap">
              <img src={img} alt={title} className="step-img" />
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* PEMISAH */}
    <div className="divider-wrap">
      <Separator.Root style={{ height: 1, background: "var(--border)" }} />
    </div>

    {/* FAQ */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        FAQ
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="60"
        className="section-title-sm"
        style={{ maxWidth: 360 }}
      >
        Pertanyaan yang sering ditanyakan
      </h2>
      <div className="faq-list">
        {faqs.map(({ q, a }, i) => (
          <FaqItem key={q} q={q} a={a} index={i} />
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="cta-section">
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
