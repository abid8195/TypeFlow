import { testDurations } from '../data/words'

interface DurationSelectorProps {
  selected: number
  disabled?: boolean
  onChange: (value: number) => void
}

export function DurationSelector({ selected, disabled, onChange }: DurationSelectorProps) {
  return (
    <div>
      <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-2">
        Duration
      </p>
      <div className="flex gap-2 flex-wrap">
        {testDurations.map((d) => (
          <button
            key={d.value}
            onClick={() => !disabled && onChange(d.value)}
            disabled={disabled}
            className={`px-5 py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-200 min-h-[44px] border ${
              selected === d.value
                ? 'bg-[color:var(--color-accent)] text-[color:var(--color-background)] border-transparent shadow-lg shadow-[color:var(--color-accent)]/30'
                : 'bg-[color:var(--color-surface-secondary)] text-[color:var(--color-text-primary)] border-[color:var(--color-border)] hover:border-[color:var(--color-accent)]/40'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )
}
