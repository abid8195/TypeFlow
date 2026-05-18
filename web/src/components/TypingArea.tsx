import { useMemo } from 'react'

interface TypingAreaProps {
  testWords: string[]
  userInput: string
  currentWordIndex: number
  isTestActive: boolean
  onInputChange: (value: string) => void
  onSkipWord: () => void
}

type CharStatus = 'correct' | 'incorrect' | 'pending' | 'extra'

/** Inline style maps — all colours reference FreeAppStore CSS variables */
const CHAR_STYLES: Record<CharStatus, React.CSSProperties> = {
  correct:   { color: 'var(--success)' },
  incorrect: { color: 'var(--error)',   background: 'color-mix(in srgb, var(--error) 12%, transparent)', borderRadius: '3px' },
  pending:   { color: 'var(--ink)' },
  extra:     { color: 'color-mix(in srgb, var(--error) 60%, transparent)' },
}

export function TypingArea({
  testWords,
  userInput,
  currentWordIndex,
  isTestActive,
  onInputChange,
  onSkipWord,
}: TypingAreaProps) {
  const currentWord = testWords[currentWordIndex] ?? ''
  const upcomingWords = testWords.slice(currentWordIndex + 1, currentWordIndex + 10)

  const charStatus = useMemo<CharStatus[]>(() => {
    const chars: CharStatus[] = []
    for (let i = 0; i < currentWord.length; i++) {
      chars.push(i < userInput.length
        ? (userInput[i] === currentWord[i] ? 'correct' : 'incorrect')
        : 'pending')
    }
    for (let i = currentWord.length; i < userInput.length; i++) {
      chars.push('extra')
    }
    return chars
  }, [currentWord, userInput])

  if (testWords.length === 0) return null

  return (
    <div className="w-full max-w-3xl flex flex-col gap-5">
      {/* Typing card */}
      <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[var(--glass)] backdrop-blur-md p-6 sm:p-8 shadow-2xl">
        {/* Current word */}
        <div className="min-h-[3.5rem] flex items-center justify-center mb-5">
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl tracking-tight leading-snug flex flex-wrap gap-0.5 justify-center">
            {Array.from(currentWord).map((char, i) => (
              <span key={i} style={CHAR_STYLES[charStatus[i] ?? 'pending']} className="transition-colors duration-75">
                {char}
              </span>
            ))}
            {/* Extra typed characters beyond word length */}
            {userInput.slice(currentWord.length).split('').map((char, i) => (
              <span key={`ex-${i}`} style={CHAR_STYLES.extra}>{char}</span>
            ))}
            {/* Blinking cursor */}
            {isTestActive && (
              <span
                className="inline-block w-0.5 h-10 rounded-full ml-1 animate-[pulse-subtle_1s_ease-in-out_infinite]"
                style={{ background: 'var(--color-cta)' }}
              />
            )}
          </div>
        </div>

        {/* Upcoming words preview */}
        <p className="text-[color:var(--muted)] font-mono text-sm sm:text-base text-center leading-relaxed break-words">
          {upcomingWords.join(' ')}
        </p>
      </div>

      {/* Hidden real input */}
      <input
        type="text"
        value={userInput}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={!isTestActive}
        className="sr-only"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input — start typing to begin"
        id="typing-input"
      />

      {/* Hints */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onSkipWord}
          disabled={!isTestActive}
          className="px-4 py-2 rounded-[var(--radius-btn)] text-sm font-medium border transition-all duration-200 min-h-[44px]"
          style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          Skip word
        </button>
        <p className="text-[color:var(--muted)] text-xs hidden sm:block">
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
            style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
          >Tab</kbd>
          {' '}skip &nbsp;·&nbsp;
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
            style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
          >Space</kbd>
          {' '}next
        </p>
      </div>
    </div>
  )
}
