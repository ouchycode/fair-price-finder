import React, { useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { fmt } from "./utils";

const PriceBadge = ({ median }) => {
  if (median < 300_000)
    return (
      <span
        style={{
          background: "var(--bg-3)",
          color: "var(--fg-2)",
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 20,
        }}
      >
        Entry Level
      </span>
    );
  if (median < 1_000_000)
    return (
      <span
        style={{
          background: "rgba(76,175,125,0.12)",
          color: "var(--green)",
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 20,
        }}
      >
        Mid Range
      </span>
    );
  if (median < 3_000_000)
    return (
      <span
        style={{
          background: "rgba(99,102,241,0.12)",
          color: "var(--indigo)",
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: 20,
        }}
      >
        Premium
      </span>
    );
  return (
    <span
      style={{
        background: "rgba(245,158,11,0.12)",
        color: "var(--amber)",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
      }}
    >
      Enterprise
    </span>
  );
};

PriceBadge.propTypes = {
  median: PropTypes.number.isRequired,
};

const PriceHeader = ({ min_price, median_price, max_price }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = [
      `💰 Estimasi Harga Jasa — FairPrice Finder`,
      `Min    : ${fmt(min_price)}`,
      `Median : ${fmt(median_price)}`,
      `Maks   : ${fmt(max_price)}`,
    ].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Berhasil disalin!");
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => toast.error("Gagal menyalin"));
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, var(--accent) 0%, #a00000 100%)",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CheckCircle2 size={15} color="rgba(255,255,255,0.9)" />
        <span
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Estimasi Harga Adil
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PriceBadge median={median_price} />
        <button
          onClick={handleCopy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: 8,
            padding: "4px 10px",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
          }
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
    </div>
  );
};

PriceHeader.propTypes = {
  min_price: PropTypes.number.isRequired,
  median_price: PropTypes.number.isRequired,
  max_price: PropTypes.number.isRequired,
};

export default PriceHeader;
