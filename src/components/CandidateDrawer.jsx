import { useEffect } from 'react';
import ScoreStamp from './ScoreStamp';
import './CandidateDrawer.css';

export default function CandidateDrawer({ candidate, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!candidate) return null;

  const { filename, cv_id, score, seniority, summary, strengths = [], gaps = [], soft_skills_note, confidence_flag } = candidate;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Expediente de ${filename}`}>
        <button type="button" className="drawer__close" onClick={onClose} aria-label="Cerrar expediente">×</button>

        <header className="drawer__header">
          <ScoreStamp score={score} size="lg" />
          <div className="drawer__heading">
            <span className="eyebrow">Expediente</span>
            <h2 className="drawer__filename">{filename}</h2>
            <span className="drawer__id">cv_id: {cv_id}</span>
          </div>
        </header>

        {confidence_flag && (
          <div className="drawer__notice">
            ⚠ El modelo marcó confianza baja en esta evaluación — revisa el CV manualmente antes de descartar.
          </div>
        )}

        <section className="drawer__section">
          <span className="eyebrow">Seniority</span>
          <p className="drawer__seniority">{seniority || 'No determinado'}</p>
        </section>

        <section className="drawer__section">
          <span className="eyebrow">Resumen</span>
          <p className="drawer__text">{summary || 'Sin resumen disponible.'}</p>
        </section>

        <div className="drawer__columns">
          <section className="drawer__section">
            <span className="eyebrow">Fortalezas</span>
            <ul className="drawer__list">
              {strengths.length > 0 ? strengths.map((s) => (
                <li key={s} className="drawer__list-item drawer__list-item--moss">{s}</li>
              )) : <li className="drawer__list-item drawer__list-item--empty">Sin datos</li>}
            </ul>
          </section>

          <section className="drawer__section">
            <span className="eyebrow">Gaps</span>
            <ul className="drawer__list">
              {gaps.length > 0 ? gaps.map((g) => (
                <li key={g} className="drawer__list-item drawer__list-item--clay">{g}</li>
              )) : <li className="drawer__list-item drawer__list-item--empty">Sin datos</li>}
            </ul>
          </section>
        </div>

        <section className="drawer__section">
          <span className="eyebrow">Nota de soft skills</span>
          <p className="drawer__text">{soft_skills_note || 'Sin observaciones.'}</p>
        </section>
      </aside>
    </div>
  );
}
