import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JobFormPage from './pages/JobFormPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobFormPage />} />
        <Route path="/jobs/:jobId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
