import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle2,
  TrendingDown,
  Minus,
  TrendingUp,
  Info,
  Copy,
  Check,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import toast from "react-hot-toast";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const rangesMeta = [
  {
    key: "min_price",
    label: "Minimum",
    icon: TrendingDown,
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    border: "var(--amber-border)",
    tip: "Harga terendah yang masih wajar untuk kategori & skill ini.",
  },
  {
    key: "median_price",
    label: "Median",
    icon: Minus,
    color: "var(--indigo)",
    bg: "var(--indigo-dim)",
    border: "var(--indigo-border)",
    tip: "Harga tengah pasar - acuan paling umum saat negosiasi.",
  },
  {
    key: "max_price",
    label: "Maksimum",
    icon: TrendingUp,
    color: "var(--green)",
    bg: "var(--green-dim)",
    border: "var(--green-border)",
    tip: "Harga tertinggi yang bisa kamu tawarkan jika skill sangat in-demand.",
  },
];

const PriceResult = ({ result }) => {
  const [copied, setCopied] = useState(false);
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

        <div className="result-price-grid">
          {rangesMeta.map(
            ({ key, label, icon: Icon, color, bg, border, tip }, index) => (
              <Tooltip.Root key={key}>
                <Tooltip.Trigger asChild>
                  <div
                    className="result-price-cell"
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                    style={{ background: bg, border: `1px solid ${border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = color)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = border)
                    }
                  >
                    <Icon
                      size={13}
                      color={color}
                      style={{ margin: "0 auto 7px", display: "block" }}
                    />
                    <p className="label-mono result-price-cell__label">
                      {label}
                    </p>
                    <p className="result-price-cell__value" style={{ color }}>
                      {fmt(result[key])}
                    </p>
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content sideOffset={6} className="tooltip-content">
                    {tip}
                    <Tooltip.Arrow style={{ fill: "var(--bg-3)" }} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ),
          )}
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
    </Tooltip.Provider>
  );
};

PriceResult.propTypes = {
  result: PropTypes.shape({
    min_price: PropTypes.number.isRequired,
    median_price: PropTypes.number.isRequired,
    max_price: PropTypes.number.isRequired,
    note: PropTypes.string,
  }),
};

export default PriceResult;
