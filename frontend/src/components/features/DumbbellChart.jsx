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

  // Temukan harga paling tinggi (max) di seluruh data yang di-pass
  // Agar skala x-axis proporsional.
  const globalMax = Math.max(...data.map(d => d.maxPrice || 0));

  return (
    <div className="dumbbell-wrapper">
      {/* Header dihapus karena sudah ada di Dashboard.jsx */}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.map((item, idx) => {
          const min = item.minPrice || 0;
          const max = item.maxPrice || 0;
          const median = item.avgPrice || 0;

          // Hindari pembagian dengan nol
          const scaleMax = globalMax > 0 ? globalMax : 1;

          // Hitung persentase posisi dari kiri (0%) ke kanan (100%)
          const minLeft = (min / scaleMax) * 100;
          const maxLeft = (max / scaleMax) * 100;
          const medianLeft = (median / scaleMax) * 100;
          
          const lineWidth = maxLeft - minLeft;

          return (
            <div key={item.name || idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Label */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {item.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 11, color: "var(--fg-3)" }}>
                  <span>Min: <strong>{formatShortCurrency(min)}</strong></span>
                  <span style={{ opacity: 0.5 }}>—</span>
                  <span style={{ color: "var(--indigo)" }}>Rata-rata (per Proyek): <strong>{formatShortCurrency(median)}</strong></span>
                  <span style={{ opacity: 0.5 }}>—</span>
                  <span>Max: <strong>{formatShortCurrency(max)}</strong></span>
                </div>
              </div>

              {/* Trek Visual */}
              <div className="dumbbell-track-wrapper" style={{ margin: "0 8px" }}>
                <div className="dumbbell-track" />
                
                {/* Garis rentang (Min -> Max) */}
                <div 
                  className="dumbbell-line" 
                  style={{ left: `${minLeft}%`, width: `${lineWidth}%` }} 
                />
                
                {/* Titik Terendah */}
                <div 
                  className="dumbbell-dot-minmax" 
                  style={{ left: `${minLeft}%` }}
                  title={`Min: ${formatShortCurrency(min)}`}
                />
                
                {/* Titik Median / Average */}
                <div 
                  className="dumbbell-dot-median" 
                  style={{ left: `${medianLeft}%` }}
                  title={`Avg: ${formatShortCurrency(median)}`}
                />
                
                {/* Titik Tertinggi */}
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

      {/* Legend untuk orang awam */}
      <div style={{ display: "flex", gap: 24, marginTop: 32, fontSize: 11, color: "var(--fg-3)", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid var(--fg-3)", background: "var(--bg-1)" }} />
          <span>Batas Harga Bawah & Atas</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "3px solid var(--indigo)", background: "var(--bg-1)" }} />
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
