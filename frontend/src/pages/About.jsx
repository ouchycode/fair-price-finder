import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Github,
  Target,
  Users,
  Database,
  Zap,
  Globe,
  Code2,
  Cpu,
  BookOpen,
} from "lucide-react";
import {
  SiReact,
  SiExpress,
  SiTensorflow,
  SiFastapi,
  SiVite,
} from "react-icons/si";
import * as Separator from "@radix-ui/react-separator";

const team = [
  {
    initials: "ES",
    name: "Evan Suryadinata S",
    role: "AI Engineer",
    color: "var(--accent)",
    photo: "/assets/team/evan.png",
  },
  {
    initials: "FA",
    name: "Felicia Audrey",
    role: "AI Engineer",
    color: "var(--accent)",
    photo: "/assets/team/felicia.png",
  },
  {
    initials: "GA",
    name: "Gabrielle Angelina Ambasalu",
    role: "Data Scientist",
    color: "var(--accent)",
    photo: "/assets/team/gabrielle.png",
  },
  {
    initials: "MD",
    name: "Meyrica Dianiken Cintami",
    role: "Data Scientist",
    color: "var(--accent)",
    photo: "/assets/team/meyrica.png",
  },
  {
    initials: "VT",
    name: "Victor Thimothi Benyamin Loka",
    role: "Fullstack Developer",
    color: "var(--accent)",
    photo: "/assets/team/victor.png",
  },
  {
    initials: "KA",
    name: "Kevin Ardiansyah",
    role: "Fullstack Developer",
    color: "var(--accent)",
    photo: "/assets/team/kevin.png",
  },
];

const techStack = [
  {
    icon: SiReact,
    name: "React.js",
    desc: "Frontend UI",
    color: "#61DAFB",
  },
  {
    icon: SiExpress,
    name: "Express.js",
    desc: "Backend API",
    color: "var(--fg-1)",
  },
  {
    icon: SiTensorflow,
    name: "TensorFlow",
    desc: "ML Model",
    color: "#FF6F00",
  },
  {
    icon: SiFastapi,
    name: "FastAPI",
    desc: "AI Service",
    color: "#009688",
  },
  { icon: SiVite, name: "Vite", desc: "Build Tool", color: "#646CFF" },
  { icon: BookOpen, name: "Dicoding", desc: "Platform", color: "var(--fg-2)" },
];

const missions = [
  {
    icon: Target,
    title: "Harga yang Adil",
    desc: "Membantu freelancer dan klien menyepakati kompensasi yang wajar dan sepadan dengan nilai kerja.",
    color: "var(--amber)",
  },
  {
    icon: Database,
    title: "Berbasis Data",
    desc: "Model AI dilatih dari data nyata pasar freelance Indonesia yang terus diperbarui secara berkala.",
    color: "#3b82f6",
  },
  {
    icon: Users,
    title: "Untuk Semua",
    desc: "Platform gratis dan terbuka untuk seluruh freelancer maupun pencari jasa di Indonesia tanpa terkecuali.",
    color: "var(--green)",
  },
];

const sdgPoints = [
  {
    stat: "59.4%",
    label: "pekerja sektor informal Indonesia",
    src: "BPS 2025",
  },
  {
    stat: "36.3%",
    label: "freelancer aktif dari angkatan kerja",
    src: "Agustus 2025",
  },
  {
    stat: "SDG 8",
    label: "Decent Work & Economic Growth",
    src: "target utama kami",
  },
];

