import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, X, Check } from 'lucide-react';

const SKILL_MAP_FALLBACK = {
  'Grafis & Desain': [
    'logo design', 'ui ux design', 'figma', 'branding',
    'animation', 'adobe xd', '3d modeling',
  ],
  'Web dan Pemrograman': [
    'python', 'react', 'laravel', 'javascript', 'nextjs',
    'html css', 'php', 'java', 'kotlin', 'flutter',
    'react native', 'mobile programming', 'wordpress',
    'deep learning', 'machine learning', 'data science',
    'data analysis', 'excel', 'tableau', 'power bi',
  ],
  'Pemasaran & Periklanan': [
    'seo', 'google ads', 'meta ads', 'facebook ads', 'tiktok ads',
    'instagram', 'copywriting', 'content writing',
  ],
  'Penulisan & Penerjemahan': [
    'translation', 'copywriting', 'content writing',
  ],
  'Visual & Audio': [
    'video editing', 'animation', 'after effects', 'video production',
  ],
  'Lainnya': [
    'python', 'figma', 'seo', 'video editing', 'google ads',
    'content writing', 'data analysis', 'logo design',
  ],
};

const toLabel = (s) =>
  s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const SkillDropdown = ({ category, value, onChange }) => {
  const [open, setOpen]       = useState(false);
  const [skills, setSkills]   = useState([]);
  const dropdownRef           = useRef(null);

  useEffect(() => {
    const mapped = category
      ? (SKILL_MAP_FALLBACK[category] || SKILL_MAP_FALLBACK['Lainnya'] || [])
      : [];
    setSkills(mapped);
    
    onChange([]);
  
  }, [category]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (skill) => {
    if (value.includes(skill)) {
      onChange(value.filter(s => s !== skill));
    } else {
      onChange([...value, skill]);
    }
  };

  const removeTag = (skill, e) => {
    e.stopPropagation();
    onChange(value.filter(s => s !== skill));
  };

  const isDisabled = !category || skills.length === 0;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      
      <div
        onClick={() => !isDisabled && setOpen(o => !o)}
        className="select-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 5,
          minHeight: 38,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          padding: '5px 10px',
        }}
      >
        {value.length === 0 ? (
          <span style={{ color: 'var(--fg-3)', fontSize: 13, flex: 1 }}>
            {isDisabled ? 'Pilih kategori dulu…' : 'Pilih skill…'}
          </span>
        ) : (
          value.map(s => (
            <span
              key={s}
              className="skill-tag"
              style={{ fontSize: 11, padding: '2px 7px' }}
            >
              {toLabel(s)}
              <button
                type="button"
                className="skill-tag__remove"
                onClick={(e) => removeTag(s, e)}
              >
                <X size={9} />
              </button>
            </span>
          ))
        )}
        <ChevronDown
          size={12}
          color="var(--fg-3)"
          style={{
            marginLeft: 'auto',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {open && !isDisabled && (
        <div
          className="select-content"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            maxHeight: 220,
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {skills.map(skill => {
            const isSelected = value.includes(skill);
            return (
              <div
                key={skill}
                onClick={() => toggle(skill)}
                className="select-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isSelected ? 'var(--bg-3)' : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <span>{toLabel(skill)}</span>
                {isSelected && <Check size={12} color="var(--accent)" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

SkillDropdown.propTypes = {
  category: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SkillDropdown;
