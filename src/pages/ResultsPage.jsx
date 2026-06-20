import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CandidateRow from '../components/CandidateRow';
import ScanningRow from '../components/ScanningRow';
import CandidateDrawer from '../components/CandidateDrawer';
import { getJobResults, ApiError } from '../api';
import './ResultsPage.css';

const POLL_INTERVAL_MS = 3000;

export default function ResultsPage() {
  const { jobId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const result = await getJobResults(jobId);
        if (cancelled) return;

        setData(result);
        setError(null);

        const cvCount = result.job?.cv_count ?? 0;
        const done = cvCount > 0 && result.total >= cvCount;

        if (!done) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'No pudimos conectar con el servidor.');
        if (!(err instanceof ApiError && err.status === 404)) {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
    };
  }, [jobId]);

  if (error && !data) {
    return (
      <div className="results-page results-page--center">
        <div className="results-page__error-card">
          <span className="eyebrow">Error</span>
          <p>{error}</p>
          <Link to="/" className="results-page__back-link">← Crear otra vacante</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="results-page results-page--center">
        <p className="results-page__loading">Abriendo expediente de la vacante…</p>
      </div>
    );
  }

  const { job, results, total } = data;
  const cvCount = job?.cv_count ?? total;
  const pendingSlots = Math.max(0, cvCount - results.length);
  const sorted = [...results].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="results-page">
      <header className="results-header">
        <Link to="/" className="results-header__back">← Nueva vacante</Link>
        <span className="eyebrow">Vacante</span>
        <h1 className="results-header__title">{job?.job_title}</h1>

        <div className="results-header__meta">
          {(job?.required_skills || []).map((s) => (
            <span className="tag tag--ghost" key={s}>{s}</span>
          ))}
          <span className="results-header__years">{job?.years_experience}+ años</span>
        </div>

        <div className="results-header__counter">
          <span className="results-header__counter-number">{total}</span>
          <span className="results-header__counter-slash">/</span>
          <span>{cvCount}</span>
          <span className="results-header__counter-label">
            {total >= cvCount ? 'evaluados' : 'procesados — el ranking se actualiza solo'}
          </span>
        </div>
      </header>

      <div className="manifest">
        <ul className="manifest__list">
          {sorted.map((candidate, i) => (
            <CandidateRow
              key={candidate.cv_id}
              rank={i + 1}
              candidate={candidate}
              onOpen={setSelected}
            />
          ))}
          {Array.from({ length: pendingSlots }).map((_, i) => (
            <ScanningRow key={`pending-${i}`} />
          ))}
        </ul>
      </div>

      {error && <p className="results-page__inline-error">{error}</p>}

      <CandidateDrawer candidate={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
