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
            className="px-5 py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-200 min-h-[44px] border"
            style={
              selected === d.value
                ? { background: 'var(--color-cta)', color: 'var(--paper)', borderColor: 'transparent', boxShadow: 'var(--shadow-cta)' }
                : { background: 'var(--glass)', color: 'var(--ink)', borderColor: 'var(--line)' }
            }
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  )
}
