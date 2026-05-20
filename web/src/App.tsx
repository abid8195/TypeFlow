import { useEffect, useState, useRef, useCallback } from 'react'
import { Navbar }             from './components/Navbar'
import { TypingArea }         from './components/TypingArea'
import { Timer }              from './components/Timer'
import { StatsPanel }         from './components/StatsPanel'
import { DurationSelector }   from './components/DurationSelector'
import { DifficultySelector } from './components/DifficultySelector'
import { ResultsModal }       from './components/ResultsModal'
import { SettingsModal }      from './components/SettingsModal'
import { Footer }             from './components/Footer'
import { useSettings, useStats } from './hooks/usePersistence'
import { useSound }           from './hooks/useSound'
import { difficulties, type DifficultyLevel } from './data/words'
import {
  generateWords,
  generateQuoteWords,
  calculateAccuracy,
  WORD_BUFFER_SIZE,
  MIN_ELAPSED_MINS,
  STATS_INTERVAL_MS,
} from './utils/typing'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Whether each completed word was correct, incorrect, or skipped. */
export type WordOutcome = 'correct' | 'incorrect' | 'skipped'

interface TestState {
  isActive:         boolean
  testWords:        string[]
  userInput:        string
  currentWordIndex: number
  startTime:        number | null
  wpm:              number
  accuracy:         number
  errors:           number
  correctChars:     number
  wordOutcomes:     WordOutcome[]
  combo:            number   // consecutive correct words
}

export interface TestResults {
  wpm:          number
  accuracy:     number
  errors:       number
  correctChars: number
  totalChars:   number
  duration:     number
  wpmSamples:   number[]
  prevBestWPM:  number
}

// ─── Levels ───────────────────────────────────────────────────────────────────

export interface TypingLevel {
  min:   number
  label: string
  emoji: string
  color: string
}

export const TYPING_LEVELS: TypingLevel[] = [
  { min: 160, label: 'Legend',       emoji: '🔮', color: 'var(--color-cta-alt)' },
  { min: 130, label: 'Master',       emoji: '💎', color: 'var(--color-cta)'     },
  { min: 100, label: 'Expert',       emoji: '⚡', color: '#22d3ee'              },
  { min: 75,  label: 'Advanced',     emoji: '🔥', color: 'var(--success)'       },
  { min: 50,  label: 'Proficient',   emoji: '🚀', color: 'var(--success)'       },
  { min: 30,  label: 'Novice',       emoji: '📈', color: 'var(--warning)'       },
  { min: 0,   label: 'Beginner',     emoji: '🌱', color: 'var(--muted)'         },
]

export function getLevelForWPM(wpm: number): TypingLevel {
  return TYPING_LEVELS.find((l) => wpm >= l.min) ?? TYPING_LEVELS[TYPING_LEVELS.length - 1]
}

export function getNextLevel(wpm: number): TypingLevel | null {
  const idx = TYPING_LEVELS.findIndex((l) => wpm >= l.min)
  return idx > 0 ? TYPING_LEVELS[idx - 1] : null
}

// ─── PWA install prompt type ──────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ─── App ──────────────────────────────────────────────────────────────────────

const EMPTY_STATE: Omit<TestState, 'isActive' | 'testWords'> = {
  userInput: '', currentWordIndex: 0, startTime: null,
  wpm: 0, accuracy: 100, errors: 0, correctChars: 0, wordOutcomes: [], combo: 0,
}

