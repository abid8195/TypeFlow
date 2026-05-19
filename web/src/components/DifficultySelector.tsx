import type { DifficultyConfig, DifficultyLevel } from '../data/words'

interface DifficultySelectorProps {
  selected:     DifficultyLevel
  difficulties: Record<string, DifficultyConfig>
  disabled?:    boolean
  onChange:     (value: DifficultyLevel) => void
}

/** Per-difficulty active style — semantic colour + matching glow ring. */
const ACTIVE: Record<DifficultyLevel, { border: string; color: string; background: string; boxShadow: string }> = {
  easy: {
    border:     '1px solid var(--success)',
    color:      'var(--success)',
    background: 'color-mix(in srgb, var(--success) 12%, transparent)',
    boxShadow:  '0 0 0 1px color-mix(in srgb, var(--success) 40%, transparent)',
  },
  medium: {
    border:     '1px solid var(--warning)',
    color:      'var(--warning)',
    background: 'color-mix(in srgb, var(--warning) 12%, transparent)',
    boxShadow:  '0 0 0 1px color-mix(in srgb, var(--warning) 40%, transparent)',
  },
  hard: {
    border:     '1px solid var(--error)',
    color:      'var(--error)',
    background: 'color-mix(in srgb, var(--error) 12%, transparent)',
    boxShadow:  '0 0 0 1px color-mix(in srgb, var(--error) 40%, transparent)',
  },
  quotes: {
    border:     '1px solid var(--color-cta-alt)',
    color:      'var(--color-cta-alt)',
    background: 'color-mix(in srgb, var(--color-cta-alt) 12%, transparent)',
    boxShadow:  '0 0 0 1px color-mix(in srgb, var(--color-cta-alt) 40%, transparent)',
  },
}

export function DifficultySelector({ selected, difficulties, disabled, onChange }: DifficultySelectorProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--muted)' }}>
        Difficulty
      </p>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(difficulties).map((diff) => {
          const active = selected === diff.level
          return (
            <button
              key={diff.level}
              onClick={() => !disabled && onChange(diff.level)}
              disabled={disabled}
              title={diff.description}
              className="py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-150 min-h-[44px] hover:scale-[1.03] active:scale-[0.97]"
              style={active ? ACTIVE[diff.level] : {
                background: 'transparent',
                color:      'var(--muted)',
                border:     '1px solid var(--line)',
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)' }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
            >
              {diff.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
