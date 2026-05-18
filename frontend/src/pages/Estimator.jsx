import React, { useState } from 'react';
import { Info } from 'lucide-react';
import PriceEstimatorForm from '../components/features/PriceEstimatorForm';
import PriceResult from '../components/features/PriceResult';
import ResultSkeleton from '../components/features/ResultSkeleton';

const Estimator = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="page-wrap--narrow" style={{ position: "relative" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        <p data-aos="fade-down" className="label-mono" style={{ marginBottom: 10 }}>Price Estimator</p>
        <h1 data-aos="fade-up" data-aos-delay="50" className="page-subtitle">Berapa nilai jasa kamu?</h1>
        <p data-aos="fade-up" data-aos-delay="100" className="page-desc">
          Isi kategori jasa, skill yang dikuasai, dan estimasi durasi pengerjaan.
        </p>

        <div data-aos="fade-up" data-aos-delay="150" className="alert alert--info">
          <Info size={13} color="var(--indigo)" style={{ marginTop: 1, flexShrink: 0 }} />
          <p className="alert__text">
            Semakin spesifik skill yang kamu isi, semakin akurat estimasi harganya.
          </p>
        </div>

        <div data-aos="fade-up" data-aos-delay="200">
          <PriceEstimatorForm onResult={setResult} onLoading={setIsLoading} />
        </div>

        {isLoading ? (
          <div data-aos="zoom-in" data-aos-delay="100" style={{ marginTop: 20 }}>
            <ResultSkeleton />
          </div>
        ) : result ? (
          <div data-aos="zoom-in" data-aos-delay="100" style={{ marginTop: 20 }}>
            <PriceResult result={result} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Estimator;
