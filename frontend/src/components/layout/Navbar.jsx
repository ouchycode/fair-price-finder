import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DollarSign, LayoutDashboard, Calculator, Menu, X, TrendingUp } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: '/',           label: 'Home',       icon: <TrendingUp size={16} /> },
    { to: '/estimator',  label: 'Estimator',  icon: <Calculator size={16} /> },
    { to: '/dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <DollarSign size={18} />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              FairPrice<span className="text-primary-600">Finder</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === to
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link to="/estimator" className="hidden md:flex items-center gap-2 btn-primary text-sm">
            <Calculator size={16} />
            Cek Harga
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 flex flex-col gap-1">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  pathname === to ? 'bg-primary-50 text-primary-600' : 'text-gray-600'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
