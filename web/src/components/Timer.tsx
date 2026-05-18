import { formatTime } from '../utils/typing'

interface TimerProps {
  timeRemaining: number
  isActive: boolean
}

export function Timer({ timeRemaining, isActive }: TimerProps) {
  const isLow = timeRemaining <= 10 && isActive

  return (
    <div className="text-center">
      <p className="text-[color:var(--muted)] text-xs font-semibold uppercase tracking-widest mb-1">
        {isActive ? 'Remaining' : 'Duration'}
      </p>
      <p
        className={`font-[family-name:var(--font-heading)] font-bold tabular-nums transition-colors duration-300 ${
          isLow ? 'text-6xl sm:text-7xl animate-[pulse-subtle_1s_ease-in-out_infinite]' : 'text-5xl sm:text-6xl'
        }`}
        style={{ color: isLow ? 'var(--error)' : 'var(--color-cta)' }}
      >
        {formatTime(timeRemaining)}
      </p>
    </div>
  )
}
