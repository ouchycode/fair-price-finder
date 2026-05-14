import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

const SkillTagInput = ({ value, onChange }) => {
  const [input,   setInput]   = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const s = input.trim();
      if (!value.includes(s)) onChange([...value, s]);
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

export default SkillTagInput;
