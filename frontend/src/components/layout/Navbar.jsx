import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Menu, Sun, Moon, X } from "lucide-react";
import logoFpf from "../../assets/logo/logo-fpf.png";
import { useTheme } from "../../hooks/useTheme";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/estimator", label: "Estimator" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          
          <Link
            to="/"
            onClick={handleLinkClick}
            className="navbar-brand"
          >
            <img
              src={logoFpf}
              alt="FairPrice Finder"
              className="navbar-brand-logo"
            />
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">
                FairPriceFinder
              </span>
              <span className="navbar-brand-subtitle">
                AI-POWERED PRICE ESTIMATION
              </span>
            </div>
          </Link>

          <NavigationMenu.Root className="hide-mobile nav-menu-root">
            <NavigationMenu.List className="desktop-nav-list">
              {NAV_LINKS.map(({ to, label }) => (
                <NavigationMenu.Item key={to}>
                  <NavigationMenu.Link asChild>
                    <Link
                      to={to}
                      onClick={handleLinkClick}
                      className={`nav-link${pathname === to ? " nav-link--active" : ""}`}
                    >
                      {label}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
            </NavigationMenu.List>
          </NavigationMenu.Root>

          {/* ACTIONS & CTA */}
          <div className="navbar-actions">
            <button
              onClick={toggle}
              className="navbar-theme-btn"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hide-mobile">
              <Link
                to="/estimator"
                onClick={handleLinkClick}
                className="btn-primary btn-sm"
              >
                Cek Harga
              </Link>
            </div>

            <button
              className="hide-desktop mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="hide-desktop mobile-dropdown-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`hide-desktop mobile-dropdown ${mobileOpen ? 'mobile-dropdown-open' : 'mobile-dropdown-closed'}`}>
        <div className="mobile-dropdown-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={handleLinkClick}
              className={`mobile-dropdown-link ${pathname === to ? 'mobile-link-active' : 'mobile-link-inactive'}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="mobile-dropdown-footer">
          <Link
            to="/estimator"
            onClick={handleLinkClick}
            className="btn-primary w-full justify-center"
          >
            Cek Harga
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
