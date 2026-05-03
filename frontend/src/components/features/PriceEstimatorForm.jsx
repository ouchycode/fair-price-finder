import React, { useState } from 'react';
import { Briefcase, Clock, Send, AlertCircle } from 'lucide-react';
import SkillTagInput from './SkillTagInput';
import { predictPrice } from '../../services/api';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Data Science', 'Content Writing', 'Digital Marketing',
  'Video Editing', 'Graphic Design', 'SEO', 'Copywriting'
];

const PriceEstimatorForm = ({ onResult }) => {
  const [category, setCategory] = useState('');
  const [skills, setSkills]     = useState([]);
  const [duration, setDuration] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || skills.length === 0 || !duration) {
      setError('Semua field wajib diisi.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await predictPrice({ category, skills, duration: Number(duration) });
      onResult(data);
    } catch {
      setError('Gagal mengambil estimasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      {/* Kategori */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <Briefcase size={14} className="text-gray-400" /> Kategori Jasa
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          <option value="">-- Pilih kategori --</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Skills */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <Send size={14} className="text-gray-400" /> Skills yang Dikuasai
        </label>
        <SkillTagInput value={skills} onChange={setSkills} />
        <p className="text-xs text-gray-400 mt-1">Ketik nama skill lalu tekan Enter untuk menambah</p>
      </div>

      {/* Durasi */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
          <Clock size={14} className="text-gray-400" /> Durasi Pengerjaan (hari)
        </label>
        <input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Contoh: 14"
          className="input-field"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading
          ? <><span className="animate-spin">⏳</span> Menghitung...</>
          : <><Send size={16} /> Estimasi Harga</>
        }
      </button>
    </form>
  );
};

export default PriceEstimatorForm;
