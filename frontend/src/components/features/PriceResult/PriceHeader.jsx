import React, { useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { fmt } from "./utils";

const PriceBadge = ({ median }) => {
  if (median < 300_000)
    return (
      <span className="price-badge entry">
        Entry Level
      </span>
    );
  if (median < 1_000_000)
    return (
      <span className="price-badge mid">
        Mid Range
      </span>
    );
  if (median < 3_000_000)
    return (
      <span className="price-badge premium">
        Premium
      </span>
    );
  return (
    <span className="price-badge enterprise">
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
    <div className="price-header">
      <div className="flex-center-gap8">
        <CheckCircle2 size={15} color="rgba(255,255,255,0.9)" />
        <span className="price-header-title">
          Estimasi Harga Adil
        </span>
      </div>
      <div className="flex-center-gap8">
        <PriceBadge median={median_price} />
        <button
          onClick={handleCopy}
          className="copy-btn"
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
