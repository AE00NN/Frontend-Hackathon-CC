import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SkillsInput from '../components/SkillsInput';
import FileDropzone from '../components/FileDropzone';
import { createJob, uploadCvToS3, ApiError } from '../api';
import './JobFormPage.css';

const STAGE = {
  IDLE: 'idle',
  CREATING: 'creating',
  UPLOADING: 'uploading',
  ERROR: 'error',
};

export default function JobFormPage() {
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState([]);
  const [years, setYears] = useState(2);
  const [files, setFiles] = useState([]);
  const [progressById, setProgressById] = useState({});
  const [stage, setStage] = useState(STAGE.IDLE);
  const [errorMsg, setErrorMsg] = useState('');

  const busy = stage === STAGE.CREATING || stage === STAGE.UPLOADING;

  const canSubmit = jobTitle.trim().length > 0 && skills.length > 0 && files.length > 0 && !busy;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg('');
    setStage(STAGE.CREATING);

    try {
      const job = await createJob({
        jobTitle: jobTitle.trim(),
        requiredSkills: skills,
        yearsExperience: Number(years),
        cvCount: files.length,
      });

      if (!job?.upload_urls || job.upload_urls.length !== files.length) {
        throw new ApiError('La cantidad de URLs de subida no coincide con los archivos enviados.', 0);
      }

      setStage(STAGE.UPLOADING);

      const uploads = job.upload_urls.map((slot, index) =>
        uploadCvToS3(slot.presigned_url, files[index], (pct) => {
          setProgressById((prev) => ({ ...prev, [index]: pct }));
        }).catch((err) => ({ failed: true, filename: files[index].name, err }))
      );

      const results = await Promise.all(uploads);
      const failures = results.filter((r) => r && r.failed);

      if (failures.length === files.length) {
        throw new ApiError('Ningún archivo se pudo subir. Revisa tu conexión e inténtalo otra vez.', 0);
      }

      if (failures.length > 0) {
        setErrorMsg(
          `${failures.length} archivo(s) no se subieron correctamente, pero continuamos con el resto: ${failures
            .map((f) => f.filename)
            .join(', ')}`
        );
      }

      navigate(`/jobs/${job.job_id}`);
    } catch (err) {
      setStage(STAGE.ERROR);
      setErrorMsg(err instanceof ApiError ? err.message : 'Algo salió mal. Inténtalo de nuevo.');
    }
  }

  return (
    <div className="job-form-page">
      <div className="job-form-page__inner">
        <span className="eyebrow">Paso 1 de 2 — Nueva vacante</span>
        <h1 className="job-form-page__title">
          Describe el puesto.<br />Sube los CVs.<br />Te traemos el ranking.
        </h1>
        <p className="job-form-page__subtitle">
          Cada candidato se evalúa contra los requisitos que definas aquí — fortalezas, gaps y seniority, en minutos.
        </p>

        <form className="job-card" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Título del puesto</span>
            <input
              type="text"
              className="field__input"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="ej. Backend Developer"
              disabled={busy}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Skills requeridas</span>
            <SkillsInput value={skills} onChange={setSkills} />
            <span className="field__hint">Enter o coma para agregar cada una</span>
          </label>

          <label className="field field--years">
            <span className="field__label">Años de experiencia</span>
            <div className="years-stepper">
              <button
                type="button"
                onClick={() => setYears((y) => Math.max(0, y - 1))}
                disabled={busy}
                aria-label="Restar año"
              >
                −
              </button>
              <span className="years-stepper__value">{years}</span>
              <button
                type="button"
                onClick={() => setYears((y) => y + 1)}
                disabled={busy}
                aria-label="Sumar año"
              >
                +
              </button>
            </div>
          </label>

          <div className="field">
            <span className="field__label">
              CVs en PDF {files.length > 0 && <span className="field__count">· {files.length}</span>}
            </span>
            <FileDropzone
              files={files}
              onChange={setFiles}
              disabled={busy}
              progressById={stage === STAGE.UPLOADING ? progressById : undefined}
            />
          </div>

          {errorMsg && <p className="job-form-page__error">{errorMsg}</p>}

          <button type="submit" className="submit-btn" disabled={!canSubmit}>
            {stage === STAGE.CREATING && 'Creando vacante…'}
            {stage === STAGE.UPLOADING && 'Subiendo expedientes…'}
            {(stage === STAGE.IDLE || stage === STAGE.ERROR) && 'Enviar a evaluación'}
          </button>
        </form>
      </div>
    </div>
  );
}
