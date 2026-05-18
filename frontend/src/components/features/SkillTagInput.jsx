import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_SKILLS = 10;
const MIN_SKILL_LENGTH = 2;
const MAX_SKILL_LENGTH = 50;

const SkillTagInput = ({ value, onChange }) => {
  const [input,   setInput]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const s = input.trim();

      // VALIDASI
      if (s.length < MIN_SKILL_LENGTH || s.length > MAX_SKILL_LENGTH) {
        toast.error(`Skill harus ${MIN_SKILL_LENGTH}-${MAX_SKILL_LENGTH} karakter`);
        return;
      }

      if (value.includes(s)) {
        toast.error('Skill sudah ditambahkan');
        return;
      }

      if (value.length >= MAX_SKILLS) {
        toast.error(`Maksimal ${MAX_SKILLS} skill`);
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
      className={`skill-tag-wrap ${focused ? 'skill-tag-wrap--focused' : ''}`}
      style={{ border: `1px solid ${focused ? 'var(--indigo)' : 'var(--border-1)'}` }}
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
          placeholder={value.length === 0 ? 'React, Figma, Node.js...' : '+ tambah'}
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
