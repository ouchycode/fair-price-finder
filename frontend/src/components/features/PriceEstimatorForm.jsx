import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send, ChevronDown, Check } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import toast from 'react-hot-toast';
import SkillDropdown from './SkillDropdown';
import { estimatePrice, getCategories } from '../../services/api';

const DEFAULT_CATEGORIES = [
  'Grafis & Desain',
  'Web dan Pemrograman',
  'Pemasaran & Periklanan',
  'Penulisan & Penerjemahan',
  'Visual & Audio',
  'Lainnya',
];

const PROJECT_TYPES_BY_CAT = {
  'Web dan Pemrograman': [
    "Website E-Commerce",
    "Website Company Profile",
    "Landing Page",
    "Aplikasi Mobile",
    "Sistem Kasir (POS)",
    "Bot / Automasi Script"
  ],
  'Grafis & Desain': [
    "Desain Logo & Branding",
    "Desain UI/UX App",
    "Desain Feed / Banner Sosmed",
    "Brosur / Company Profile PDF",
    "Ilustrasi Kreatif"
  ],
  'Pemasaran & Periklanan': [
    "Manajemen Media Sosial",
    "Setup Google Ads / FB Ads",
    "Optimasi SEO Web",
    "Email Marketing"
  ],
  'Visual & Audio': [
    "Video Iklan / Promosi",
    "Video Editing YouTube / TikTok",
    "Voice Over (Pengisi Suara)",
    "Animasi 2D / 3D"
  ],
  'Penulisan & Penerjemahan': [
    "Artikel Blog SEO",
    "Copywriting Landing Page",
    "Penerjemahan Dokumen",
    "Penulisan Buku / E-Book"
  ],
  'Lainnya': [
    "Entri Data / Virtual Assistant",
    "Konsultasi Bisnis",
    "Riset Pasar"
  ]
};

const FieldLabel = ({ htmlFor, children, hint }) => (
  <div style={{ marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
    <Label.Root htmlFor={htmlFor} className="label-mono" style={{ cursor: 'default' }}>
      {children}
    </Label.Root>
    {hint && <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>{hint}</span>}
  </div>
);

const Stepper = ({ id, value, min, max, onChange, label, unit }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
    <span className="label-mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border-1)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-2)' }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 34, height: 38, background: 'none', border: 'none',
          color: value <= min ? 'var(--fg-3)' : 'var(--fg)',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          fontSize: 18, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRight: '1px solid var(--border-1)',
        }}
      >
        −
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--fg)', userSelect: 'none' }}>
        {value}
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--fg-3)', marginLeft: 3 }}>{unit}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 34, height: 38, background: 'none', border: 'none',
          color: value >= max ? 'var(--fg-3)' : 'var(--fg)',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          fontSize: 18, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderLeft: '1px solid var(--border-1)',
        }}
      >
        +
      </button>
    </div>
  </div>
);

