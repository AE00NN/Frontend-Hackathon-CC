import { useRef, useState } from 'react';
import './FileDropzone.css';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({ files, onChange, disabled, progressById }) {
  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState([]);
  const inputRef = useRef(null);

  function addFiles(fileList) {
    const incoming = Array.from(fileList);
    const valid = [];
    const bad = [];

    incoming.forEach((file) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        valid.push(file);
      } else {
        bad.push(file.name);
      }
    });

    setRejected(bad);

    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const deduped = valid.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

    if (deduped.length > 0) {
      onChange([...files, ...deduped]);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        className={`dropzone ${isDragging ? 'dropzone--active' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click();
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6M9 15l3-3 3 3" />
        </svg>
        <p className="dropzone__title">Arrastra los CVs en PDF aquí</p>
        <p className="dropzone__hint">o haz clic para buscarlos en tu equipo · solo .pdf</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          disabled={disabled}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {rejected.length > 0 && (
        <p className="dropzone__error">
          Se ignoraron {rejected.length} archivo(s) que no son PDF: {rejected.join(', ')}
        </p>
      )}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => {
            const progress = progressById?.[i];
            return (
              <li className="file-list__item" key={`${file.name}-${file.size}`}>
                <span className="file-list__icon">PDF</span>
                <div className="file-list__meta">
                  <span className="file-list__name">{file.name}</span>
                  <span className="file-list__size">{formatSize(file.size)}</span>
                  {progress !== undefined && (
                    <div className="file-list__progress-track">
                      <div
                        className={`file-list__progress-fill ${progress === 100 ? 'is-done' : ''}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
                {!disabled && (
                  <button
                    type="button"
                    className="file-list__remove"
                    onClick={() => removeFile(i)}
                    aria-label={`Quitar ${file.name}`}
                  >
                    ×
                  </button>
                )}
                {progress === 100 && <span className="file-list__check">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
