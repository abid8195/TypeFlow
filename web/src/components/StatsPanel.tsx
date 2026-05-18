interface StatsPanelProps {
  wpm: number
  accuracy: number
  errors: number
  isTestActive: boolean
}

export function StatsPanel({ wpm, accuracy, errors, isTestActive }: StatsPanelProps) {
  return (
    <div className="w-full grid grid-cols-3 gap-2 sm:gap-3">
      <StatCard
        label="WPM"
        value={wpm.toString()}
        color={isTestActive ? 'accent' : 'muted'}
        active={isTestActive}
      />
      <StatCard
        label="Accuracy"
        value={`${accuracy.toFixed(1)}%`}
        color={accuracy < 80 && isTestActive ? 'error' : isTestActive ? 'accent' : 'muted'}
        active={isTestActive}
      />
      <StatCard
        label="Errors"
        value={errors.toString()}
        color={errors > 0 ? 'error' : 'success'}
        active={isTestActive}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  active,
}: {
  label: string
  value: string
  color: 'accent' | 'muted' | 'error' | 'success'
  active: boolean
}) {
  const colorClass = {
    accent: 'text-[color:var(--color-accent)]',
    muted: 'text-[color:var(--muted)]',
    error: 'text-[color:var(--color-error)]',
    success: 'text-[color:var(--color-success)]',
  }[color]

  return (
    <div
      className={`rounded-[var(--radius-card)] p-3 sm:p-4 text-center border transition-all duration-300 bg-[var(--glass)] backdrop-blur-sm ${
        active
          ? 'border-[color:var(--color-accent)]/20 shadow-sm shadow-[color:var(--color-accent)]/5'
          : 'border-[color:var(--line)]'
      }`}
    >
      <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className={`font-[family-name:var(--font-heading)] font-bold text-2xl sm:text-3xl tabular-nums ${colorClass}`}>
        {value}
      </p>
    </div>
  )
}
