interface StatsPanelProps {
  wpm: number
  accuracy: number
  errors: number
  isTestActive: boolean
  compact?: boolean   // true = horizontal strip, false = 3 full cards (results view)
}

export function StatsPanel({ wpm, accuracy, errors, isTestActive, compact }: StatsPanelProps) {
  const accuracyColor =
    !isTestActive      ? 'var(--muted)'   :
    accuracy >= 95     ? 'var(--success)' :
    accuracy >= 80     ? 'var(--warning)' : 'var(--error)'

  const errorsColor = errors === 0 ? 'var(--success)' : 'var(--error)'

  if (compact) {
    return (
      <div className="flex items-center gap-5 sm:gap-6">
        <CompactStat label="WPM" value={wpm} color={isTestActive ? 'var(--color-cta)' : 'var(--muted)'} />
        <CompactStat label="Acc" value={`${accuracy.toFixed(0)}%`} color={accuracyColor} />
        <CompactStat label="Err" value={errors} color={errorsColor} />
      </div>
    )
  }

  return (
    <div className="w-full grid grid-cols-3 gap-3">
      <StatCard label="WPM"      value={wpm}                      color={isTestActive ? 'var(--color-cta)' : 'var(--muted)'} active={isTestActive} />
      <StatCard label="Accuracy" value={`${accuracy.toFixed(1)}%`} color={accuracyColor} active={isTestActive} />
      <StatCard label="Errors"   value={errors}                   color={errorsColor}    active={isTestActive} />
    </div>
  )
}

function CompactStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p
        className="font-[family-name:var(--font-heading)] font-bold text-xl tabular-nums leading-none transition-colors duration-300"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  )
}

function StatCard({ label, value, color, active }: { label: string; value: number | string; color: string; active: boolean }) {
  return (
    <div
      className="rounded-[var(--radius-card)] p-4 text-center transition-all duration-300"
      style={{
        background: 'var(--panel)',
        border: `1px solid ${active ? 'color-mix(in srgb, var(--color-cta) 18%, var(--line))' : 'var(--line)'}`,
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p
        className="font-[family-name:var(--font-heading)] font-bold text-3xl tabular-nums transition-colors duration-300"
        style={{ color }}
      >
        {value}
      </p>
    </div>
  )
}
