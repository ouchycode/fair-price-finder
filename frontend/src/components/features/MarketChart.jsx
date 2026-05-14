import React from 'react';
import { BarChart2 } from 'lucide-react';

const MarketChart = ({ data }) => (
  !data || data.length === 0 ? (
    <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)', background: 'var(--bg-2)', borderRadius: 'var(--r)', border: '1px dashed var(--border-2)' }}>
      <BarChart2 size={28} color="var(--fg-3)" />
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-3)' }}>Belum ada data</span>
    </div>
  ) : null
);

export default MarketChart;