const PriceEstimatorForm = ({ onResult, onLoading }) => {
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [category,  setCategory]  = useState('');
  const [projectType, setProjectType] = useState('');
  const [skills,    setSkills]    = useState([]);
  const [days,      setDays]      = useState(7);
  const [role,      setRole]      = useState('freelancer');
  const [loading,   setLoading]   = useState(false);

  // Clear projectType when category changes
  useEffect(() => {
    setProjectType('');
  }, [category]);

  // Generate available project types based on category
  const availableProjectTypes = category && PROJECT_TYPES_BY_CAT[category] 
    ? ["Tidak Spesifik", ...PROJECT_TYPES_BY_CAT[category]] 
    : ["Tidak Spesifik"];

  useEffect(() => {
    getCategories()
      .then(res => {
        const list = res.data?.data?.categories || res.data?.categories;
        if (list && list.length > 0) {
          setCategoriesList(list);
        }
      })
      .catch(err => {
        console.error('Gagal memuat kategori dari API, menggunakan data lokal:', err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; 

    if (!category) {
      toast.error('Pilih kategori jasa terlebih dahulu.');
      return;
    }
    if (skills.length === 0) {
      toast.error('Pilih minimal satu skill.');
      return;
    }

    setLoading(true);
    if (onLoading) onLoading(true);

    try {
      const { data } = await estimatePrice({
        category,
        project_type: projectType !== "Tidak Spesifik" ? projectType : "",
        skills,
        duration: days,   // API
      });
      const resData = data.data || data;
      onResult({
        ...resData,
        requestParams: { category, project_type: projectType, skills, duration: days, role },
      });
      
      setCategory('');
      setProjectType('');
      setSkills([]);
      setDays(7);
      toast.success('Estimasi berhasil didapatkan!');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Gagal mengambil estimasi. Coba lagi.';
      toast.error(message);
      console.error('Estimation error:', error);
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  const filledCount = [category, skills.length > 0, days > 0].filter(Boolean).length;
  const progressPercent = (filledCount / 3) * 100;

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--bg-3)' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'var(--accent)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div>
        <FieldLabel>Kategori Jasa</FieldLabel>
        <Select.Root value={category} onValueChange={setCategory}>
          <Select.Trigger
            className="select-trigger"
            style={{ color: category ? 'var(--fg)' : 'var(--fg-3)' }}
          >
            <Select.Value placeholder="Pilih kategori..." />
            <Select.Icon><ChevronDown size={12} color="var(--fg-3)" /></Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content position="popper" sideOffset={4} className="select-content">
              <Select.Viewport>
                {categoriesList.map(c => (
                  <Select.Item key={c} value={c} className="select-item">
                    <Select.ItemText>{c}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check size={11} color="var(--accent)" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div style={{ marginTop: 20 }}>
        <FieldLabel hint="(Opsional)">Tipe Proyek</FieldLabel>
        <Select.Root value={projectType} onValueChange={setProjectType}>
          <Select.Trigger
            className="select-trigger"
            style={{ color: projectType ? 'var(--fg)' : 'var(--fg-3)' }}
          >
            <Select.Value placeholder="Pilih contoh proyek..." />
            <Select.Icon><ChevronDown size={12} color="var(--fg-3)" /></Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="select-content" position="popper" sideOffset={4}>
              <Select.Viewport>
                {availableProjectTypes.map(p => (
                  <Select.Item key={p} value={p} className="select-item">
                    <Select.ItemText>{p}</Select.ItemText>
                    <Select.ItemIndicator className="select-indicator">
                      <Check size={12} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div style={{ marginTop: 20 }}>     <FieldLabel hint="pilih dari daftar skill">Skills</FieldLabel>
        <SkillDropdown
          category={category}
          value={skills}
          onChange={setSkills}
        />
      </div>

      <div>
        <FieldLabel>Posisi Anda</FieldLabel>
        <div style={{ display: 'flex', background: 'var(--bg-3)', padding: 4, borderRadius: 8, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setRole('freelancer')}
            style={{
              flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6,
              background: role === 'freelancer' ? 'var(--bg-1)' : 'transparent',
              color: role === 'freelancer' ? 'var(--fg)' : 'var(--fg-3)',
              boxShadow: role === 'freelancer' ? 'var(--shadow-1)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Freelancer
          </button>
          <button
            type="button"
            onClick={() => setRole('client')}
            style={{
              flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 6,
              background: role === 'client' ? 'var(--bg-1)' : 'transparent',
              color: role === 'client' ? 'var(--fg)' : 'var(--fg-3)',
              boxShadow: role === 'client' ? 'var(--shadow-1)' : 'none',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Klien
          </button>
        </div>

        <FieldLabel hint="(Asumsi: 1 hari = 8 jam kerja)">Durasi Pengerjaan</FieldLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          <Stepper
            id="days-input"
            value={days}
            min={1}
            max={90}
            onChange={setDays}
            label="Jumlah Hari"
            unit="hari"
          />
        </div>
      </div>

      <div className="form-divider" />

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', padding: '9px 16px', justifyContent: 'center' }}
      >
        {loading
          ? <span style={{ opacity: 0.7 }}>Menghitung estimasi...</span>
          : <><Send size={13} /> Estimasi Harga</>
        }
      </button>
    </form>
  );
};

PriceEstimatorForm.propTypes = {
  onResult: PropTypes.func.isRequired,
  onLoading: PropTypes.func,
};

export default PriceEstimatorForm;
