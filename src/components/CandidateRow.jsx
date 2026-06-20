import ScoreStamp from './ScoreStamp';
import './CandidateRow.css';

export default function CandidateRow({ rank, candidate, onOpen }) {
  const { filename, score, status, strengths = [], gaps = [], confidence_flag } = candidate;
  const failed = status === 'failed';

  return (
    <li
      className={`candidate-row ${failed ? 'candidate-row--failed' : ''}`}
      onClick={() => !failed && onOpen(candidate)}
      role={failed ? undefined : 'button'}
      tabIndex={failed ? -1 : 0}
      onKeyDown={(e) => {
        if (!failed && (e.key === 'Enter' || e.key === ' ')) onOpen(candidate);
      }}
    >
      <span className="candidate-row__rank">{rank}</span>

      {failed ? (
        <div className="candidate-row__stamp-slot">
          <span className="candidate-row__failed-mark">✕</span>
        </div>
      ) : (
        <ScoreStamp score={score} />
      )}

      <div className="candidate-row__main">
        <span className="candidate-row__filename">{filename}</span>
        {failed ? (
          <span className="candidate-row__failed-text">No se pudo evaluar este CV (revisa el archivo).</span>
        ) : (
          <div className="candidate-row__tags">
            {strengths.slice(0, 2).map((s) => (
              <span className="tag tag--moss" key={s}>{s}</span>
            ))}
            {gaps.slice(0, 1).map((g) => (
              <span className="tag tag--clay" key={g}>{g}</span>
            ))}
            {confidence_flag && (
              <span className="tag tag--ghost">⚠ confianza baja</span>
            )}
          </div>
        )}
      </div>

      {!failed && <span className="candidate-row__chevron">›</span>}
    </li>
  );
}
