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
      if (i < userInput.length) {
        chars.push(userInput[i] === currentWord[i] ? 'correct' : 'incorrect')
      } else {
        chars.push('pending')
      }
    }
    for (let i = currentWord.length; i < userInput.length; i++) {
      chars.push('extra')
    }
    return chars
  }, [currentWord, userInput])

  if (testWords.length === 0) return null

  const charClass: Record<CharStatus, string> = {
    correct: 'text-[color:var(--color-success)]',
    incorrect: 'bg-[color:var(--color-error)]/15 text-[color:var(--color-error)] rounded',
    pending: 'text-[color:var(--ink)]',
    extra: 'text-[color:var(--color-error)]/60',
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-5">
      {/* Typing card */}
      <div className="rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[var(--glass)] backdrop-blur-md p-6 sm:p-8 shadow-2xl">
        {/* Current word */}
        <div className="min-h-[3.5rem] flex items-center justify-center mb-5">
          <div className="font-mono text-3xl sm:text-4xl md:text-5xl tracking-tight leading-snug flex flex-wrap gap-0.5 justify-center">
            {Array.from(currentWord).map((char, i) => (
              <span key={i} className={`transition-colors duration-75 ${charClass[charStatus[i] ?? 'pending']}`}>
                {char}
              </span>
            ))}
            {/* Extra typed chars */}
            {userInput.slice(currentWord.length).split('').map((char, i) => (
              <span key={`ex-${i}`} className={charClass.extra}>{char}</span>
            ))}
            {/* Cursor */}
            {isTestActive && (
              <span className="inline-block w-0.5 h-10 bg-[color:var(--color-accent)] rounded-full ml-1 animate-[pulse-subtle_1s_ease-in-out_infinite]" />
            )}
          </div>
        </div>

        {/* Upcoming words */}
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
          className="px-4 py-2 rounded-[var(--radius-btn)] text-sm font-medium border border-[color:var(--line)] text-[color:var(--muted)] hover:border-[color:var(--color-accent)]/40 hover:text-[color:var(--ink)] transition-all duration-200 min-h-[44px]"
        >
          Skip word
        </button>
        <p className="text-[color:var(--muted)] text-xs hidden sm:block">
          <kbd className="bg-[color:var(--color-surface)] px-1.5 py-0.5 rounded text-[10px] font-mono border border-[color:var(--line)]">Tab</kbd>
          {' '}skip &nbsp;·&nbsp;
          <kbd className="bg-[color:var(--color-surface)] px-1.5 py-0.5 rounded text-[10px] font-mono border border-[color:var(--line)]">Space</kbd>
          {' '}next
        </p>
      </div>
    </div>
  )
}
