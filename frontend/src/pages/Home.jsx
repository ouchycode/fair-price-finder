import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target, BarChart2, Scale, ArrowRight,
  Users, TrendingUp, Award, ChevronRight
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Target size={28} className="text-primary-600" />,
      title: 'Estimasi Akurat',
      desc: 'Berbasis model deep learning dari data pasar freelance Indonesia.'
    },
    {
      icon: <BarChart2 size={28} className="text-accent-500" />,
      title: 'Insight Pasar',
      desc: 'Lihat tren harga per kategori jasa dan skill yang paling dicari.'
    },
    {
      icon: <Scale size={28} className="text-green-600" />,
      title: 'Harga Adil',
      desc: 'Bantu freelancer dan klien menemukan titik temu harga yang sepadan.'
    },
  ];

  const stats = [
    { icon: <Users size={20} className="text-primary-600" />, value: '59.4%', label: 'Pekerja sektor informal Indonesia (BPS 2025)' },
    { icon: <TrendingUp size={20} className="text-accent-500" />, value: '36.3%', label: 'Proporsi freelancer dari total pekerja' },
    { icon: <Award size={20} className="text-green-600" />, value: 'SDG 8', label: 'Mendukung pekerjaan layak & ekonomi inklusif' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Award size={12} /> CC26-PSU164 · Coding Camp 2026
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Temukan <span className="text-yellow-300">Harga Adil</span><br />untuk Jasa Freelance
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Platform berbasis AI yang membantu freelancer dan klien menentukan harga jasa secara objektif berdasarkan data pasar Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/estimator"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Cek Estimasi Harga <ArrowRight size={16} />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 border border-white/50 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <BarChart2 size={16} /> Lihat Tren Pasar
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Mengapa Fair Price Finder?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="card text-center hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {stats.map(({ icon, value, label }) => (
            <div key={value} className="flex flex-col items-center gap-2">
              <div className="bg-white rounded-full p-3 shadow-sm">{icon}</div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="py-14 px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Siap menentukan harga yang tepat?</h2>
        <p className="text-gray-500 text-sm mb-6">Gratis, berbasis data, dan hanya butuh beberapa detik.</p>
        <Link
          to="/estimator"
          className="inline-flex items-center gap-2 btn-primary"
        >
          Mulai Sekarang <ChevronRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Home;
