import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart2, Target, Scale, TrendingUp } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import StatCounter from "../components/features/StatCounter";
import FaqItem from "../components/features/FaqItem";

import step1Light from "../assets/images/step1-black.png";
import step1Dark from "../assets/images/step1-white.png";
import step2Light from "../assets/images/step2-black.png";
import step2Dark from "../assets/images/step2-white.png";
import step3Light from "../assets/images/step3-black.png";
import step3Dark from "../assets/images/step3-white.png";

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
    title: "Pilih Kategori Jasa",
    desc: "Pilih kategori profesi utama yang sesuai dengan bidang Anda, lalu tambahkan detail jenis proyek secara opsional.",
    delay: 0,
    imgLight: step1Light,
    imgDark: step1Dark,
  },
  {
    n: "2",
    title: "Tentukan Skill & Durasi",
    desc: "Masukkan keahlian spesifik, tentukan peran sebagai freelancer atau klien, serta berikan estimasi total durasi penyelesaian proyek.",
    delay: 100,
    imgLight: step2Light,
    imgDark: step2Dark,
  },
  {
    n: "3",
    title: "Dapatkan Fair Price",
    desc: "Sistem akan langsung menampilkan estimasi harga wajar yang mencakup batas bawah, median, dan batas atas negosiasi.",
    delay: 200,
    imgLight: step3Light,
    imgDark: step3Dark,
  },
];

const faqs = [
  {
    q: "Dari mana data harga berasal?",
    a: "Data harga berasal dari pengumpulan data mentah pasar freelance di Indonesia. Pengumpulan data ini dilakukan pada penawaran jasa atau profil freelancer dari platform-platform yang menjadi sumber data relevan.",
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

const Home = () => (
  <div>
    {/* HERO */}
    <section className="hero-section">
      <div
        className="container-inner relative-z1"
      >


        <h1 data-aos="fade-up" data-aos-delay="50" className="hero-title">
          Harga jasa yang adil
          <br />
          <span className="text-[var(--fg-2)] font-normal">
            berbasis data nyata
          </span>
        </h1>

        <p data-aos="fade-up" data-aos-delay="150" className="hero-subtitle">
          Platform AI untuk freelancer dan klien Indonesia menemukan standar
          harga yang objektif - bukan spekulasi.
        </p>

        <div data-aos="fade-up" data-aos-delay="200" className="hero-actions">
          <Link
            to="/estimator"
            className="btn-primary text-[13.5px] px-[18px] py-[9px]"
          >
            Mulai Estimasi <ArrowRight size={14} />
          </Link>
          <Link
            to="/dashboard"
            className="btn-secondary text-[13.5px] px-[18px] py-[9px]"
          >
            <BarChart2 size={14} /> Lihat Tren Pasar
          </Link>
        </div>

        <div data-aos="fade-up" data-aos-delay="300" className="social-proof">
          <div className="social-proof__avatars">
            {["#cc0000", "#ffdc13", "#ffffff"].map((color, i) => (
              <div
                key={i}
                className="social-proof__avatar avatar-circle"
                style={{ background: color }}
              />
            ))}
          </div>
          <span className="social-proof__text">
            Dirancang untuk freelancer Indonesia
          </span>
        </div>
      </div>
    </section>

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

    {/* FEATURES */}
    <section className="section">
      <p data-aos="fade-right" className="label-mono section-label">
        Platform
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="50"
        className="section-title max-w-[700px]"
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

    <div className="divider-wrap">
      <Separator.Root className="divider-line" />
    </div>

    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Cara Kerja
      </p>
      <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
        Tiga langkah, estimasi instan
      </h2>
      <div className="steps-grid">
        {steps.map(({ n, title, desc, delay, imgLight, imgDark }) => (
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
              <img
                src={imgLight}
                alt={title}
                className="step-img step-img--light"
              />
              <img
                src={imgDark}
                alt={title}
                className="step-img step-img--dark"
              />
            </div>
          </div>
        ))}
      </div>
    </section>

    <div className="divider-wrap">
      <Separator.Root className="divider-line" />
    </div>

    {/* FAQ */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        FAQ
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="50"
        className="section-title-sm max-w-[600px]"
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
        <p className="label-mono mb-3.5">Mulai sekarang - gratis</p>
        <h2 className="cta-title">
          Sudah tahu skill yang dituju,
          <br />
          sekarang temukan harga wajarnya.
        </h2>
        <p className="cta-desc">
          Isi kategori, skill, dan durasi - estimasi harga dalam hitungan detik.
        </p>
        <Link
          to="/estimator"
          className="btn-primary text-[14px] px-[22px] py-[9px]"
        >
          Coba Estimator <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  </div>
);

export default Home;
