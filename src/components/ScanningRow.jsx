import './ScanningRow.css';

export default function ScanningRow() {
  return (
    <li className="scanning-row">
      <span className="scanning-row__rank">·</span>
      <div className="scanning-row__stamp">
        <div className="scanning-row__sweep" />
      </div>
      <div className="scanning-row__main">
        <span className="scanning-row__label">Leyendo expediente…</span>
        <div className="scanning-row__bar">
          <div className="scanning-row__bar-sweep" />
        </div>
      </div>
    </li>
  );
}
