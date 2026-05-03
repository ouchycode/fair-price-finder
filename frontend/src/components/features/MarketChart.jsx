import React from 'react';
import { BarChart2 } from 'lucide-react';

const MarketChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <BarChart2 size={32} className="text-gray-300" />
        <p className="text-sm">Belum ada data untuk ditampilkan</p>
      </div>
    );
  }
  return (
    <div>
      {/* Chart implementation setelah data tersedia */}
    </div>
  );
};

export default MarketChart;
