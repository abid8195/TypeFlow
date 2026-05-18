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
        cssColor={isTestActive ? 'var(--color-cta)' : 'var(--muted)'}
        active={isTestActive}
      />
      <StatCard
        label="Accuracy"
        value={`${accuracy.toFixed(1)}%`}
        cssColor={accuracy < 80 && isTestActive ? 'var(--error)' : isTestActive ? 'var(--color-cta)' : 'var(--muted)'}
        active={isTestActive}
      />
      <StatCard
        label="Errors"
        value={errors.toString()}
        cssColor={errors > 0 ? 'var(--error)' : 'var(--success)'}
        active={isTestActive}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  cssColor,
  active,
}: {
  label: string
  value: string
  cssColor: string
  active: boolean
}) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-3 sm:p-4 text-center border transition-all duration-300 bg-[var(--glass)] backdrop-blur-sm"
      style={{ borderColor: active ? 'color-mix(in srgb, var(--color-cta) 20%, transparent)' : 'var(--line)' }}
    >
      <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className="font-[family-name:var(--font-heading)] font-bold text-2xl sm:text-3xl tabular-nums"
        style={{ color: cssColor }}
      >
        {value}
      </p>
    </div>
  )
}
