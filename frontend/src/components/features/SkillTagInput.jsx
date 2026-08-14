import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../hooks/useI18n';

const MAX_SKILLS = 10;
const MIN_SKILL_LENGTH = 2;
const MAX_SKILL_LENGTH = 50;

const SkillTagInput = ({ value, onChange }) => {
  const { t } = useLanguage();
  const [input,   setInput]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const s = input.trim();

      // VALIDASI
      if (s.length < MIN_SKILL_LENGTH || s.length > MAX_SKILL_LENGTH) {
        toast.error(t('skillsSection.tagErrLength', [MIN_SKILL_LENGTH, MAX_SKILL_LENGTH]));
        return;
      }

      if (value.includes(s)) {
        toast.error(t('skillsSection.tagErrDuplicate'));
        return;
      }

      if (value.length >= MAX_SKILLS) {
        toast.error(t('skillsSection.tagErrMax', MAX_SKILLS));
        return;
      }

      onChange([...value, s]);
      setInput('');
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`skill-tag-input-container ${focused ? 'focused' : ''}`}
    >
      <div className="skill-tag-list">
        {value.map(s => (
          <span key={s} className="skill-tag">
            {s}
            <button
              type="button"
              className="skill-tag__remove"
              onClick={() => onChange(value.filter(x => x !== s))}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={add}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={value.length === 0 ? t('skillsSection.tagPlaceholder') : t('skillsSection.tagAdd')}
          className="skill-tag-input"
        />
      </div>
    </div>
  );
};

SkillTagInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SkillTagInput;
