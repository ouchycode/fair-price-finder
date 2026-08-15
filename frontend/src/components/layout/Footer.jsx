import React from "react";
import { Link } from "react-router-dom";
import { Github, Mail, ExternalLink } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";
import logoFpf from "../../assets/logo/logo-fpf.png";
import { useLanguage } from "../../hooks/useI18n";

const Footer = () => {
  const { t } = useLanguage();

  const footerLinks = [
    {
      title: t("footer.colPlatform"),
      links: [
        { label: t("common.estimator"), to: "/estimator" },
        { label: t("common.dashboard"), to: "/dashboard" },
        { label: t("common.about"), to: "/about" },
      ],
    },
    {
      title: t("footer.colResources"),
      links: [
        { label: t("footer.contact"), href: "https://github.com/ouchycode/fair-price-finder", icon: Mail },
        { label: t("footer.github"), href: "https://github.com/ouchycode/fair-price-finder", icon: Github },
      ],
    },
  ];

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer-wrap">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="footer-brand-link"
            >
              <div className="footer-brand-logo">
                <img src={logoFpf} alt="Fair Price Finder" />
              </div>
              <span className="footer-brand-title">Fair Price Finder</span>
            </Link>
            <p className="footer-brand-desc">
              {t("footer.tagline")}
            </p>
          </div>

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
                        <ExternalLink size={10} className="opacity-40" />
                      )}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator.Root className="divider-line" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 Fair Price Finder · CC26-PSU164
          </p>

          <div className="footer-bottom-right">
            <p className="footer-copyright">
              {t("footer.copyright")} · {t("footer.right")}
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
