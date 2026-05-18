import { TestResults } from '../hooks/useTypingTest'

interface ResultsModalProps {
  isOpen: boolean
  results: TestResults | null
  difficulty: string
  onClose: () => void
  onRetry: () => void
}

const PERF_LEVELS = [
  { min: 100, label: 'Lightning Fast', color: 'text-[color:var(--color-cta)]' },
  { min: 80,  label: 'Excellent',      color: 'text-[color:var(--color-cta)]' },
  { min: 60,  label: 'Great',          color: 'text-[color:var(--success)]' },
  { min: 40,  label: 'Good',           color: 'text-[color:var(--warning)]' },
  { min: 0,   label: 'Keep Practicing',color: 'text-[color:var(--muted)]' },
]

export function ResultsModal({ isOpen, results, difficulty, onClose, onRetry }: ResultsModalProps) {
  if (!isOpen || !results) return null

  const perf = PERF_LEVELS.find((l) => results.wpm >= l.min) ?? PERF_LEVELS.at(-1)!

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      style={{ background: 'var(--overlay)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[color:var(--panel)] shadow-2xl p-7 animate-[slide-up_0.25s_ease-out] max-h-[90svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <p className={`font-[family-name:var(--font-heading)] font-bold text-4xl mb-1 ${perf.color}`}>
            {perf.label}
          </p>
          <p className="text-[color:var(--muted)] text-sm">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} mode
          </p>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              label: 'WPM',
              value: Math.round(results.wpm),
              color: 'text-[color:var(--color-cta)]',
            },
            {
              label: 'Accuracy',
              value: `${results.accuracy.toFixed(1)}%`,
              color: results.accuracy < 80 ? 'text-[color:var(--error)]' : 'text-[color:var(--color-cta)]',
            },
            {
              label: 'Errors',
              value: results.errors,
              color: results.errors > 0 ? 'text-[color:var(--error)]' : 'text-[color:var(--success)]',
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-[color:var(--panel)] p-3 text-center border border-[color:var(--line)]">
              <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`font-[family-name:var(--font-heading)] font-bold text-2xl tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Detail rows */}
        <div className="rounded-xl bg-[color:var(--panel)] border border-[color:var(--line)] p-4 mb-6 space-y-2.5">
          {[
            { label: 'Duration',       value: `${results.duration}s` },
            { label: 'Correct chars',  value: results.correctChars },
            { label: 'Total chars',    value: results.totalChars },
          ].map((r) => (
            <div key={r.label} className="flex justify-between items-center text-sm">
              <span className="text-[color:var(--muted)]">{r.label}</span>
              <span className="font-medium text-[color:var(--ink)]">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[var(--radius-btn)] border border-[color:var(--line)] text-[color:var(--muted)] hover:text-[color:var(--ink)] transition-all duration-200 font-semibold text-sm min-h-[44px]"
          >
            Close
          </button>
          <button
            onClick={onRetry}
            style={{ background: 'var(--gradient-cta)', color: 'var(--paper)' }}
            className="flex-1 py-3 rounded-[var(--radius-btn)] font-bold text-sm transition-all duration-200 active:scale-[0.98] hover:opacity-90 min-h-[44px]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
