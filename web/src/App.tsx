import { useEffect, useState, useRef, useCallback } from 'react'
import { Navbar } from './components/Navbar'
import { TypingArea } from './components/TypingArea'
import { Timer } from './components/Timer'
import { StatsPanel } from './components/StatsPanel'
import { DurationSelector } from './components/DurationSelector'
import { DifficultySelector } from './components/DifficultySelector'
import { ResultsModal } from './components/ResultsModal'
import { SettingsModal } from './components/SettingsModal'
import { Footer } from './components/Footer'
import { useSettings, useStats } from './hooks/usePersistence'
import { difficulties } from './data/words'
import { generateWords, calculateAccuracy } from './utils/typing'

interface TestState {
  isActive: boolean
  testWords: string[]
  userInput: string
  currentWordIndex: number
  startTime: number | null
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  wordResults: boolean[]   // true = word was typed correctly
}

interface TestResults {
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
}

const INITIAL_STATE: Omit<TestState, 'isActive' | 'testWords'> = {
  userInput: '',
  currentWordIndex: 0,
  startTime: null,
  wpm: 0,
  accuracy: 100,
  errors: 0,
  correctChars: 0,
  totalChars: 0,
  wordResults: [],
}

export default function App() {
  const { settings, isLoading } = useSettings()
  const { bestWPM, streak, recordTest } = useStats()

  const [showSettings, setShowSettings] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [testDuration, setTestDuration] = useState(60)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [timeRemaining, setTimeRemaining] = useState(60)
  const [testResults, setTestResults] = useState<TestResults | null>(null)

  const [testState, setTestState] = useState<TestState>({
    isActive: false,
    testWords: [],
    ...INITIAL_STATE,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const statsRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sync settings on load
  useEffect(() => {
    if (settings) {
      setTestDuration(settings.testDuration)
      setDifficulty(settings.difficulty)
      setTimeRemaining(settings.testDuration)
    }
  }, [settings])

  // Countdown
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

  // Real-time WPM stats
  useEffect(() => {
    if (!testState.isActive || !testState.startTime) return
    statsRef.current = setInterval(() => {
      setTestState((prev) => {
        if (!prev.startTime) return prev
        const mins = Math.max((Date.now() - prev.startTime) / 60000, 0.016)
        let correctWords = 0, correctChars = 0
        for (let i = 0; i < prev.currentWordIndex && i < prev.testWords.length; i++) {
          if (prev.wordResults[i]) {
            correctWords++
            correctChars += prev.testWords[i].length
          }
        }
        return {
          ...prev,
          wpm: Math.round(correctWords / mins),
          accuracy: calculateAccuracy(correctChars, correctChars + prev.errors),
          correctChars,
        }
      })
    }, 200)
    return () => { if (statsRef.current) clearInterval(statsRef.current) }
  }, [testState.isActive, testState.startTime])

  const startTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (statsRef.current) clearInterval(statsRef.current)
    const words = generateWords(difficulties[difficulty].wordPool, 150)
    setTestState({
      isActive: true,
      testWords: words,
      ...INITIAL_STATE,
    })
    setTimeRemaining(testDuration)
    setShowResults(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [difficulty, testDuration])

  const endTest = useCallback(() => {
    setTestState((prev) => {
      if (!prev.isActive || !prev.startTime) return prev
      const secs = (Date.now() - prev.startTime) / 1000
      const mins = Math.max(secs / 60, 0.016)
      let correctWords = 0, correctChars = 0
      for (let i = 0; i < prev.currentWordIndex && i < prev.testWords.length; i++) {
        if (prev.wordResults[i]) {
          correctWords++
          correctChars += prev.testWords[i].length
        }
      }
      const results: TestResults = {
        wpm: Math.round(correctWords / mins),
        accuracy: calculateAccuracy(correctChars, correctChars + prev.errors),
        errors: prev.errors,
        correctChars,
        totalChars: prev.totalChars,
        duration: Math.round(secs),
      }
      setTestResults(results)
      recordTest(results.wpm, results.accuracy, correctChars, prev.errors, difficulty)
      setShowResults(true)
      if (timerRef.current) clearInterval(timerRef.current)
      if (statsRef.current) clearInterval(statsRef.current)
      return { ...prev, isActive: false }
    })
  }, [difficulty, recordTest])

  const handleInput = useCallback((value: string) => {
    setTestState((prev) => {
      if (!prev.isActive) return prev
      if (value.endsWith(' ') && prev.currentWordIndex < prev.testWords.length - 1) {
        const typed = value.trim()
        const expected = prev.testWords[prev.currentWordIndex]
        const isCorrect = typed === expected
        return {
          ...prev,
          userInput: '',
          currentWordIndex: prev.currentWordIndex + 1,
          errors: prev.errors + (isCorrect ? 0 : 1),
          wordResults: [...prev.wordResults, isCorrect],
        }
      }
      return { ...prev, userInput: value }
    })
  }, [])

  const skipWord = useCallback(() => {
    setTestState((prev) => {
      if (prev.currentWordIndex >= prev.testWords.length - 1) return prev
      return {
        ...prev,
        userInput: '',
        currentWordIndex: prev.currentWordIndex + 1,
        errors: prev.errors + 1,
        wordResults: [...prev.wordResults, false],
      }
    })
  }, [])

  // Keyboard shortcuts
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

  if (isLoading) {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl animate-[pulse-subtle_1s_ease-in-out_infinite]"
            style={{ background: 'var(--gradient-cta)' }}
          />
          <p style={{ color: 'var(--muted)' }} className="text-sm font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100svh] w-screen flex flex-col overflow-hidden" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
      <Navbar bestWPM={bestWPM} streak={streak.current} onSettingsClick={() => setShowSettings(true)} />

      {/* Hidden capture input — focused on test start */}
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

      <main className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4" onClick={focusInput}>

        {testState.isActive ? (
          /* ── Active test ── */
          <div className="w-full max-w-3xl flex flex-col items-center gap-6">
            {/* Timer row */}
            <div className="w-full flex items-center justify-between">
              <Timer timeRemaining={timeRemaining} isActive />
              <StatsPanel
                wpm={testState.wpm}
                accuracy={testState.accuracy}
                errors={testState.errors}
                isTestActive
                compact
              />
            </div>

            <TypingArea
              testWords={testState.testWords}
              userInput={testState.userInput}
              currentWordIndex={testState.currentWordIndex}
              wordResults={testState.wordResults}
              isTestActive
              onInputChange={handleInput}
              onSkipWord={skipWord}
            />

            {/* Hints row */}
            <div className="flex items-center gap-6 select-none">
              <Kbd label="Tab" desc="skip word" />
              <Kbd label="Space" desc="next word" />
              <Kbd label="Esc" desc="end test" />
            </div>
          </div>
        ) : (
          /* ── Pre-test lobby ── */
          <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16">

            {/* Left — hero */}
            <div className="flex-1 flex flex-col items-center lg:items-start gap-6 pt-0 lg:pt-2">
              <div className="text-center lg:text-left">
                <h1
                  className="font-bold text-5xl sm:text-6xl lg:text-7xl leading-none mb-3"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  TypeFlow
                </h1>
                <p className="text-base sm:text-lg" style={{ color: 'var(--muted)' }}>
                  Measure your speed. Build your streak.
                </p>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 sm:gap-4">
                <StatPill label="Best WPM" value={bestWPM} color="var(--color-cta)" />
                <div style={{ width: 1, height: 36, background: 'var(--line)' }} />
                <StatPill label="Streak" value={streak.current} color="var(--color-cta-alt)" />
                <div style={{ width: 1, height: 36, background: 'var(--line)' }} />
                <StatPill label="Duration" value={testDuration >= 60 ? `${testDuration / 60}m` : `${testDuration}s`} color="var(--ink)" />
              </div>

              {/* Keyboard hints — desktop only */}
              <div className="hidden lg:flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Shortcuts</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    ['Space', 'advance to next word'],
                    ['Tab', 'skip current word'],
                    ['Esc', 'end test early'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center gap-2">
                      <kbd
                        className="px-2 py-0.5 rounded text-[11px] font-mono font-medium"
                        style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                      >
                        {key}
                      </kbd>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — config card */}
            <div
              className="w-full lg:w-[22rem] shrink-0 rounded-[var(--radius-card)] p-6 sm:p-7 flex flex-col gap-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
            >
              <DurationSelector
                selected={testDuration}
                onChange={(v) => { setTestDuration(v); setTimeRemaining(v) }}
              />
              <div style={{ height: 1, background: 'var(--line)' }} />
              <DifficultySelector
                selected={difficulty}
                difficulties={difficulties}
                onChange={setDifficulty}
              />
              <button
                onClick={startTest}
                className="w-full py-4 rounded-[var(--radius-btn)] font-bold text-xl tracking-tight hover:opacity-90 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150"
                style={{ fontFamily: "'Fraunces', Georgia, serif", background: 'var(--gradient-cta)', color: 'var(--paper)', boxShadow: 'var(--shadow-cta)' }}
              >
                Start Test
              </button>
              <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
                Press any key to start
              </p>
            </div>

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
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}

/* ── Small shared sub-components ── */

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

function Kbd({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <kbd
        className="px-2 py-1 rounded text-[11px] font-mono font-medium"
        style={{ background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--ink)' }}
      >
        {label}
      </kbd>
      <span className="text-xs hidden sm:inline" style={{ color: 'var(--muted)' }}>{desc}</span>
    </div>
  )
}
