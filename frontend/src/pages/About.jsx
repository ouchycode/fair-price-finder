import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Github,
  Target,
  Users,
  Database,
} from "lucide-react";
import {
  SiReact,
  SiExpress,
  SiTensorflow,
  SiFastapi,
  SiVite,
} from "react-icons/si";
import * as Separator from "@radix-ui/react-separator";
import PartnersSection from "../components/features/PartnersSection";
import { useLanguage } from "../hooks/useI18n";

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

const techStackIcons = [
  { icon: SiReact, color: "#61DAFB" },
  { icon: SiExpress, color: "var(--fg-1)" },
  { icon: SiTensorflow, color: "#FF6F00" },
  { icon: SiFastapi, color: "#009688" },
  { icon: SiVite, color: "#646CFF" },
  { icon: null, color: "var(--fg-2)" },
];

const missionIcons = [Target, Database, Users];
const missionColors = ["var(--amber)", "#3b82f6", "var(--green)"];

const teamRoleKeys = {
  "AI Engineer": "AI Engineer",
  "Data Scientist": "Data Scientist",
  "Fullstack Developer": "Fullstack Developer",
};

const About = () => {
  const { t } = useLanguage();

  const stats = t("stats");
  const missions = t("aboutSection.missions");
  const techStack = t("aboutSection.techStack");

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div className="container-inner relative-z1">
          <h1 data-aos="fade-up" data-aos-delay="50" className="hero-title">
            {t("aboutSection.heroTitle1")}{" "}
            <span className="text-[var(--fg-2)] font-normal">
              {t("aboutSection.heroTitle2")}
            </span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="150" className="hero-subtitle">
            {t("aboutSection.subtitle")}
          </p>

          <div data-aos="fade-up" data-aos-delay="200" className="hero-actions">
            <Link to="/estimator" className="btn-primary btn-lg">
              {t("hero.ctaPrimary")} <ArrowRight size={14} />
            </Link>
            <a
              href="https://github.com/ouchycode/fair-price-finder"
              className="btn-secondary btn-lg"
            >
              <Github size={14} /> {t("aboutSection.github")}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("aboutSection.problemLabel")}
        </p>
        <h2
          data-aos="fade-up"
          data-aos-delay="50"
          className="section-title max-w-[480px]"
        >
          {t("aboutSection.problemTitle")}
        </h2>

        <div className="feature-grid mb-12">
          {stats.map(({ val, label, src }, i) => (
            <div
              key={val + i}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="feature-card"
            >
              <p className="stats-bar__val text-[clamp(22px,3vw,30px)] text-[var(--accent)] mb-2">
                {val}
              </p>
              <p className="feature-card__desc mb-1.5">{label}</p>
              <p className="label-mono text-[var(--fg-3)]">· {src}</p>
            </div>
          ))}
        </div>

        <p data-aos="fade-up" className="page-desc max-w-[800px] pt-6">
          {t("aboutSection.problemDesc")}
          <strong className="text-[var(--fg-1)]">
            {t("aboutSection.problemQuestion")}
          </strong>
        </p>
      </section>

      <div className="divider-wrap">
        <Separator.Root className="divider-line" />
      </div>

      <section className="section-sm">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("aboutSection.missionLabel")}
        </p>
        <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
          {t("aboutSection.missionTitle")}
        </h2>
        <div className="steps-grid">
          {missions.map(({ title, desc }, i) => {
            const Icon = missionIcons[i] || Target;
            return (
              <div
                key={title}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="feature-card about-mission-card"
              >
                <div className="feature-card__icon-wrap">
                  <Icon
                    size={14}
                    color={missionColors[i] || "var(--accent)"}
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__desc">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="divider-wrap">
        <Separator.Root className="divider-line" />
      </div>

      {/* TECH STACK */}
      <section className="section-sm">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("aboutSection.techLabel")}
        </p>
        <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
          {t("aboutSection.techTitle")}
        </h2>
        <div className="tech-marquee-wrap">
          <div className="tech-marquee">
            {[...techStack, ...techStack, ...techStack].map(
              ({ name, desc }, i) => {
                const { icon: Icon, color } = techStackIcons[i % techStack.length];
                return (
                  <div key={`${name}-${i}`} className="tech-badge tech-badge-item">
                    {Icon ? <Icon size={14} color={color} /> : null}
                    <div>
                      <p className="tech-badge__name">{name}</p>
                      <p className="tech-badge__desc">{desc}</p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <PartnersSection />

      {/* TEAM */}
      <section className="section-sm">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("aboutSection.teamLabel")}
        </p>
        <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
          {t("aboutSection.teamTitle")}
        </h2>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="page-desc mb-8 max-w-[480px]"
        >
          {t("aboutSection.teamDesc")}
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
              <p className="team-card__role">
                {teamRoleKeys[role] || role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div data-aos="fade-up" data-aos-duration="600" className="cta-inner">
          <p className="label-mono mb-3.5">{t("aboutSection.ctaLabel")}</p>
          <h2 className="cta-title">{t("aboutSection.ctaTitle")}</h2>
          <p className="cta-desc">
            {t("aboutSection.ctaDesc")}
          </p>
          <a
            href="https://github.com/ouchycode/fair-price-finder"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary btn-xl"
          >
            <Github size={14} /> {t("aboutSection.ctaBtn")}
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;