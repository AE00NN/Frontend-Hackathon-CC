import { useState } from 'react';
import './SkillsInput.css';

export default function SkillsInput({ value, onChange }) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const skill = draft.trim().toLowerCase();
    if (!skill) return;
    if (!value.includes(skill)) {
      onChange([...value, skill]);
    }
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeSkill(skill) {
    onChange(value.filter((s) => s !== skill));
  }

  return (
    <div className="skills-input">
      {value.map((skill) => (
        <span className="skill-chip" key={skill}>
          {skill}
          <button
            type="button"
            className="skill-chip__remove"
            onClick={() => removeSkill(skill)}
            aria-label={`Quitar habilidad ${skill}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        className="skills-input__field"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={value.length === 0 ? 'python, aws, docker…' : 'Agregar otra…'}
      />
    </div>
  );
}
