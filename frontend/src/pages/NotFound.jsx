import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="page-wrap--narrow notfound-wrap">
      
      <div data-aos="fade-down" className="notfound-icon">
        <SearchX size={32} color="var(--fg-2)" />
      </div>

      <h1 data-aos="fade-up" className="page-subtitle notfound-title">
        404
      </h1>
      <p data-aos="fade-up" data-aos-delay="50" className="page-desc notfound-desc">
        Halaman yang kamu cari tidak ditemukan atau telah dipindahkan.
      </p>

      <div data-aos="fade-up" data-aos-delay="100">
        <Link to="/" className="btn-secondary notfound-btn">
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
