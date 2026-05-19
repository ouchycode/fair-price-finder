import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { Menu } from "lucide-react";
import logoFpf from "../../assets/logo/logo-fpf.png";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/estimator", label: "Estimator" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const { pathname } = useLocation();
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
          {/* LOGO MEREK */}
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

          {/* NAV DESKTOP */}
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

          {/* CTA DESKTOP */}
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

          {/* HAMBURGER SELULER */}
          <button
            className="hide-desktop mobile-menu-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <Menu size={16} />
          </button>
        </div>
      </nav>

      {/* MENU DROPDOWN SELULER */}
      {mobileOpen && (
        <div
          className="hide-desktop mobile-dropdown-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className="hide-desktop mobile-dropdown"
        style={{ display: mobileOpen ? "flex" : "none" }}
      >
        <div className="mobile-dropdown-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={handleLinkClick}
              className="mobile-dropdown-link"
              style={{
                background: pathname === to ? "var(--bg-2)" : "transparent",
                color: pathname === to ? "var(--fg)" : "var(--fg-2)",
                fontWeight: pathname === to ? 600 : 400,
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="mobile-dropdown-footer">
          <Link
            to="/estimator"
            onClick={handleLinkClick}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Cek Harga
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
