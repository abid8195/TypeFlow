import { formatTime } from '../utils/typing'

interface TimerProps {
  timeRemaining: number
  isActive: boolean
}

export function Timer({ timeRemaining, isActive }: TimerProps) {
  const isLow = timeRemaining <= 10 && isActive

  return (
    <div className="flex flex-col items-start">
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
        style={{ color: 'var(--muted)' }}
      >
        {isActive ? 'Time left' : 'Duration'}
      </p>
      <p
        className={`font-bold tabular-nums leading-none transition-colors duration-300 ${
          isLow ? 'animate-[pulse-subtle_0.8s_ease-in-out_infinite]' : ''
        }`}
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          color: isLow ? 'var(--error)' : 'var(--color-cta)',
        }}
      >
        {formatTime(timeRemaining)}
      </p>
    </div>
  )
}
