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
  SiPostgresql,
  SiVite,
} from "react-icons/si";
import * as Separator from "@radix-ui/react-separator";

const team = [
  {
    initials: "ES",
    name: "Evan Suryadinata S",
    role: "AI Engineer",
    color: "var(--accent)",
    photo: "",
  },
  {
    initials: "FA",
    name: "Felicia Audrey",
    role: "AI Engineer",
    color: "var(--green)",
    photo: "",
  },
  {
    initials: "GA",
    name: "Gabrielle Angelina Ambasalu",
    role: "Data Scientist",
    color: "var(--amber)",
    photo: "",
  },
  {
    initials: "MD",
    name: "Meyrica Dianiken Cintami",
    role: "Data Scientist",
    color: "var(--indigo)",
    photo: "",
  },
  {
    initials: "VT",
    name: "Victor Thimothi Benyamin Loka",
    role: "Fullstack Developer",
    color: "var(--fg-2)",
    photo: "",
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
    icon: SiPostgresql,
    name: "PostgreSQL",
    desc: "Database",
    color: "#336791",
  },
  { icon: SiVite, name: "Vite", desc: "Build Tool", color: "#646CFF" },
  { icon: BookOpen, name: "Dicoding", desc: "Platform", color: "var(--fg-2)" },
];

const missions = [
  {
    icon: Target,
    title: "Harga yang Adil",
    desc: "Memastikan freelancer mendapat kompensasi yang setara dengan nilai dan kualitas kerja mereka.",
  },
  {
    icon: Database,
    title: "Berbasis Data",
    desc: "Model AI dilatih dari data nyata pasar freelance Indonesia yang terus diperbarui secara berkala.",
  },
  {
    icon: Users,
    title: "Untuk Semua",
    desc: "Platform gratis dan terbuka untuk seluruh freelancer Indonesia tanpa terkecuali.",
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
      <div className="hero-dot-grid" />
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div data-aos="fade-down" className="hero-badge">
          <span className="hero-badge__tag">CC26-PSU164</span>
          <span className="hero-badge__text">
            Capstone · DBS Foundation × Dicoding
          </span>
        </div>

        <h1 data-aos="fade-up" data-aos-delay="60" className="hero-title">
          Tentang{" "}
          <span style={{ color: "var(--fg-2)", fontWeight: 400 }}>
            FairPrice Finder
          </span>
        </h1>

        <p data-aos="fade-up" data-aos-delay="140" className="hero-subtitle">
          Platform AI untuk membantu freelancer Indonesia menemukan harga jasa
          yang adil, transparan, dan berbasis data pasar nyata.
        </p>

        <div data-aos="fade-up" data-aos-delay="220" className="hero-actions">
          <Link
            to="/estimator"
            className="btn-primary"
            style={{ fontSize: 13.5, padding: "9px 18px" }}
          >
            Coba Estimator <ArrowRight size={14} />
          </Link>
          <a
            href="#"
            className="btn-secondary"
            style={{ fontSize: 13.5, padding: "9px 18px" }}
          >
            <Github size={14} /> GitHub
          </a>
        </div>
      </div>
    </section>

    {/* PERNYATAAN MASALAH */}
    <section className="section">
      <p data-aos="fade-right" className="label-mono section-label">
        Konteks Masalah
      </p>
      <h2
        data-aos="fade-up"
        data-aos-delay="60"
        className="section-title"
        style={{ maxWidth: 480 }}
      >
        Mengapa platform ini penting?
      </h2>

      <div className="feature-grid" style={{ marginBottom: 28 }}>
        {sdgPoints.map(({ stat, label, src }, i) => (
          <div
            key={stat}
            data-aos="fade-up"
            data-aos-delay={i * 80}
            className="feature-card"
          >
            <p
              className="stats-bar__val"
              style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                color: "var(--accent)",
                marginBottom: 8,
              }}
            >
              {stat}
            </p>
            <p className="feature-card__desc" style={{ marginBottom: 6 }}>
              {label}
            </p>
            <p className="label-mono" style={{ color: "var(--fg-3)" }}>
              · {src}
            </p>
          </div>
        ))}
      </div>

      <p data-aos="fade-up" className="page-desc" style={{ maxWidth: 640 }}>
        Freelancer Indonesia sering tidak tahu harga yang layak untuk jasa
        mereka - membuat mereka <em>undersell</em> atau kehilangan klien karena
        quote terlalu tinggi. FairPrice Finder hadir untuk menjawab:{" "}
        <strong style={{ color: "var(--fg-1)" }}>
          "Berapa sebenarnya nilai jasa saya?"
        </strong>
      </p>
    </section>

    <div className="divider-wrap">
      <Separator.Root style={{ height: 1, background: "var(--border)" }} />
    </div>

    {/* MISI */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Misi
      </p>
      <h2 data-aos="fade-up" data-aos-delay="60" className="section-title-sm">
        Berkontribusi pada SDG 8
      </h2>
      <div className="steps-grid">
        {missions.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            data-aos="fade-up"
            data-aos-delay={i * 80}
            className="feature-card"
            style={{
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="feature-card__icon-wrap">
              <Icon size={14} color="var(--accent)" strokeWidth={1.8} />
            </div>
            <h3 className="feature-card__title">{title}</h3>
            <p className="feature-card__desc">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="divider-wrap">
      <Separator.Root style={{ height: 1, background: "var(--border)" }} />
    </div>

    {/* TUMPUKAN TEKNOLOGI */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Teknologi
      </p>
      <h2 data-aos="fade-up" data-aos-delay="60" className="section-title-sm">
        Dibangun dengan stack modern
      </h2>
      <div className="tech-grid">
        {techStack.map(({ icon: Icon, name, desc, color }, i) => (
          <div
            key={name}
            data-aos="fade-up"
            data-aos-delay={i * 60}
            className="tech-badge"
          >
            <Icon size={14} color={color} />
            <div>
              <p className="tech-badge__name">{name}</p>
              <p className="tech-badge__desc">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <div className="divider-wrap">
      <Separator.Root style={{ height: 1, background: "var(--border)" }} />
    </div>

    {/* TIM */}
    <section className="section-sm">
      <p data-aos="fade-right" className="label-mono section-label">
        Tim
      </p>
      <h2 data-aos="fade-up" data-aos-delay="60" className="section-title-sm">
        Dibangun oleh tim CC26-PSU164
      </h2>
      <p
        data-aos="fade-up"
        data-aos-delay="100"
        className="page-desc"
        style={{ marginBottom: 32, maxWidth: 480 }}
      >
        Mahasiswa Coding Camp 2026 powered by DBS Foundation, track Future-Ready
        Work &amp; Economy.
      </p>
      <div className="team-grid">
        {team.map(({ initials, name, role, color, photo }, i) => (
          <div
            key={name}
            data-aos="fade-up"
            data-aos-delay={i * 60}
            className="team-card"
          >
            <div
              className="team-card__avatar"
              style={{ background: color, overflow: "hidden" }}
            >
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
        <p className="label-mono" style={{ marginBottom: 14 }}>
          Open Source
        </p>
        <h2 className="cta-title">Tertarik berkontribusi?</h2>
        <p className="cta-desc">
          Proyek ini open source. Lihat kode sumber, buka issue, atau fork di
          GitHub.
        </p>
        <a
          href="https://github.com/kevinardi/fair-price-finder"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ fontSize: 14, padding: "9px 22px" }}
        >
          <Github size={14} /> Lihat di GitHub
        </a>
      </div>
    </section>
  </div>
);

export default About;
