import React from "react";
import { Link } from "react-router-dom";
import { Github, Mail, ExternalLink, Sun, Moon } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import { useTheme } from "../../hooks/useTheme";
import logoFpf from "../../assets/logo/logo-fpf.png";

const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Estimator", to: "/estimator" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Dokumentasi", href: "#" },
      { label: "API Reference", href: "#" },
    ],
  },
  {
    title: "Project",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/ouchycode/fair-price-finder",
        icon: Github,
      },
      { label: "Kontak", href: "#", icon: Mail },
    ],
  },
];

const Footer = () => {
  const { theme, toggle } = useTheme();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-wrap">
      <div className="container footer-inner">
        {/* BAGIAN ATAS */}
        <div className="footer-grid">
          {/* MEREK */}
          <div className="footer-brand">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="footer-brand-link"
            >
              <div className="footer-brand-logo">
                <img src={logoFpf} alt="FairPrice Finder" />
              </div>
              <span className="footer-brand-title">FairPrice Finder</span>
            </Link>
            <p className="footer-brand-desc">
              Estimasi harga jasa freelance Indonesia yang adil dan berbasis
              data.
            </p>
          </div>

          {/* KOLOM TAUTAN */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <p className="label-mono footer-col-title">{title}</p>
              <div className="footer-links-wrap">
                {links.map(({ label, to, href, icon: Icon }) =>
                  to ? (
                    <Link
                      key={label}
                      to={to}
                      onClick={handleLinkClick}
                      className="footer-link"
                    >
                      {Icon && <Icon size={12} />} {label}
                    </Link>
                  ) : (
                    <a
                      key={label}
                      href={href}
                      className="footer-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {Icon && <Icon size={12} />} {label}
                      {!Icon && (
                        <ExternalLink size={10} style={{ opacity: 0.4 }} />
                      )}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PEMBAGI */}
        <Separator.Root style={{ height: 1, background: "var(--border)" }} />

        {/* BILAH BAWAH HAK CIPTA ALIH TEMA */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 FairPrice Finder · CC26-PSU164
          </p>

          <div className="footer-bottom-right">
            <p className="footer-copyright">
              Capstone Project · Dicoding × Dbs Foundation
            </p>

            {/* ALIH TEMA GAYA LINEAR */}
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? (
                <>
                  <Sun size={13} className="theme-toggle__icon" /> Light
                </>
              ) : (
                <>
                  <Moon size={13} className="theme-toggle__icon" /> Dark
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
