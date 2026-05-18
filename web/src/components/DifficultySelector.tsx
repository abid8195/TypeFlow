import { DifficultyConfig } from '../data/words'

interface DifficultySelectorProps {
  selected: 'easy' | 'medium' | 'hard'
  difficulties: Record<string, DifficultyConfig>
  disabled?: boolean
  onChange: (value: 'easy' | 'medium' | 'hard') => void
}

const BADGE_COLORS: Record<string, string> = {
  easy: 'bg-[color:var(--color-success)]/20 text-[color:var(--color-success)] border-[color:var(--color-success)]/30',
  medium: 'bg-[color:var(--color-warning)]/20 text-[color:var(--color-warning)] border-[color:var(--color-warning)]/30',
  hard: 'bg-[color:var(--color-error)]/20 text-[color:var(--color-error)] border-[color:var(--color-error)]/30',
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
            className={`px-4 py-2.5 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-200 min-h-[44px] border flex-1 ${
              selected === diff.level
                ? `${BADGE_COLORS[diff.level]} shadow-lg`
                : 'bg-[color:var(--color-surface-secondary)] text-[color:var(--color-text-primary)] border-[color:var(--color-border)] hover:border-[color:var(--color-border)]'
            }`}
          >
            {diff.label}
          </button>
        ))}
      </div>
    </div>
  )
}
