import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Send, AlertCircle, ChevronDown, Check } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import toast from 'react-hot-toast';
import SkillTagInput from './SkillTagInput';
import { estimatePrice } from '../../services/api';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Data Science', 'Content Writing', 'Digital Marketing',
  'Video Editing', 'Graphic Design', 'SEO', 'Copywriting',
];

const FieldLabel = ({ htmlFor, children, hint }) => (
  <div style={{ marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
    <Label.Root htmlFor={htmlFor} className="label-mono" style={{ cursor: 'default' }}>
      {children}
    </Label.Root>
    {hint && <span style={{ color: 'var(--fg-3)' }}>{hint}</span>}
  </div>
);

const PriceEstimatorForm = ({ onResult, onLoading }) => {
  const [category, setCategory] = useState('');
  const [skills,   setSkills]   = useState([]);
  const [duration, setDuration] = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || skills.length === 0 || !duration) {
      toast.error('Semua field wajib diisi.');
      return;
    }
    setLoading(true);
    if (onLoading) onLoading(true);
    try {
      const { data } = await estimatePrice({ category, skills, duration: Number(duration) });
      onResult(data);
      // RESET FORMULIR
      setCategory('');
      setSkills([]);
      setDuration('');
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

  return (
    <form onSubmit={handleSubmit} className="form-card">

      {/* KATEGORI */}
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
                {CATEGORIES.map(c => (
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

      {/* KEAHLIAN */}
      <div>
        <FieldLabel hint="ketik → Enter">Skills</FieldLabel>
        <SkillTagInput value={skills} onChange={setSkills} />
      </div>

      {/* DURASI */}
      <div>
        <FieldLabel htmlFor="duration-input">Durasi Pengerjaan</FieldLabel>
        <input
          id="duration-input"
          type="number"
          min="1"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="jumlah hari, contoh: 14"
          className="input-field"
        />
      </div>



      <div className="form-divider" />

      {/* KIRIM */}
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
