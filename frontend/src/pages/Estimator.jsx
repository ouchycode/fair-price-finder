import React, { useState } from 'react';
import { Info, Lightbulb } from 'lucide-react';
import PriceEstimatorForm from '../components/features/PriceEstimatorForm';
import PriceResult from '../components/features/PriceResult/index.jsx';
import ResultSkeleton from '../components/features/ResultSkeleton';

// PLACEHOLDER SAAT BELUM ADA HASIL
const EmptyResult = () => (
  <div className="empty-result">
    
    <div className="empty-result__icon">
      <Lightbulb size={24} color="var(--indigo)" strokeWidth={1.5} />
    </div>
    <div>
      <p className="empty-result__title">
        Hasil estimasi muncul di sini
      </p>
      <p className="empty-result__desc">
        Isi form di sebelah kiri, lalu klik<br />
        <strong className="text-[var(--fg-2)]">Estimasi Harga</strong> untuk melihat hasilnya.
      </p>
    </div>

    <div className="empty-result__steps">
      {['Kategori', 'Skill', 'Durasi'].map((s, i) => (
        <div key={s} className="empty-result__step">
          <span className="empty-result__step-num">
            {i + 1}
          </span>
          {s}
        </div>
      ))}
    </div>
  </div>
);

const Estimator = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="page-wrap" style={{ minHeight: '85vh' }}>
      {/* HEADER */}
      <div className="estimator-header">
        <p data-aos="fade-down" className="label-mono mb-2.5">
          Price Estimator
        </p>
        <h1 data-aos="fade-up" data-aos-delay="50" className="page-subtitle">
          Berapa nilai jasa kamu?
        </h1>
        <p data-aos="fade-up" data-aos-delay="100" className="page-desc">
          Isi kategori jasa, skill yang dikuasai, dan estimasi durasi pengerjaan.
        </p>
      </div>

      {/* FORM */}
      <div data-aos="fade-up" data-aos-delay="180" className="estimator-grid">
        {/* FORM */}
        <div className="flex flex-col gap-4">
          <div className="alert alert--info">
            <Info size={13} color="var(--indigo)" className="mt-[1px] shrink-0" />
            <p className="alert__text">
              Semakin spesifik skill yang kamu isi, semakin akurat estimasi harganya.
            </p>
          </div>
          <PriceEstimatorForm onResult={setResult} onLoading={setIsLoading} />
        </div>

        <div className="estimator-grid__result">
          {isLoading ? (
            <div data-aos="zoom-in">
              <ResultSkeleton />
            </div>
          ) : result ? (
            <div data-aos="zoom-in">
              <PriceResult result={result} />
            </div>
          ) : (
            <EmptyResult />
          )}
        </div>
      </div>

    </div>
  );
};

export default Estimator;
