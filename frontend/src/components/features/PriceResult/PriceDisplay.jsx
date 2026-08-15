import React from "react";
import PropTypes from "prop-types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmt, fmtShort } from "./utils";
import { useLanguage } from "../../../hooks/useI18n";

const PriceDisplay = ({
  min_price,
  median_price,
  max_price,
  detected_category,
  duration,
}) => {
  const { t } = useLanguage();
  const spread = max_price - min_price;
  const spreadPct = Math.round((spread / median_price) * 100);

  return (
    <>
      <div className="price-display-wrapper">
        <p className="price-display-label">
          {t("resultSection.medianLabel")}
        </p>
        <div
          data-aos="zoom-in"
          data-aos-delay="100"
          className="price-display-value"
        >
          {fmt(median_price)}
        </div>
        {detected_category && (
          <span className="price-display-cat">
            {detected_category}
          </span>
        )}
        {duration && (
          <p className="price-display-duration">
            {t("resultSection.durationFor", duration)}
          </p>
        )}
      </div>

      <div className="price-track-wrapper">
        <div className="price-track-container">
          <div className="price-track-bg">
            <div
              data-aos="fade-right"
              data-aos-delay="200"
              className="price-track-fill"
            />
          </div>
          <div className="price-track-thumb" />
        </div>

        <div className="price-range-grid">
          <div className="price-range-box text-left">
            <div className="price-range-header">
              <TrendingDown size={11} color="var(--green)" />
              <span className="price-range-label">
                {t("common.min")}
              </span>
            </div>
            <div className="price-range-val">
              {fmt(min_price)}
            </div>
            <div className="price-range-subval">
              {fmtShort(min_price)}
            </div>
          </div>

          <div className="price-range-center">
            <Minus size={12} color="var(--fg-3)" />
            <span className="price-spread-text">
              ±{spreadPct}%
            </span>
          </div>

          <div className="price-range-box text-right">
            <div className="price-range-header right">
              <span className="price-range-label">
                {t("common.max")}
              </span>
              <TrendingUp size={11} color="var(--accent)" />
            </div>
            <div className="price-range-val">
              {fmt(max_price)}
            </div>
            <div className="price-range-subval">
              {fmtShort(max_price)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

PriceDisplay.propTypes = {
  min_price: PropTypes.number.isRequired,
  median_price: PropTypes.number.isRequired,
  max_price: PropTypes.number.isRequired,
  detected_category: PropTypes.string,
  duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PriceDisplay;