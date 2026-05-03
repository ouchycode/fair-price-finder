import React from 'react';
import { LayoutDashboard, TrendingUp, Users, Zap, Info } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { icon: <TrendingUp size={20} className="text-primary-600" />, label: 'Rata-rata Harga Web Dev', value: 'Rp 1.500.000', change: '+5%', up: true },
    { icon: <TrendingUp size={20} className="text-accent-500" />, label: 'Rata-rata Harga UI/UX',  value: 'Rp 1.200.000', change: '+3%', up: true },
    { icon: <Zap size={20} className="text-yellow-500" />,         label: 'Skill Paling Dicari',   value: 'React.js',    change: '',    up: null },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <LayoutDashboard size={22} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Market Trend Dashboard</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8 ml-7">Insight tren harga pasar freelance Indonesia.</p>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ icon, label, value, change, up }) => (
          <div key={label} className="card flex items-start gap-3">
            <div className="bg-gray-50 rounded-lg p-2">{icon}</div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
              {change && (
                <span className={`text-xs font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {change} vs bulan lalu
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard size={16} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">Distribusi Harga per Kategori</h2>
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 border-2 border-dashed border-gray-200">
          <LayoutDashboard size={32} className="text-gray-300" />
          <p className="text-sm">Chart akan muncul setelah data scraping selesai</p>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 text-sm text-yellow-700">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>Data insight akan diisi dari hasil EDA notebook setelah proses scraping selesai.</span>
      </div>
    </div>
  );
};

export default Dashboard;
