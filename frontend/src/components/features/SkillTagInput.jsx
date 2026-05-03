import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

const SkillTagInput = ({ value, onChange }) => {
  const [input, setInput] = useState('');

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const skill = input.trim();
      if (!value.includes(skill)) onChange([...value, skill]);
      setInput('');
    }
  };

  const removeSkill = (skill) => onChange(value.filter(s => s !== skill));

  return (
    <div className="border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition min-h-[44px]">
      <div className="flex flex-wrap gap-2 mb-1">
        {value.map(skill => (
          <span key={skill} className="skill-tag">
            <Tag size={10} />
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-0.5">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={addSkill}
        placeholder={value.length === 0 ? 'Contoh: React, Node.js, Figma...' : 'Tambah skill lagi...'}
        className="w-full text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
      />
    </div>
  );
};

export default SkillTagInput;
