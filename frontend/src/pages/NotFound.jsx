import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import { useLanguage } from '../hooks/useI18n';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="status-wrap">
      
      <div data-aos="fade-down" className="status-icon status-icon--neutral">
        <SearchX size={22} color="var(--fg-2)" />
      </div>

      <h1 data-aos="fade-up" className="status-title">
        404
      </h1>
      <p data-aos="fade-up" data-aos-delay="50" className="status-desc">
        {t("notFoundSection.desc")}
      </p>

      <div data-aos="fade-up" data-aos-delay="100" className="status-actions">
        <Link to="/" className="btn-secondary btn-sm-wide">
          <ArrowLeft size={14} /> {t("notFoundSection.back")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;