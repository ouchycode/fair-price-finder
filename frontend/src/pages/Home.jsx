import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart2, Target, Scale, TrendingUp } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import StatCounter from "../components/features/StatCounter";
import FaqItem from "../components/features/FaqItem";
import PartnersSection from "../components/features/PartnersSection";
import { useLanguage } from "../hooks/useI18n";

import step1Light from "../assets/images/step1-black.png";
import step1Dark from "../assets/images/step1-white.png";
import step2Light from "../assets/images/step2-black.png";
import step2Dark from "../assets/images/step2-white.png";
import step3Light from "../assets/images/step3-black.png";
import step3Dark from "../assets/images/step3-white.png";

const stepImages = [
  { imgLight: step1Light, imgDark: step1Dark },
  { imgLight: step2Light, imgDark: step2Dark },
  { imgLight: step3Light, imgDark: step3Dark },
];

const featureIcons = [Target, TrendingUp, Scale];

const Home = () => {
  const { t } = useLanguage();

  const stats = t("stats");
  const features = t("featuresSection.items");
  const steps = t("stepsSection.items");
  const faqs = t("faqSection.items");

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div
          className="container-inner relative-z1"
        >
          <h1 data-aos="fade-up" data-aos-delay="50" className="hero-title">
            {t("hero.title1")}
            <br />
            <span className="text-[var(--fg-2)] font-normal">
              {t("hero.title2")}
            </span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="150" className="hero-subtitle">
            {t("hero.subtitle")}
          </p>

          <div data-aos="fade-up" data-aos-delay="200" className="hero-actions">
            <Link to="/estimator" className="btn-primary btn-lg">
              {t("hero.ctaPrimary")} <ArrowRight size={14} />
            </Link>
            <Link to="/dashboard" className="btn-secondary btn-lg">
              <BarChart2 size={14} /> {t("hero.ctaSecondary")}
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
              {t("hero.socialProof")}
            </span>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container">
          <div className="stats-bar__inner">
            {stats.map(({ val, label, src }, i) => (
              <StatCounter
                key={val + i}
                val={val}
                label={label}
                src={src}
                delay={i * 80}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <PartnersSection />

      {/* FEATURES */}
      <section className="section">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("featuresSection.label")}
        </p>
        <h2
          data-aos="fade-up"
          data-aos-delay="50"
          className="section-title max-w-[700px]"
        >
          {t("featuresSection.title")}
        </h2>

        <div className="feature-grid">
          {features.map(({ label, desc }, i) => {
            const Icon = featureIcons[i] || Target;
            return (
              <div
                key={label}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="feature-card"
              >
                <div className="feature-card__icon-wrap">
                  <Icon
                    size={14}
                    color={["var(--indigo)", "var(--green)", "var(--amber)"][i]}
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="feature-card__title">{label}</h3>
                <p className="feature-card__desc">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="divider-wrap">
        <Separator.Root className="divider-line" />
      </div>

      <section className="section-sm">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("stepsSection.label")}
        </p>
        <h2 data-aos="fade-up" data-aos-delay="50" className="section-title-sm">
          {t("stepsSection.title")}
        </h2>
        <div className="steps-grid">
          {steps.map(({ title, desc }, i) => {
            const { imgLight, imgDark } = stepImages[i];
            return (
              <div
                key={title}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="step-item"
              >
                <div className="step-num">{i + 1}</div>
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
            );
          })}
        </div>
      </section>

      <div className="divider-wrap">
        <Separator.Root className="divider-line" />
      </div>

      {/* FAQ */}
      <section className="section-sm">
        <p data-aos="fade-right" className="label-mono section-label">
          {t("faqSection.label")}
        </p>
        <h2
          data-aos="fade-up"
          data-aos-delay="50"
          className="section-title-sm max-w-[600px]"
        >
          {t("faqSection.title")}
        </h2>
        <div className="faq-list">
          {faqs.map(({ q, a }, i) => (
            <FaqItem key={q} q={q} a={a} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;