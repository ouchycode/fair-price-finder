import React from 'react';
import { BarChart2 } from 'lucide-react';

const MarketChart = ({ data }) => (
  !data || data.length === 0 ? (
    <div className="market-chart-empty">
      <BarChart2 size={32} color="var(--border-2)" />
      <span className="market-chart-empty-text">Belum ada data</span>
    </div>
  ) : null
);

export default MarketChart;
