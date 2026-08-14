import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, X, Check } from 'lucide-react';
import { useLanguage } from '../../hooks/useI18n';

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
  const { t } = useLanguage();
  const [open, setOpen]       = useState(false);
  const [skills, setSkills]   = useState([]);
  const dropdownRef           = useRef(null);
  const dropdownTriggerRef    = useRef(null);
  const prevCategoryRef       = useRef(category);

  useEffect(() => {
    const mapped = category
      ? (SKILL_MAP_FALLBACK[category] || SKILL_MAP_FALLBACK['Lainnya'] || [])
      : [];
    setSkills(mapped);

    // RESET PARENT HANYA SAAT KATEGORI BENAR-BENAR BERUBAH,
    // BUKAN SAAT MOUNT (supaya draft/riwayat yang dipulihkan tidak hilang).
    if (prevCategoryRef.current !== category) {
      onChange([]);
      prevCategoryRef.current = category;
    }
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
    <div ref={dropdownRef} className="dropdown-relative">
      
      <div
        ref={(el) => { dropdownTriggerRef.current = el; }}
        onClick={() => !isDisabled && setOpen(o => !o)}
        onKeyDown={(e) => {
          if (isDisabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(o => !o);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('formSection.skills')}
        className={`select-trigger dropdown-trigger-custom ${isDisabled ? 'disabled' : 'enabled'} ${open ? 'select-trigger-open' : ''}`}
      >
        {value.length === 0 ? (
          <span className="dropdown-placeholder-text">
            {isDisabled ? t('formSection.skillsPlaceholderCat') : t('formSection.skillsPlaceholder')}
          </span>
        ) : (
          value.map(s => (
            <span
              key={s}
              className="skill-tag skill-tag-sm"
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
          className={`chevron-icon ${open ? 'open' : 'closed'}`}
        />
      </div>

      {open && !isDisabled && (
        <div className="select-content select-content-custom">
          {skills.map(skill => {
            const isSelected = value.includes(skill);
            return (
              <div
                key={skill}
                onClick={() => toggle(skill)}
                className={`select-item select-item-custom ${isSelected ? 'selected' : 'unselected'}`}
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
