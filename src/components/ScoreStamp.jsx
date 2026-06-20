import './ScoreStamp.css';

function tierFor(score) {
  if (score >= 75) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

export default function ScoreStamp({ score, size = 'md' }) {
  const tier = tierFor(score);
  return (
    <div className={`score-stamp score-stamp--${tier} score-stamp--${size}`}>
      <span className="score-stamp__number">{score}</span>
    </div>
  );
}
