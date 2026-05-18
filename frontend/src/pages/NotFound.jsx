import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="status-wrap">
      
      <div data-aos="fade-down" className="status-icon status-icon--neutral">
        <SearchX size={22} color="var(--fg-2)" />
      </div>

      <h1 data-aos="fade-up" className="status-title">
        404
      </h1>
      <p data-aos="fade-up" data-aos-delay="50" className="status-desc">
        Halaman yang kamu cari tidak ditemukan atau telah dipindahkan.
      </p>

      <div data-aos="fade-up" data-aos-delay="100" className="status-actions">
        <Link to="/" className="btn-secondary" style={{ fontSize: 13.5, padding: "9px 18px" }}>
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
