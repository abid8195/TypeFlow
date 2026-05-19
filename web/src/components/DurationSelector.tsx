import { testDurations } from '../data/words'

interface DurationSelectorProps {
  selected: number
  disabled?: boolean
  onChange: (value: number) => void
}

export function DurationSelector({ selected, disabled, onChange }: DurationSelectorProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--muted)' }}>
        Duration
      </p>
      <div className="flex gap-2">
        {testDurations.map((d) => {
          const active = selected === d.value
          return (
            <button
              key={d.value}
              onClick={() => !disabled && onChange(d.value)}
              disabled={disabled}
              className="flex-1 py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-150 min-h-[44px] hover:scale-[1.03] active:scale-[0.97]"
              style={active ? {
                background: 'var(--color-cta)',
                color: 'var(--paper)',
                border: '1px solid transparent',
                boxShadow: 'var(--shadow-cta)',
              } : {
                background: 'transparent',
                color: 'var(--muted)',
                border: '1px solid var(--line)',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'
              }}
            >
              {d.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
