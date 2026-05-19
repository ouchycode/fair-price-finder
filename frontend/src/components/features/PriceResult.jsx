import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle2,
  Info,
  Copy,
  Check,
  Bot,
  Sparkles
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast from "react-hot-toast";
import { consultPrice } from "../../services/api";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const PriceResult = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [consultation, setConsultation] = useState("");
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    if (result && result.requestParams) {
      setConsultLoading(true);
      setConsultation("");
      
      consultPrice({ ...result.requestParams, role: "freelancer" })
        .then(res => {
          const data = res.data?.data || res.data;
          setConsultation(data.consultation || data.text || "Saran negosiasi berhasil dibuat.");
        })
        .catch(err => {
          console.error("Gagal memuat konsultasi AI:", err);
          setConsultation("Gagal memuat saran dari AI. Anda dapat menggunakan rentang harga di atas sebagai patokan negosiasi standar.");
        })
        .finally(() => {
          setConsultLoading(false);
        });
    }
  }, [result]);

  if (!result) return null;

  const handleCopy = () => {
    const text = [
      `💰 Estimasi Harga Jasa (via FairPrice Finder)`,
      `Min    : ${fmt(result.min_price)}`,
      `Median : ${fmt(result.median_price)}`,
      `Maks   : ${fmt(result.max_price)}`,
      result.note ? `\nCatatan: ${result.note}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2200);
    }).catch((err) => {
      console.error('Clipboard error:', err);
      toast.error('Tidak dapat menyalin ke clipboard');
    });
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* HARGA UTAMA */}
        <div className="result-card">
          <div className="result-card__header">
            <CheckCircle2 size={14} color="var(--green)" />
            <span className="result-card__title">Estimasi Harga Adil</span>
            <button
              onClick={handleCopy}
              className="copy-btn"
              title="Salin hasil estimasi"
              style={{ marginLeft: "auto" }}
            >
              {copied ? (
                <>
                  <Check size={11} /> Tersalin!
                </>
              ) : (
                <>
                  <Copy size={11} /> Salin
                </>
              )}
            </button>
          </div>

          <div className="result-price-display">
            <div className="result-price-main" data-aos="zoom-in" data-aos-delay={100}>
              <span className="result-price-main__label">Harga Tengah (Median)</span>
              <span className="result-price-main__value">{fmt(result.median_price)}</span>
            </div>
            
            <div className="result-price-range" data-aos="fade-up" data-aos-delay={200}>
              <div className="result-price-range__item">
                <span className="result-price-range__label">Min</span>
                <span className="result-price-range__value">{fmt(result.min_price)}</span>
              </div>
              
              <div className="result-price-range__bar-wrap">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="result-price-range__bar">
                      <div className="result-price-range__fill"></div>
                      <div className="result-price-range__marker"></div>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content sideOffset={6} className="tooltip-content">
                      Estimasi posisi pasar dari keahlianmu
                      <Tooltip.Arrow style={{ fill: "var(--bg-3)" }} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              
              <div className="result-price-range__item" style={{ textAlign: "right" }}>
                <span className="result-price-range__label">Maks</span>
                <span className="result-price-range__value">{fmt(result.max_price)}</span>
              </div>
            </div>
          </div>

          {result.note && (
            <div className="result-note">
              <Info
                size={12}
                color="var(--fg-3)"
                style={{ marginTop: 1.5, flexShrink: 0 }}
              />
              <p className="result-note__text">{result.note}</p>
            </div>
          )}
        </div>

        {/* AI CONSULTATION CARD */}
        {(consultLoading || consultation) && (
          <div className="result-card" style={{ border: "1px solid var(--indigo-light)", background: "var(--bg-1)" }} data-aos="fade-up">
            <div className="result-card__header" style={{ marginBottom: "12px" }}>
              <Sparkles size={14} color="var(--indigo)" />
              <span className="result-card__title" style={{ color: "var(--indigo)" }}>Analisis & Saran Negosiasi (AI)</span>
            </div>
            
            <div style={{ fontSize: "13.5px", lineHeight: "1.6", color: "var(--fg-2)" }}>
              {consultLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.7 }}>
                  <Bot size={16} className="spin-slow" />
                  <span>AI sedang menyusun saran untukmu...</span>
                </div>
              ) : (
                <div 
                  className="ai-consultation-content" 
                  dangerouslySetInnerHTML={{ __html: consultation.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} 
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
};

PriceResult.propTypes = {
  result: PropTypes.shape({
    min_price: PropTypes.number.isRequired,
    median_price: PropTypes.number.isRequired,
    max_price: PropTypes.number.isRequired,
    note: PropTypes.string,
    requestParams: PropTypes.object,
  }),
};

export default PriceResult;
