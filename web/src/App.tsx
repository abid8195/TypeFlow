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
}

interface TestResults {
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
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
    userInput: '',
    currentWordIndex: 0,
    startTime: null,
    wpm: 0,
    accuracy: 100,
    errors: 0,
    correctChars: 0,
    totalChars: 0,
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
          correctWords++
          correctChars += prev.testWords[i].length
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
    const words = generateWords(difficulties[difficulty].wordPool, 120)
    setTestState({
      isActive: true,
      testWords: words,
      userInput: '',
      currentWordIndex: 0,
      startTime: Date.now(),
      wpm: 0,
      accuracy: 100,
      errors: 0,
      correctChars: 0,
      totalChars: 0,
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
      for (let i = 0; i <= prev.currentWordIndex && i < prev.testWords.length; i++) {
        correctWords++
        correctChars += prev.testWords[i].length
      }
      const results: TestResults = {
        wpm: Math.round(correctWords / mins),
        accuracy: calculateAccuracy(correctChars, correctChars),
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
        const newErrors = prev.errors + (typed !== expected ? 1 : 0)
        return { ...prev, userInput: '', currentWordIndex: prev.currentWordIndex + 1, errors: newErrors }
      }
      return { ...prev, userInput: value }
    })
  }, [])

  const skipWord = useCallback(() => {
    setTestState((prev) => {
      if (prev.currentWordIndex >= prev.testWords.length - 1) return prev
      return { ...prev, userInput: '', currentWordIndex: prev.currentWordIndex + 1, errors: prev.errors + 1 }
    })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!testState.isActive) return
      if (e.key === 'Tab') { e.preventDefault(); skipWord() }
      if (e.key === 'Escape') { e.preventDefault(); endTest() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [testState.isActive, skipWord, endTest])

  // Click anywhere on main area to focus input
  const focusInput = () => { if (testState.isActive) inputRef.current?.focus() }

  if (isLoading) {
    return (
      <div className="h-[100svh] w-screen flex items-center justify-center bg-[color:var(--paper)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[color:var(--color-accent)] to-[color:var(--color-accent-secondary)] animate-[pulse-subtle_1s_ease-in-out_infinite]" />
          <p className="text-[color:var(--muted)] text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100svh] w-screen flex flex-col bg-[color:var(--paper)] text-[color:var(--ink)] overflow-hidden">
      <Navbar bestWPM={bestWPM} streak={streak.current} onSettingsClick={() => setShowSettings(true)} />

      {/* Hidden input — always mounted so typing starts immediately */}
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

      <main
        className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-3"
        onClick={focusInput}
      >
        {testState.isActive ? (
          /* ── Active test ── */
          <div className="w-full max-w-3xl flex flex-col items-center gap-5 h-full justify-center">
            <Timer timeRemaining={timeRemaining} isActive />
            <TypingArea
              testWords={testState.testWords}
              userInput={testState.userInput}
              currentWordIndex={testState.currentWordIndex}
              isTestActive
              onInputChange={handleInput}
              onSkipWord={skipWord}
            />
            <StatsPanel
              wpm={testState.wpm}
              accuracy={testState.accuracy}
              errors={testState.errors}
              isTestActive
            />
          </div>
        ) : (
          /* ── Pre-test lobby ── */
          <div className="w-full max-w-sm flex flex-col items-center gap-3">
            {/* Hero — compact */}
            <div className="text-center">
              <h1
                className="font-[family-name:var(--font-heading)] font-bold text-4xl sm:text-5xl"
                style={{ background: 'linear-gradient(90deg,#00d9ff,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                TypeFlow
              </h1>
              <p className="text-[color:var(--muted)] text-xs sm:text-sm mt-0.5">
                Test your speed · Build your streak
              </p>
            </div>

            {/* Config card — Duration + Difficulty + Start all-in-one */}
            <div className="w-full rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[var(--glass)] backdrop-blur-md p-4 sm:p-5 flex flex-col gap-4">
              <DurationSelector
                selected={testDuration}
                onChange={(v) => { setTestDuration(v); setTimeRemaining(v) }}
              />
              <DifficultySelector
                selected={difficulty}
                difficulties={difficulties}
                onChange={setDifficulty}
              />

              {/* Start button — inside the card */}
              <button
                onClick={startTest}
                style={{ background: 'linear-gradient(135deg, #00d9ff 0%, #7c3aed 100%)' }}
                className="w-full py-3.5 rounded-[var(--radius-btn)] font-[family-name:var(--font-heading)] font-bold text-lg text-black shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-[48px]"
              >
                Start Test
              </button>
            </div>

            {/* Personal bests */}
            <div className="w-full grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[color:var(--line)] bg-[var(--glass)] p-3 text-center">
                <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-0.5">Best</p>
                <p className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[color:var(--color-accent)] tabular-nums">{bestWPM}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--line)] bg-[var(--glass)] p-3 text-center">
                <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-0.5">Streak</p>
                <p className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[color:var(--color-accent-secondary)] tabular-nums">{streak.current}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--line)] bg-[var(--glass)] p-3 text-center">
                <p className="text-[color:var(--muted)] text-[10px] font-semibold uppercase tracking-widest mb-0.5">Time</p>
                <p className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[color:var(--ink)] tabular-nums">
                  {testDuration >= 60 ? `${testDuration / 60}m` : `${testDuration}s`}
                </p>
              </div>
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
