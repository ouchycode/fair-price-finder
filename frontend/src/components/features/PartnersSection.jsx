import React from "react";
import { useLanguage } from "../../hooks/useI18n";
import dicodingLogo from "../../assets/logo/dicoding.avif";
import dicodingWhiteLogo from "../../assets/logo/dicodingwhite.avif";
import dbsLogo from "../../assets/logo/dbs.png";
import dbsWhiteLogo from "../../assets/logo/dbswhite.png";

const partnersLogos = [
  {
    name: "Dicoding",
    url: "https://www.dicoding.com",
    light: dicodingLogo,
    dark: dicodingWhiteLogo,
  },
  {
    name: "DBS Bank",
    url: "https://www.dbs.com",
    light: dbsLogo,
    dark: dbsWhiteLogo,
  },
];

const PartnersSection = () => {
  const { t } = useLanguage();

  const items = [
    ...partnersLogos,
    ...partnersLogos,
    ...partnersLogos,
    ...partnersLogos,
    ...partnersLogos,
    ...partnersLogos,
    ...partnersLogos,
    ...partnersLogos,
  ];

  return (
    <section className="partners-section">
      <p className="partners-label" data-aos="fade-down">
        {t("partnersSection.label")}
      </p>
      <div className="partners-marquee-wrap" data-aos="fade-up" data-aos-delay="80">
        <div className="partners-marquee">
          {items.map(({ name, url, light, dark }, i) => (
            <a
              key={`${name}-${i}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="partners-logo-item"
            >
              <img
                src={light}
                alt={name}
                className="partners-logo-img partners-logo-img--light"
              />
              <img
                src={dark}
                alt={`${name} (dark)`}
                className="partners-logo-img partners-logo-img--dark"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;