export default function App() {
  const { settings, isLoading, updateSetting } = useSettings()
  const { bestWPM, streak, history, recordTest } = useStats()

  const [showSettings, setShowSettings]   = useState(false)
  const [showResults,  setShowResults]    = useState(false)
  const [testDuration, setTestDuration]   = useState(60)
  const [difficulty,   setDifficulty]     = useState<DifficultyLevel>('medium')
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [testResults,   setTestResults]   = useState<TestResults | null>(null)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall,   setShowInstall]   = useState(false)

  const [testState, setTestState] = useState<TestState>({
    isActive: false, testWords: [], ...EMPTY_STATE,
  })

  // Refs
  const inputRef      = useRef<HTMLInputElement>(null)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const statsRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const wpmSamplesRef = useRef<number[]>([])
  const bestWPMRef    = useRef(bestWPM)
  useEffect(() => { bestWPMRef.current = bestWPM }, [bestWPM])

  const { play: playSound } = useSound(settings?.soundEnabled ?? true)

  // PWA install hook
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Sync persisted settings on load
  useEffect(() => {
    if (settings) {
      setTestDuration(settings.testDuration)
      setDifficulty(settings.difficulty)
      setTimeRemaining(settings.testDuration)
    }
  }, [settings])

  // ── Countdown ──
  useEffect(() => {
    if (!testState.isActive) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) { endTest(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testState.isActive])

  // ── Live WPM stats ──
  useEffect(() => {
    if (!testState.isActive || !testState.startTime) return
    statsRef.current = setInterval(() => {
      setTestState((prev) => {
        if (!prev.startTime) return prev
        const mins = Math.max((Date.now() - prev.startTime) / 60000, MIN_ELAPSED_MINS)
        let correctWords = 0, correctChars = 0
        for (let i = 0; i < prev.currentWordIndex && i < prev.testWords.length; i++) {
          if (prev.wordOutcomes[i] === 'correct') {
            correctWords++
            correctChars += prev.testWords[i].length
          }
        }
        const newWPM = Math.round(correctWords / mins)
        wpmSamplesRef.current.push(newWPM)
        return {
          ...prev,
          wpm:          newWPM,
          accuracy:     calculateAccuracy(correctChars, correctChars + prev.errors),
          correctChars,
        }
      })
    }, STATS_INTERVAL_MS)
    return () => { if (statsRef.current) clearInterval(statsRef.current) }
  }, [testState.isActive, testState.startTime])

  // ── Start ──
  const startTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (statsRef.current) clearInterval(statsRef.current)
    wpmSamplesRef.current = []

    const words = difficulty === 'quotes'
      ? generateQuoteWords(WORD_BUFFER_SIZE)
      : generateWords(difficulties[difficulty].wordPool, WORD_BUFFER_SIZE)

    setTestState({ isActive: true, testWords: words, ...EMPTY_STATE })
    setTimeRemaining(testDuration)
    setShowResults(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [difficulty, testDuration])

  // ── End ──
  const endTest = useCallback(() => {
    setTestState((prev) => {
      if (!prev.isActive || !prev.startTime) return prev
      const secs = (Date.now() - prev.startTime) / 1000
      const mins = Math.max(secs / 60, MIN_ELAPSED_MINS)
      let correctWords = 0, correctChars = 0
      for (let i = 0; i < prev.currentWordIndex && i < prev.testWords.length; i++) {
        if (prev.wordOutcomes[i] === 'correct') {
          correctWords++
          correctChars += prev.testWords[i].length
        }
      }
      const results: TestResults = {
        wpm:         Math.round(correctWords / mins),
        accuracy:    calculateAccuracy(correctChars, correctChars + prev.errors),
        errors:      prev.errors,
        correctChars,
        totalChars:  prev.testWords.slice(0, prev.currentWordIndex).reduce((s, w) => s + w.length, 0),
        duration:    Math.round(secs),
        wpmSamples:  [...wpmSamplesRef.current],
        prevBestWPM: bestWPMRef.current,
      }
      recordTest(results.wpm, results.accuracy, correctChars, prev.errors, difficulty, results.wpmSamples)
      setTestResults(results)
      setShowResults(true)
      playSound('testEnd')
      if (timerRef.current) clearInterval(timerRef.current)
      if (statsRef.current) clearInterval(statsRef.current)
      return { ...prev, isActive: false }
    })
  }, [difficulty, recordTest, playSound])

  // ── Input handler ──
  const handleInput = useCallback((value: string) => {
    setTestState((prev) => {
      if (!prev.isActive) return prev
      // Start timer on first keystroke
      const startTime = prev.startTime ?? Date.now()

      if (value.endsWith(' ') && prev.currentWordIndex < prev.testWords.length - 1) {
        const typed    = value.trim()
        const expected = prev.testWords[prev.currentWordIndex]
        const isCorrect = typed === expected
        const outcome: WordOutcome = isCorrect ? 'correct' : 'incorrect'
        if (isCorrect)  playSound('wordCorrect')
        else            playSound('wordError')
        const newCombo = isCorrect ? prev.combo + 1 : 0
        return {
          ...prev,
          startTime,
          userInput:        '',
          currentWordIndex: prev.currentWordIndex + 1,
          errors:           prev.errors + (isCorrect ? 0 : 1),
          wordOutcomes:     [...prev.wordOutcomes, outcome],
          combo:            newCombo,
        }
      }
      return { ...prev, startTime, userInput: value }
    })
  }, [playSound])

  // ── Skip word ──
  const skipWord = useCallback(() => {
    setTestState((prev) => {
      if (prev.currentWordIndex >= prev.testWords.length - 1) return prev
      playSound('wordError')
      return {
        ...prev,
        userInput:        '',
        currentWordIndex: prev.currentWordIndex + 1,
        errors:           prev.errors + 1,
        wordOutcomes:     [...prev.wordOutcomes, 'skipped' as WordOutcome],
        combo:            0,
      }
    })
  }, [playSound])

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!testState.isActive) return
      if (e.key === 'Tab')    { e.preventDefault(); skipWord() }
      if (e.key === 'Escape') { e.preventDefault(); endTest() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [testState.isActive, skipWord, endTest])

  const focusInput = useCallback(() => {
    if (testState.isActive) inputRef.current?.focus()
  }, [testState.isActive])

  // ─── Loading screen ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl animate-[pulse-subtle_1s_ease-in-out_infinite]" style={{ background: 'var(--gradient-cta)' }} />
          <p style={{ color: 'var(--muted)' }} className="text-sm font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  // ─── Derived values ───────────────────────────────────────────────────────────

  const progressPct = testState.testWords.length > 0
    ? (testState.currentWordIndex / testState.testWords.length) * 100
    : 0

  const currentLevel = getLevelForWPM(bestWPM)
  const nextLevel    = getNextLevel(bestWPM)

  // Progress to next level (0–1)
  const levelProgress = nextLevel
    ? Math.min((bestWPM - currentLevel.min) / (nextLevel.min - currentLevel.min), 1)
    : 1

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="h-[100svh] w-screen flex flex-col overflow-hidden" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navbar onSettingsClick={() => setShowSettings(true)} />

      {/* ── Single source-of-truth capture input ── */}
      <input
        ref={inputRef}
        type="text"
        value={testState.userInput}
        onChange={(e) => handleInput(e.target.value)}
        disabled={!testState.isActive}
        className="sr-only"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
      />

      {/* ── Progress bar ── */}
      {testState.isActive && (
        <div className="h-0.5 w-full shrink-0" style={{ background: 'var(--line)' }}>
          <div
            className="progress-fill h-full"
            style={{ width: `${progressPct}%`, background: 'var(--gradient-brand)' }}
          />
        </div>
      )}

      <main className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6" onClick={focusInput}>

        {testState.isActive ? (
          /* ── Active test ── */
          <div className="w-full max-w-3xl flex flex-col items-center gap-5">

            {/* Timer row */}
            <div className="w-full flex items-center justify-between gap-4">
              <Timer timeRemaining={timeRemaining} isActive />
              <div className="flex items-center gap-4">
                {/* Combo badge */}
                {testState.combo >= 3 && (
                  <div
                    key={testState.combo}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold animate-[combo-pop_0.2s_cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--success) 35%, transparent)', color: 'var(--success)' }}
                  >
                    <span className="text-base">🔥</span>
                    <span>{testState.combo}×</span>
                  </div>
                )}
                <StatsPanel wpm={testState.wpm} accuracy={testState.accuracy} errors={testState.errors} isTestActive compact />
              </div>
            </div>

            <TypingArea
              testWords={testState.testWords}
              userInput={testState.userInput}
              currentWordIndex={testState.currentWordIndex}
              wordOutcomes={testState.wordOutcomes}
              isTestActive
              onSkipWord={skipWord}
            />

            <div className="flex items-center gap-5 sm:gap-8 select-none">
              <Kbd label="Tab"   desc="skip word" />
              <Kbd label="Space" desc="next word"  />
              <Kbd label="Esc"   desc="end test"   />
            </div>
          </div>
        ) : (
          /* ── Pre-test lobby ── */
          <div className="w-full max-w-6xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-10 xl:gap-16">

            {/* Left — hero */}
            <div className="flex-1 flex flex-col items-center md:items-start gap-5 md:gap-6 pt-0 md:pt-2 md:justify-center">

              {/* Title */}
              <div className="text-center md:text-left">
                <h1
                  className="font-bold leading-none mb-3"
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                    background: 'var(--gradient-brand)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  TypeFlow
                </h1>
                <p className="text-base sm:text-lg" style={{ color: 'var(--muted)', maxWidth: '30ch' }}>
                  Measure your speed. Level up your skills.
                </p>
              </div>

              {/* Level badge */}
              <LevelBadge
                level={currentLevel}
                nextLevel={nextLevel}
                bestWPM={bestWPM}
                progress={levelProgress}
              />

              {/* Stat pills */}
              <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center md:justify-start">
                <StatPill label="Best WPM" value={bestWPM}        color={currentLevel.color}       />
                <Divider />
                <StatPill label="Streak"   value={streak.current} color="var(--color-cta-alt)"     />
                <Divider />
                <StatPill label="Tests"    value={history.length} color="var(--ink)"                />
              </div>

              {/* Recent history sparkline */}
              {history.length >= 2 && (
                <div className="w-full max-w-xs md:max-w-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                    Recent WPM
                  </p>
                  <MiniSparkline data={history.slice(-12).map((h) => h.wpm)} />
                </div>
              )}

              {/* Desktop shortcut guide */}
              <div className="hidden md:flex flex-col gap-2 mt-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Shortcuts</p>
                {([['Space', 'next word'], ['Tab', 'skip word'], ['Esc', 'end test']] as const).map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded text-[11px] font-mono font-medium" style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                      {key}
                    </kbd>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — config card */}
            <div
              className="w-full md:w-[24rem] xl:w-[26rem] shrink-0 rounded-[var(--radius-card)] p-6 sm:p-7 flex flex-col gap-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
            >
              {/* Card header */}
              <div className="flex items-center gap-2 pb-1">
                <div className="w-2 h-2 rounded-full animate-[pulse-subtle_2s_ease_infinite]" style={{ background: 'var(--color-cta)' }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Configure test</span>
              </div>

              <DurationSelector selected={testDuration} onChange={(v) => { setTestDuration(v); setTimeRemaining(v); updateSetting('testDuration', v) }} />
              <div style={{ height: 1, background: 'var(--line)' }} />
              <DifficultySelector selected={difficulty} difficulties={difficulties} onChange={(v) => { setDifficulty(v); updateSetting('difficulty', v) }} />

              <button
                onClick={startTest}
                className="w-full py-4 rounded-[var(--radius-btn)] font-bold tracking-tight hover:opacity-92 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  background: 'var(--gradient-cta)',
                  color: 'var(--paper)',
                  boxShadow: 'var(--shadow-cta-lg)',
                }}
              >
                Start Typing →
              </button>
              <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>or press any key to begin</p>
            </div>
          </div>
        )}

        {/* PWA install banner */}
        {showInstall && !testState.isActive && (
          <div
            className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-[var(--radius-btn)] shadow-lg animate-[slide-up_0.3s_ease-out]"
            style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
          >
            <p className="text-sm" style={{ color: 'var(--ink)' }}>Add TypeFlow to your home screen</p>
            <button
              onClick={async () => {
                await installPrompt?.prompt()
                setShowInstall(false)
              }}
              className="px-3 py-1.5 rounded text-sm font-semibold min-h-0"
              style={{ background: 'var(--gradient-cta)', color: 'var(--paper)' }}
            >
              Install
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="min-h-0 text-xs px-2 py-1"
              style={{ color: 'var(--muted)' }}
            >
              ✕
            </button>
          </div>
        )}
      </main>

      <Footer />

      <ResultsModal
        isOpen={showResults}
        results={testResults}
        difficulty={difficulty}
        onClose={() => setShowResults(false)}
        onRetry={startTest}
      />
      <SettingsModal
        isOpen={showSettings}
        soundEnabled={settings?.soundEnabled ?? true}
        onSoundToggle={(v) => updateSetting('soundEnabled', v)}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({
  level,
  nextLevel,
  bestWPM,
  progress,
}: {
  level: TypingLevel
  nextLevel: TypingLevel | null
  bestWPM: number
  progress: number
}) {
  return (
    <div
      className="flex flex-col gap-2 p-3.5 rounded-2xl w-full max-w-xs md:max-w-sm"
      style={{ background: 'color-mix(in srgb, var(--panel) 80%, transparent)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden>{level.emoji}</span>
          <div>
            <p className="font-bold text-base leading-tight" style={{ color: level.color }}>
              {level.label}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
              {bestWPM > 0 ? `${bestWPM} WPM best` : 'Complete a test'}
            </p>
          </div>
        </div>
        {nextLevel && (
          <p className="text-xs text-right shrink-0" style={{ color: 'var(--muted)' }}>
            Next: <span className="font-semibold" style={{ color: nextLevel.color }}>{nextLevel.label}</span>
            <br />
            <span className="text-[11px]">at {nextLevel.min} WPM</span>
          </p>
        )}
        {!nextLevel && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--color-cta-alt) 15%, transparent)', color: 'var(--color-cta-alt)' }}>
            MAX
          </span>
        )}
      </div>
      {/* Progress bar to next level */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress * 100}%`,
            background: nextLevel
              ? `linear-gradient(90deg, ${level.color}, ${nextLevel.color})`
              : 'var(--gradient-brand)',
          }}
        />
      </div>
    </div>
  )
}

// ─── Small shared sub-components ─────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="font-bold text-2xl tabular-nums leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", color }}>
        {value}
      </p>
    </div>
  )
}

function Divider() {
  return <div style={{ width: 1, height: 36, background: 'var(--line)' }} />
}

function Kbd({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <kbd className="px-2 py-1 rounded text-[11px] font-mono font-medium" style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
        {label}
      </kbd>
      <span className="text-xs hidden sm:inline" style={{ color: 'var(--muted)' }}>{desc}</span>
    </div>
  )
}

/** Tiny inline sparkline — pure SVG. */
function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const W = 280, H = 36
  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 6) - 3}`)
    .join(' ')
  const areaEnd = `${W},${H} 0,${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, overflow: 'visible' }} aria-hidden>
      <polyline
        points={`${pts} ${areaEnd}`}
        fill="color-mix(in srgb, var(--color-cta) 12%, transparent)"
        stroke="none"
      />
      <polyline
        points={pts}
        fill="none"
        stroke="var(--color-cta)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  )
}
