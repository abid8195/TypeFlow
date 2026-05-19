import { TestResults } from '../hooks/useTypingTest'

interface ResultsModalProps {
  isOpen: boolean
  results: TestResults | null
  difficulty: string
  onClose: () => void
  onRetry: () => void
}

const PERF_LEVELS = [
  { min: 100, label: 'Lightning ⚡', color: 'var(--color-cta)' },
  { min: 80,  label: 'Excellent',    color: 'var(--color-cta)' },
  { min: 60,  label: 'Great',        color: 'var(--success)' },
  { min: 40,  label: 'Good',         color: 'var(--warning)' },
  { min: 0,   label: 'Keep Going',   color: 'var(--muted)' },
]

export function ResultsModal({ isOpen, results, difficulty, onClose, onRetry }: ResultsModalProps) {
  if (!isOpen || !results) return null

  const perf = PERF_LEVELS.find((l) => results.wpm >= l.min) ?? PERF_LEVELS.at(-1)!
  const wpm  = Math.round(results.wpm)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fade-in_0.2s_ease-out]"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[92svh] overflow-y-auto"
        style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Drag handle on mobile */}
          <div className="flex justify-center mb-5 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
          </div>

          {/* Performance label */}
          <div className="text-center mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} mode
            </p>
            <p
              className="font-bold text-3xl mb-1"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: perf.color }}
            >
              {perf.label}
            </p>
          </div>

          {/* Big WPM */}
          <div
            className="rounded-[var(--radius-card)] p-6 text-center mb-4"
            style={{ background: 'color-mix(in srgb, var(--color-cta) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-cta) 20%, transparent)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-cta)' }}>
              Words per minute
            </p>
            <p
              className="font-bold tabular-nums leading-none"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '4.5rem', color: 'var(--color-cta)' }}
            >
              {wpm}
            </p>
          </div>

          {/* Accuracy + Errors */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <ResultStat
              label="Accuracy"
              value={`${results.accuracy.toFixed(1)}%`}
              color={results.accuracy >= 95 ? 'var(--success)' : results.accuracy >= 80 ? 'var(--warning)' : 'var(--error)'}
            />
            <ResultStat
              label="Errors"
              value={String(results.errors)}
              color={results.errors === 0 ? 'var(--success)' : 'var(--error)'}
            />
          </div>

          {/* Detail rows */}
          <div
            className="rounded-[var(--radius-btn)] p-4 mb-6 space-y-2"
            style={{ background: 'color-mix(in srgb, var(--ink) 4%, transparent)', border: '1px solid var(--line)' }}
          >
            {[
              { label: 'Duration',       value: `${results.duration}s` },
              { label: 'Correct chars',  value: String(results.correctChars) },
              { label: 'Total chars',    value: String(results.totalChars) },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--ink)' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] min-h-[44px]"
              style={{ border: '1px solid var(--line)', color: 'var(--muted)', background: 'transparent' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
            >
              Close
            </button>
            <button
              onClick={onRetry}
              className="flex-1 py-3 rounded-[var(--radius-btn)] font-bold text-sm transition-all duration-150 hover:opacity-90 hover:scale-[1.02] active:scale-[0.97] min-h-[44px]"
              style={{ background: 'var(--gradient-cta)', color: 'var(--paper)', boxShadow: 'var(--shadow-cta)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-[var(--radius-btn)] p-4 text-center"
      style={{ background: 'color-mix(in srgb, var(--ink) 4%, transparent)', border: '1px solid var(--line)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p className="font-bold text-2xl tabular-nums" style={{ fontFamily: "'Fraunces', Georgia, serif", color }}>
        {value}
      </p>
    </div>
  )
}
