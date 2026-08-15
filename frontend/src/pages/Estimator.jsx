import React, { useState, useRef } from "react";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";
import PriceEstimatorForm from "../components/features/PriceEstimatorForm";
import PriceResult from "../components/features/PriceResult/index.jsx";
import ResultSkeleton from "../components/features/ResultSkeleton";
import PageHeader from "../components/common/PageHeader";
import { useLanguage } from "../hooks/useI18n";

// PLACEHOLDER SAAT BELUM ADA HASIL
const EmptyResult = () => {
  const { t } = useLanguage();

  return (
    <div className="empty-result">
      <div className="empty-result__icon">
        <Lightbulb size={24} color="var(--indigo)" strokeWidth={1.5} />
      </div>
      <div>
        <p className="empty-result__title">{t("estimatorSection.emptyTitle")}</p>
        <p className="empty-result__desc">
          {t("estimatorSection.emptyDesc1")}
          <br />
          <strong className="text-[var(--fg-2)]">
            {t("formSection.submit")}
          </strong>{" "}
          {t("estimatorSection.emptyDesc2")}
        </p>
      </div>

      <div className="empty-result__steps">
        {t("estimatorSection.emptySteps").map((s, i) => (
          <div key={s} className="empty-result__step">
            <span className="empty-result__step-num">{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
};

// PANEL ERROR STATIS DI KOLOM HASIL (#5)
const ErrorResult = ({ message, onRetry }) => {
  const { t } = useLanguage();

  return (
    <div className="empty-result error-result" role="alert">
      <div className="empty-result__icon error-result__icon">
        <AlertTriangle size={22} color="var(--red)" strokeWidth={1.7} />
      </div>
      <div>
        <p className="empty-result__title">{t("estimatorSection.errorTitle")}</p>
        <p className="empty-result__desc">
          {message || t("estimatorSection.errorDesc")}
        </p>
      </div>
      <button type="button" onClick={onRetry} className="btn-primary btn-sm">
        {t("estimatorSection.errorRetry")}
      </button>
    </div>
  );
};

const Estimator = () => {
  const { t } = useLanguage();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const scrollToResult = () => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleLoading = (loading) => {
    setIsLoading(loading);
    if (loading) {
      setError(null);
      scrollToResult();
    }
  };

  const handleResult = (res) => {
    setResult(res);
    setError(null);
    scrollToResult();
  };

  const handleError = (message) => {
    setError(message);
  };

  const handleRetry = () => {
    const submitBtn = document.querySelector(
      '.form-card button[type="submit"]',
    );
    submitBtn?.scrollIntoView({ behavior: "smooth", block: "center" });
    submitBtn?.focus();
  };

  return (
    <div className="page-wrap min-h-85vh">
      {/* HEADER */}
      <div data-aos="fade-down">
        <PageHeader
          eyebrow={t("estimatorSection.label")}
          title={t("estimatorSection.title")}
          description={t("estimatorSection.desc")}
        />
      </div>

      <div data-aos="fade-up" data-aos-delay="180" className="estimator-grid">
        <div className="flex flex-col gap-4">
          <div className="alert alert--info">
            <Info
              size={13}
              color="var(--indigo)"
              className="mt-[1px] shrink-0"
            />
            <p className="alert__text">
              {t("estimatorSection.alert")}
            </p>
          </div>
          <PriceEstimatorForm
            onResult={handleResult}
            onLoading={handleLoading}
            onError={handleError}
          />
        </div>

        <div className="estimator-grid__result" ref={resultRef}>
          {error ? (
            <ErrorResult message={error} onRetry={handleRetry} />
          ) : isLoading && !result ? (
            <div data-aos="zoom-in">
              <ResultSkeleton />
            </div>
          ) : result ? (
            <div data-aos="zoom-in">
              {isLoading && (
                <div className="result-updating-banner">
                  <span className="result-updating-dot" />
                  {t("estimatorSection.updating")}
                </div>
              )}
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