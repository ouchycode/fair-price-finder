import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Mail, ExternalLink, Sun, Moon } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import { useTheme } from '../../hooks/useTheme';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Estimator', to: '/estimator' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Dokumentasi', href: '#' },
      { label: 'API Reference', href: '#' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: '#', icon: Github },
      { label: 'Kontak', href: '#', icon: Mail },
    ],
  },
];

const Footer = () => {
  const { theme, toggle } = useTheme();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-wrap">
      <div className="container footer-inner">

        {/* Top section */}
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link to="/" onClick={handleLinkClick} className="footer-brand">
              <div className="footer-brand-logo">
                <Zap size={11} color="#ffffff" strokeWidth={2.5} />
              </div>
              <span className="footer-brand-title">
                FairPriceFinder
              </span>
            </Link>
            <p className="footer-brand-desc">
              Estimasi harga jasa freelance Indonesia yang adil dan berbasis data.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <p className="label-mono footer-col-title">{title}</p>
              <div className="footer-links-wrap">
                {links.map(({ label, to, href, icon: Icon }) =>
                  to ? (
                    <Link key={label} to={to} onClick={handleLinkClick} className="footer-link">
                      {Icon && <Icon size={12} />} {label}
                    </Link>
                  ) : (
                    <a key={label} href={href} className="footer-link" target="_blank" rel="noopener noreferrer">
                      {Icon && <Icon size={12} />} {label}
                      {!Icon && <ExternalLink size={10} style={{ opacity: 0.4 }} />}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <Separator.Root style={{ height: 1, background: 'var(--border)' }} />

        {/* Bottom bar — copyright + theme toggle */}
        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 FairPrice Finder · CC26-PSU164</p>

          <div className="footer-bottom-right">
            <p className="footer-copyright">Capstone Project · Dicoding × Dbs Foundation</p>

            {/* Theme toggle — Linear style */}
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <><Sun size={13} className="theme-toggle__icon" /> Light</>
                : <><Moon size={13} className="theme-toggle__icon" /> Dark</>
              }
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
