import React from 'react';
import { TrendingDown, Minus, TrendingUp, CheckCircle, Info } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const PriceResult = ({ result }) => {
  if (!result) return null;

  const ranges = [
    { label: 'Minimum',  value: result.min_price,    icon: <TrendingDown size={18} />, color: 'text-yellow-600',  bg: 'bg-yellow-50' },
    { label: 'Median',   value: result.median_price,  icon: <Minus size={18} />,        color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Maksimum', value: result.max_price,     icon: <TrendingUp size={18} />,   color: 'text-green-600',   bg: 'bg-green-50' },
  ];

  return (
    <div className="card border-l-4 border-primary-500 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle size={18} className="text-green-500" />
        <h3 className="font-semibold text-gray-900">Estimasi Harga Adil</h3>
      </div>

      {/* Price range */}
      <div className="grid grid-cols-3 gap-3">
        {ranges.map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl py-4 px-3 text-center`}>
            <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-base font-bold ${color} leading-tight`}>{fmt(value)}</p>
          </div>
        ))}
      </div>

      {/* Note */}
      {result.note && (
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <Info size={13} className="mt-0.5 shrink-0" />
          {result.note}
        </div>
      )}
    </div>
  );
};

export default PriceResult;
