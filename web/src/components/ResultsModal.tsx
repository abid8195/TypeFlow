import { useState } from 'react'
import type { TestResults } from '../App'
import type { DifficultyLevel } from '../data/words'

interface ResultsModalProps {
  isOpen:     boolean
  results:    TestResults | null
  difficulty: DifficultyLevel
  onClose:    () => void
  onRetry:    () => void
}

const PERF_LEVELS = [
  { min: 100, label: 'Lightning ⚡', color: 'var(--color-cta)'  },
  { min: 80,  label: 'Excellent',    color: 'var(--color-cta)'  },
  { min: 60,  label: 'Great',        color: 'var(--success)'    },
  { min: 40,  label: 'Good',         color: 'var(--warning)'    },
  { min: 0,   label: 'Keep Going',   color: 'var(--muted)'      },
]

export function ResultsModal({ isOpen, results, difficulty, onClose, onRetry }: ResultsModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !results) return null

  const wpm      = Math.round(results.wpm)
  const perf     = PERF_LEVELS.find((l) => wpm >= l.min) ?? PERF_LEVELS.at(-1)!
  const delta    = wpm - results.prevBestWPM
  const isNewBest = wpm >= results.prevBestWPM && results.prevBestWPM > 0

  const handleShare = async () => {
    const lines = [
      `TypeFlow · ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} · ${results.duration}s`,
      '─'.repeat(26),
      `WPM       ${wpm}${isNewBest ? '  🏆 new best' : ''}`,
      `Accuracy  ${results.accuracy.toFixed(1)}%`,
      `Errors    ${results.errors}`,
      '─'.repeat(26),
      'typeflow.freeappstore.online',
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — fail silently
    }
  }

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
          {/* Mobile drag handle */}
          <div className="flex justify-center mb-5 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
          </div>

          {/* Performance label */}
          <div className="text-center mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} · {results.duration}s
            </p>
            <p className="font-bold text-3xl" style={{ fontFamily: "'Fraunces', Georgia, serif", color: perf.color }}>
              {perf.label}
            </p>
          </div>

          {/* Big WPM */}
          <div
            className="rounded-[var(--radius-card)] p-5 text-center mb-4"
            style={{ background: 'color-mix(in srgb, var(--color-cta) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-cta) 22%, transparent)' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-cta)' }}>
              Words per minute
            </p>
            <p className="font-bold tabular-nums leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '4.5rem', color: 'var(--color-cta)' }}>
              {wpm}
            </p>
            {/* Personal best delta */}
            {results.prevBestWPM > 0 && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: delta >= 0 ? 'var(--success)' : 'var(--warning)' }}>
                {delta >= 0 ? `+${delta}` : delta} WPM {delta >= 0 ? 'above' : 'from'} your best
                {isNewBest && ' 🏆'}
              </p>
            )}
          </div>

          {/* WPM sparkline */}
          {results.wpmSamples.length >= 4 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
                WPM over time
              </p>
              <WpmSparkline samples={results.wpmSamples} />
            </div>
          )}

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
          <div className="rounded-[var(--radius-btn)] p-4 mb-5 space-y-2" style={{ background: 'color-mix(in srgb, var(--ink) 4%, transparent)', border: '1px solid var(--line)' }}>
            {([
              ['Correct chars', String(results.correctChars)],
              ['Total chars',   String(results.totalChars)],
            ] as const).map(([label, value]) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="font-medium tabular-nums" style={{ color: 'var(--ink)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-[var(--radius-btn)] font-semibold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.97] min-h-[44px]"
              style={{ border: '1px solid var(--line)', color: copied ? 'var(--success)' : 'var(--muted)', background: 'transparent' }}
            >
              {copied ? '✓ Copied!' : 'Share result'}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[var(--radius-btn)] p-4 text-center" style={{ background: 'color-mix(in srgb, var(--ink) 4%, transparent)', border: '1px solid var(--line)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="font-bold text-2xl tabular-nums" style={{ fontFamily: "'Fraunces', Georgia, serif", color }}>{value}</p>
    </div>
  )
}

/** Pure-SVG WPM-over-time sparkline — no external libraries. */
function WpmSparkline({ samples }: { samples: number[] }) {
  // Downsample to max 60 points for readability
  const data = samples.length > 60
    ? samples.filter((_, i) => i % Math.ceil(samples.length / 60) === 0)
    : samples

  const W = 400, H = 56
  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - 4 - ((v - min) / range) * (H - 12)}`)
    .join(' ')

  const areaEnd = `${W},${H} 0,${H}`

  return (
    <div className="rounded-[var(--radius-btn)] overflow-hidden" style={{ background: 'color-mix(in srgb, var(--ink) 3%, transparent)', border: '1px solid var(--line)' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 56 }} aria-hidden>
        {/* Filled area */}
        <polyline
          points={`${pts} ${areaEnd}`}
          fill="color-mix(in srgb, var(--color-cta) 10%, transparent)"
          stroke="none"
        />
        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke="var(--color-cta)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
