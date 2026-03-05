import { useGame } from '../store/gameStore';

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   emoji: '🌱', desc: 'Bot plays randomly' },
  { value: 'medium', label: 'Medium', emoji: '🔥', desc: 'Bot blocks & attacks' },
  { value: 'hard',   label: 'Hard',   emoji: '💀', desc: 'Bot never loses' },
];

export default function DifficultySelector({ disabled }) {
  const { difficulty, setDifficulty } = useGame();

  return (
    <div className="difficulty-selector">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.value}
          className={`difficulty-btn ${difficulty === d.value ? 'difficulty-active' : ''}`}
          onClick={() => setDifficulty(d.value)}
          disabled={disabled}
          title={d.desc}
        >
          <span className="difficulty-emoji">{d.emoji}</span>
          <span className="difficulty-label">{d.label}</span>
        </button>
      ))}
    </div>
  );
}
