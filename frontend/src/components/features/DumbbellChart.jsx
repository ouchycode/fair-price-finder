import React from "react";
import PropTypes from "prop-types";
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

const DumbbellChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const globalMax = Math.max(...data.map(d => d.maxPrice || 0));

  return (
    <div className="dumbbell-wrapper">


      <div className="db-wrapper">
        {data.map((item, idx) => {
          const min = item.minPrice || 0;
          const max = item.maxPrice || 0;
          const median = item.avgPrice || 0;

          const scaleMax = globalMax > 0 ? globalMax : 1;
          const minLeft = (min / scaleMax) * 100;
          const maxLeft = (max / scaleMax) * 100;
          const medianLeft = (median / scaleMax) * 100;
          
          const lineWidth = maxLeft - minLeft;

          return (
            <div key={item.name || idx} className="db-item-wrapper">
              {/* LABEL */}
              <div className="db-header">
                <span className="db-title">
                  {item.name}
                </span>
                <div className="db-stats">
                  <span>Min: <strong>{formatShortCurrency(min)}</strong></span>
                  <span className="db-opacity-50">—</span>
                  <span className="db-text-indigo">Rata-rata (per Proyek): <strong>{formatShortCurrency(median)}</strong></span>
                  <span className="db-opacity-50">—</span>
                  <span>Max: <strong>{formatShortCurrency(max)}</strong></span>
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
                  title={`Min: ${formatShortCurrency(min)}`}
                />
                

                <div 
                  className="dumbbell-dot-median" 
                  style={{ left: `${medianLeft}%` }}
                  title={`Avg: ${formatShortCurrency(median)}`}
                />
                

                <div 
                  className="dumbbell-dot-minmax" 
                  style={{ left: `${maxLeft}%` }}
                  title={`Max: ${formatShortCurrency(max)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* LEGEND */}
      <div className="db-legend-wrapper">
        <div className="db-legend-item">
          <div className="db-legend-dot-border" />
          <span>Batas Harga Bawah & Atas</span>
        </div>
        <div className="db-legend-item">
          <div className="db-legend-dot-indigo" />
          <span>Harga Rata-rata (per Proyek)</span>
        </div>
      </div>
    </div>
  );
};

DumbbellChart.propTypes = {
  data: PropTypes.array.isRequired,
};

export default DumbbellChart;