const About = () => (
  <div>
    {/* HERO */}
    <section className="hero-section">
      <div className="container-inner relative-z1">
        <h1 data-aos="fade-up" data-aos-delay="50" className="hero-title">
          Tentang{" "}
          <span className="text-[var(--fg-2)] font-normal">
            Fair Price Finder
          </span>
        </h1>

        <p data-aos="fade-up" data-aos-delay="150" className="hero-subtitle">
          Platform AI untuk membantu ekosistem freelance Indonesia (klien &
          freelancer) menemukan standar harga jasa yang adil, transparan, dan
          berbasis data pasar nyata.
        </p>

        <div data-aos="fade-up" data-aos-delay="200" className="hero-actions">
          <Link
            to="/estimator"
            className="btn-primary text-[13.5px] px-[18px] py-[9px]"
          >
            Coba Estimator <ArrowRight size={14} />
          </Link>
          <a
            href="https://github.com/ouchycode/fair-price-finder"
            className="btn-secondary text-[13.5px] px-[18px] py-[9px]"
          >
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </section>

    <section className="section">
      <p data-aos="fade-right" className="label-mono section-label">
        Konteks Masalah
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="50"
        className="section-title max-w-[480px]"
      >
        Mengapa platform ini penting?
      </h2>

      <div className="feature-grid mb-12">
        {sdgPoints.map(({ stat, label, src }, i) => (
          <div
            key={stat}
            data-aos="fade-up"
            data-aos-delay={i * 100}
            className="feature-card"
          >
            <p className="stats-bar__val text-[clamp(22px,3vw,30px)] text-[var(--accent)] mb-2">
              {stat}
            </p>
            <p className="feature-card__desc mb-1.5">{label}</p>
            <p className="label-mono text-[var(--fg-3)]">· {src}</p>
          </div>
        ))}
      </div>

      <p data-aos="fade-up" className="page-desc max-w-[800px] pt-48">
        Freelancer sering kebingungan menentukan harga yang layak, dan di sisi
        lain klien ragu apakah tawaran harga tersebut wajar. FairPrice Finder
        hadir untuk memberikan panduan objektif, menjawab:{" "}
        <strong className="text-[var(--fg-1)]">
          "Berapa standar harga yang adil di pasar saat ini?"
        </strong>
      </p>
    </section>

    <div className="divider-wrap">
      <Separator.Root className="divider-line" />
    </div>

    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Misi
      </p>
      <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
        Berkontribusi pada SDG 8
      </h2>
      <div className="steps-grid">
        {missions.map(({ icon: Icon, title, desc, color }, i) => (
          <div
            key={title}
            data-aos="fade-up"
            data-aos-delay={i * 100}
            className="feature-card about-mission-card"
          >
            <div className="feature-card__icon-wrap">
              <Icon
                size={14}
                color={color || "var(--accent)"}
                strokeWidth={1.8}
              />
            </div>
            <h3 className="feature-card__title">{title}</h3>
            <p className="feature-card__desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="divider-wrap">
      <Separator.Root className="divider-line" />
    </div>

    {/* TECH STACK */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Teknologi
      </p>
      <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
        Dibangun dengan stack modern
      </h2>
      <div className="tech-marquee-wrap">
        <div className="tech-marquee">
          {[...techStack, ...techStack, ...techStack].map(
            ({ icon: Icon, name, desc, color }, i) => (
              <div key={`${name}-${i}`} className="tech-badge tech-badge-item">
                <Icon size={14} color={color} />
                <div>
                  <p className="tech-badge__name">{name}</p>
                  <p className="tech-badge__desc">{desc}</p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>

    <div className="divider-wrap">
      <Separator.Root className="divider-line" />
    </div>

    {/* TEAM */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Tim
      </p>
      <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
        Dibangun oleh tim CC26-PSU164
      </h2>
      <p
        data-aos="fade-up"
        data-aos-delay="100"
        className="page-desc mb-8 max-w-[480px]"
      >
        Cohort Coding Camp 2026 powered by DBS Foundation, track Future-Ready
        Work &amp; Economy.
      </p>
      <div className="team-grid">
        {team.map(({ initials, name, role, color, photo }, i) => (
          <div
            key={name}
            data-aos="fade-up"
            data-aos-delay={i * 50}
            className="team-card"
          >
            <div
              className="team-avatar team-avatar-border"
              style={{ background: color }}
            >
              {photo ? (
                <img src={photo} alt={name} className="team-avatar-img" />
              ) : (
                initials
              )}
            </div>
            <p className="team-card__name">{name}</p>
            <p className="team-card__role">{role}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="cta-section">
      <div data-aos="fade-up" data-aos-duration="600" className="cta-inner">
        <p className="label-mono mb-3.5">Open Source</p>
        <h2 className="cta-title">Tertarik berkontribusi?</h2>
        <p className="cta-desc">
          Proyek ini open source. Lihat kode sumber, buka issue, atau fork di
          GitHub.
        </p>
        <a
          href="https://github.com/ouchycode/fair-price-finder"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-[14px] px-[22px] py-[9px]"
        >
          <Github size={14} /> Lihat di GitHub
        </a>
      </div>
    </section>
  </div>
);

export default About;
