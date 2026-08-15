import React, { useState } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { fmt } from "./utils";
import { useLanguage } from "../../../hooks/useI18n";

const PriceBadge = ({ median }) => {
  const { t } = useLanguage();
  if (median < 300_000)
    return (
      <span className="price-badge entry">
        {t("resultSection.badgeEntry")}
      </span>
    );
  if (median < 1_000_000)
    return (
      <span className="price-badge mid">
        {t("resultSection.badgeMid")}
      </span>
    );
  if (median < 3_000_000)
    return (
      <span className="price-badge premium">
        {t("resultSection.badgePremium")}
      </span>
    );
  return (
    <span className="price-badge enterprise">
      {t("resultSection.badgeEnterprise")}
    </span>
  );
};

PriceBadge.propTypes = {
  median: PropTypes.number.isRequired,
};

const PriceHeader = ({ min_price, median_price, max_price, detected_category, skills, duration }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const lines = [
      `💰 ${t("resultSection.headerTitle")} — ${t("resultSection.copyPrefix")}`,
    ];
    if (detected_category) {
      lines.push(`${t("resultSection.copyCategory")}: ${detected_category}`);
    }
    if (skills && skills.length > 0) {
      lines.push(`${t("resultSection.copySkills")}: ${skills.join(", ")}`);
    }
    if (duration) {
      lines.push(`${t("resultSection.durationFor", duration)}`);
    }
    lines.push(`${t("resultSection.copyMin")} : ${fmt(min_price)}`);
    lines.push(`${t("common.avg")} : ${fmt(median_price)}`);
    lines.push(`${t("resultSection.copyMax")} : ${fmt(max_price)}`);
    navigator.clipboard
      .writeText(lines.join("\n"))
      .then(() => {
        setCopied(true);
        toast.success(t("common.copied"));
        setTimeout(() => setCopied(false), 2200);
      })
      .catch(() => toast.error(t("common.copyFail")));
  };

  return (
    <div className="price-header">
      <div className="flex-center-gap8">
        <CheckCircle2 size={15} color="rgba(255,255,255,0.9)" />
        <span className="price-header-title">
          {t("resultSection.headerTitle")}
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
              <Check size={11} /> {t("common.copied")}
            </>
          ) : (
            <>
              <Copy size={11} /> {t("common.copy")}
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
  detected_category: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.string),
  duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PriceHeader;