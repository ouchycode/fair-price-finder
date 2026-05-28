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
  const [skills,    setSkills]    = useState([]);
  const [days,      setDays]      = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [loading,   setLoading]   = useState(false);

  // API
  const totalHours = days * hoursPerDay;

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
        skills,
        duration: days,   // API
      });
      const resData = data.data || data;
      onResult({
        ...resData,
        requestParams: { category, skills, duration: days, hoursPerDay, totalHours },
      });
      
      setCategory('');
      setSkills([]);
      setDays(7);
      setHoursPerDay(8);
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

      <div>
        <FieldLabel hint="pilih dari daftar skill">Skills</FieldLabel>
        <SkillDropdown
          category={category}
          value={skills}
          onChange={setSkills}
        />
      </div>

      <div>
        <FieldLabel>Durasi Pengerjaan</FieldLabel>

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
          <Stepper
            id="hours-input"
            value={hoursPerDay}
            min={1}
            max={12}
            onChange={setHoursPerDay}
            label="Jam per Hari"
            unit="jam"
          />
        </div>

        <div
          style={{
            marginTop: 10,
            padding: '8px 12px',
            background: 'var(--bg-3)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--fg-2)',
          }}
        >
          <span>
            <b style={{ color: 'var(--fg)' }}>{days}</b> hari
            {' '}×{' '}
            <b style={{ color: 'var(--fg)' }}>{hoursPerDay}</b> jam/hari
          </span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
            = {totalHours} jam total
          </span>
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
