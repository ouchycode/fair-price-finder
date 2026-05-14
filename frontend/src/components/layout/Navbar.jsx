import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Menu, X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import logoSrc from "../../assets/logo/logo-white.png";
import logoSrcLight from "../../assets/logo/logo-dark.png";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/estimator", label: "Estimator" },
  { to: "/dashboard", label: "Dashboard" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {/* Logo + Brand */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className="navbar-brand"
          >
            <img
              src={theme === "dark" ? logoSrc : logoSrcLight}
              alt="FairPrice Finder"
              className="navbar-brand-logo"
            />
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">
                FairPriceFinder
              </span>
              <span className="navbar-brand-subtitle">
                Find. Compare. Price Fairly.
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <NavigationMenu.Root
            className="hide-mobile"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
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

          {/* Desktop CTA */}
          <div className="hide-mobile" style={{ flexShrink: 0 }}>
            <Link
              to="/estimator"
              onClick={handleLinkClick}
              className="btn-primary"
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              Cek Harga
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="hide-desktop mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          className="hide-desktop mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className="hide-desktop mobile-sidebar"
        style={{ right: mobileOpen ? 0 : "-100%" }}
      >
        <div className="mobile-sidebar-header">
          <span className="label-mono">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="mobile-sidebar-close"
          >
            <X size={15} />
          </button>
        </div>
        <div className="mobile-sidebar-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={handleLinkClick}
              className="mobile-sidebar-link"
              style={{
                background: pathname === to ? "var(--bg-2)" : "transparent",
                color: pathname === to ? "var(--fg)" : "var(--fg-2)",
                fontWeight: pathname === to ? 600 : 500,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div className="mobile-sidebar-footer">
          <Link
            to="/estimator"
            onClick={handleLinkClick}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "10px 16px",
              fontSize: 14,
            }}
          >
            Estimasi Harga
          </Link>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
};

export default Navbar;
