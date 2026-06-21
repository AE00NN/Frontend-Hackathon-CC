# Evaluador de CVs — Frontend

Frontend hecho en React + Vite para subir CVs en PDF y ver el ranking de candidatos que evalúa el backend (con Groq).

No tiene backend propio, solo le pega a una API ya desplegada en AWS.

## Cómo correrlo

```bash
npm install
npm run dev
```

Y entras a `http://localhost:5173`.

Otros comandos:
```bash
npm run build      # build de producción
npm run preview    # prueba el build local
npm run lint        # eslint
```

## Estructura

```
src/
  api.js                       acá están los 3 endpoints del backend
  App.jsx                      rutas
  pages/
    JobFormPage.jsx / .css     formulario + carga de PDFs
    ResultsPage.jsx / .css     polling + ranking + detalle
  components/
    SkillsInput.jsx            tags de skills
    FileDropzone.jsx           drag & drop de PDFs
    ScoreStamp.jsx             el "sello" con el score
    CandidateRow.jsx           fila de un candidato ya evaluado
    ScanningRow.jsx            fila de "todavía procesando"
    CandidateDrawer.jsx        panel lateral con el detalle del candidato
```

## La URL de la API

Está hardcodeada en `src/api.js`, primera línea:

```js
const API_BASE = 'https://sf0vznhkrl.execute-api.us-east-1.amazonaws.com';
```

Si cambia el stage (dev/prod), hay que editarla a mano y volver a buildear. Nada de `.env` por ahora.

## Endpoints que usa

- `POST /jobs` → crea la vacante, devuelve `job_id` + una presigned URL por CV.
- `PUT` a cada presigned URL → sube el PDF a S3 (necesita el header `Content-Type: application/pdf` sí o sí).
- `GET /jobs/{id}/results` → polling cada 3s hasta que `total === cv_count`.

Los detalles de cada request/response están comentados en `api.js`.

## Cosas a tener en cuenta

- Asumo que el orden de `upload_urls` que devuelve `POST /jobs` coincide con el orden en que mandé los archivos, porque la respuesta no trae el nombre del archivo. Si el backend no garantiza eso, hay que ajustar.
- Si un PDF falla al subir, sigue con los demás igual (te avisa cuál falló).
- Si el polling falla por red reintenta solo, pero si el job no existe (404) para y muestra error.

## Deploy

**Amplify:** conectas el repo en la consola de Amplify, build command `npm run build`, output `dist`. Listo.

**S3 + CloudFront:**
```bash
npm run build
aws s3 sync dist/ s3://TU-BUCKET --delete
```
Ojo: hay que configurar que los 404 redirijan a `index.html`, porque es una SPA con rutas (`/jobs/:jobId`) y si no se rompe al refrescar.
