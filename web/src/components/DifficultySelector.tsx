import { DifficultyConfig } from '../data/words'

interface DifficultySelectorProps {
  selected: 'easy' | 'medium' | 'hard'
  difficulties: Record<string, DifficultyConfig>
  disabled?: boolean
  onChange: (value: 'easy' | 'medium' | 'hard') => void
}

type ActiveStyle = { background: string; color: string; borderColor: string; boxShadow: string }
type InactiveStyle = { background: string; color: string; borderColor: string }

const ACTIVE_STYLES: Record<string, ActiveStyle> = {
  easy:   { background: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)', borderColor: 'var(--success)',  boxShadow: '0 0 0 1px var(--success)' },
  medium: { background: 'color-mix(in srgb, var(--warning) 15%, transparent)', color: 'var(--warning)', borderColor: 'var(--warning)',  boxShadow: '0 0 0 1px var(--warning)' },
  hard:   { background: 'color-mix(in srgb, var(--error)   15%, transparent)', color: 'var(--error)',   borderColor: 'var(--error)',    boxShadow: '0 0 0 1px var(--error)' },
}

const INACTIVE_STYLE: InactiveStyle = {
  background: 'var(--glass)',
  color: 'var(--ink)',
  borderColor: 'var(--line)',
}

export function DifficultySelector({ selected, difficulties, disabled, onChange }: DifficultySelectorProps) {
  return (
    <div>
      <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-2">
        Difficulty
      </p>
      <div className="flex gap-2">
        {Object.values(difficulties).map((diff) => (
          <button
            key={diff.level}
            onClick={() => !disabled && onChange(diff.level as 'easy' | 'medium' | 'hard')}
            disabled={disabled}
            title={diff.description}
            className="px-4 py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-200 min-h-[44px] border flex-1"
            style={selected === diff.level ? ACTIVE_STYLES[diff.level] : INACTIVE_STYLE}
          >
            {diff.label}
          </button>
        ))}
      </div>
    </div>
  )
}
