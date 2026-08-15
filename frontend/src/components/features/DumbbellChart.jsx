import React from "react";
import PropTypes from "prop-types";
import { useLanguage } from "../../hooks/useI18n";

const formatShortCurrency = (value) => {
  if (!value) return "Rp 0";
  if (value >= 1_000_000) {
    const jt = value / 1_000_000;
    return `Rp ${jt.toFixed(1).replace(".0", "")}jt`;
  }
  if (value >= 1_000) {
    const rb = value / 1_000;
    return `Rp ${rb.toFixed(0)}rb`;
  }
  return `Rp ${value}`;
};

const AXIS_STEPS = [0, 0.25, 0.5, 0.75, 1];

const DumbbellChart = ({ data }) => {
  const { t } = useLanguage();

  if (!data || data.length === 0) return null;

  const globalMax = Math.max(...data.map((d) => d.maxPrice || 0));
  const scaleMax = globalMax > 0 ? globalMax : 1;

  return (
    <div className="dumbbell-wrapper">
      <div className="db-wrapper">
        {data.map((item, idx) => {
          const min = item.minPrice || 0;
          const max = item.maxPrice || 0;
          const median = item.avgPrice || 0;

          const minLeft = (min / scaleMax) * 100;
          const maxLeft = (max / scaleMax) * 100;
          const medianLeft = (median / scaleMax) * 100;

          const lineWidth = maxLeft - minLeft;

          return (
            <div key={item.name || idx} className="db-item-wrapper">
              {/* LABEL */}
              <div className="db-header">
                <span className="db-title" title={item.name}>
                  {item.name}
                </span>
                <div className="db-stats">
                  <span>{t("common.min")}: <strong>{formatShortCurrency(min)}</strong></span>
                  <span className="db-opacity-50">—</span>
                  <span className="db-text-indigo">{t("chartSection.avgProject")}: <strong>{formatShortCurrency(median)}</strong></span>
                  <span className="db-opacity-50">—</span>
                  <span>{t("common.max")}: <strong>{formatShortCurrency(max)}</strong></span>
                </div>
              </div>

              {/* VISUALISASI */}
              <div className="dumbbell-track-wrapper db-track-margin">
                <div className="dumbbell-track" />

                <div
                  className="dumbbell-line"
                  style={{ left: `${minLeft}%`, width: `${lineWidth}%` }}
                />

                <div
                  className="dumbbell-dot-minmax"
                  style={{ left: `${minLeft}%` }}
                  title={`${t("common.min")}: ${formatShortCurrency(min)}`}
                />

                <div
                  className="dumbbell-dot-median"
                  style={{ left: `${medianLeft}%` }}
                  title={`${t("chartSection.avgProject")}: ${formatShortCurrency(median)}`}
                />

                <div
                  className="dumbbell-dot-minmax"
                  style={{ left: `${maxLeft}%` }}
                  title={`${t("common.max")}: ${formatShortCurrency(max)}`}
                />
              </div>
            </div>
          );
        })}

        {/* SKALA HARGA */}
        <div className="db-axis" aria-hidden="true">
          {AXIS_STEPS.map((step) => {
            const left = step * 100;
            return (
              <span
                key={step}
                className="db-axis-tick"
                style={{ left: `${left}%` }}
              >
                {formatShortCurrency(scaleMax * step)}
              </span>
            );
          })}
          <div className="db-axis-hints">
            <span className="db-axis-hint">{t("chartSection.axisCheap")}</span>
            <span className="db-axis-hint">{t("chartSection.axisExpensive")}</span>
          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div className="db-legend-wrapper">
        <div className="db-legend-item">
          <div className="db-legend-dot-border" />
          <span>{t("chartSection.legendLow")}</span>
        </div>
        <div className="db-legend-item">
          <div className="db-legend-dot-indigo" />
          <span>{t("chartSection.legendAvg")}</span>
        </div>
      </div>
    </div>
  );
};

DumbbellChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default DumbbellChart;