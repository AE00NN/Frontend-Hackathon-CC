const API_BASE = 'https://sf0vznhkrl.execute-api.us-east-1.amazonaws.com';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/**
 * POST /jobs — crea la vacante y reserva las presigned URLs de subida.
 * body: { job_title, required_skills, years_experience, cv_count }
 * 201 -> { job_id, upload_urls: [{cv_id, presigned_url, s3_key}], expires_in_seconds }
 */
export async function createJob({ jobTitle, requiredSkills, yearsExperience, cvCount }) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_title: jobTitle,
      required_skills: requiredSkills,
      years_experience: yearsExperience,
      cv_count: cvCount,
    }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new ApiError(data?.message || `No se pudo crear la vacante (${res.status})`, res.status);
  }

  return data;
}

/**
 * PUT directo al presigned_url de S3. Requiere Content-Type: application/pdf exacto.
 * Usamos XHR (no fetch) para poder reportar progreso de subida.
 */
export function uploadCvToS3(presignedUrl, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presignedUrl);
    xhr.setRequestHeader('Content-Type', 'application/pdf');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new ApiError(`S3 rechazó la subida (${xhr.status})`, xhr.status));
      }
    };

    xhr.onerror = () => reject(new ApiError('Error de red subiendo el archivo a S3', 0));

    xhr.send(file);
  });
}

/**
 * GET /jobs/{id}/results — estado del job + ranking parcial/total.
 * 200 -> { job: {...}, results: [...], total }
 * 404 -> job no existe
 */
export async function getJobResults(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/results`);
  const data = await parseJsonSafe(res);

  if (res.status === 404) {
    throw new ApiError('No encontramos esta vacante.', 404);
  }
  if (!res.ok) {
    throw new ApiError(data?.message || `Error consultando resultados (${res.status})`, res.status);
  }

  return data;
}

export { ApiError };
