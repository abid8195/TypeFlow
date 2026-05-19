import { useLayoutEffect, useRef, useMemo } from 'react'

interface TypingAreaProps {
  testWords: string[]
  userInput: string
  currentWordIndex: number
  wordResults: boolean[]        // true = completed correctly
  isTestActive: boolean
  onInputChange: (value: string) => void
  onSkipWord: () => void
}

type CharStatus = 'correct' | 'incorrect' | 'pending' | 'extra'

const CHAR_COLOR: Record<CharStatus, string> = {
  correct:   'var(--success)',
  incorrect: 'var(--error)',
  pending:   'var(--muted)',
  extra:     'var(--error)',
}

const LINE_HEIGHT_PX = 44   // px — matches font+padding below; must stay in sync with CSS
const VISIBLE_LINES  = 3    // rows visible in the clipping container

export function TypingArea({
  testWords,
  userInput,
  currentWordIndex,
  wordResults,
  isTestActive,
  onInputChange,
  onSkipWord,
}: TypingAreaProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Scroll the inner div so current word is always on the first visible row
  useLayoutEffect(() => {
    const el = wordRefs.current[currentWordIndex]
    if (!el || !innerRef.current) return
    const translateY = Math.max(0, el.offsetTop - LINE_HEIGHT_PX)
    innerRef.current.style.transform = `translateY(-${translateY}px)`
  }, [currentWordIndex])

  const charStatuses = useMemo<CharStatus[]>(() => {
    const currentWord = testWords[currentWordIndex] ?? ''
    const result: CharStatus[] = []
    for (let i = 0; i < currentWord.length; i++) {
      result.push(
        i < userInput.length
          ? (userInput[i] === currentWord[i] ? 'correct' : 'incorrect')
          : 'pending'
      )
    }
    for (let i = currentWord.length; i < userInput.length; i++) {
      result.push('extra')
    }
    return result
  }, [testWords, currentWordIndex, userInput])

  if (testWords.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-4">

      {/* ── Clipping window ── */}
      <div
        className="w-full relative select-none"
        style={{
          height: `${LINE_HEIGHT_PX * VISIBLE_LINES}px`,
          overflow: 'hidden',
        }}
      >
        {/* Top fade — hides partially-scrolled words gracefully */}
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            height: '1.5rem',
            background: 'linear-gradient(to bottom, var(--paper), transparent)',
          }}
        />

        {/* Inner scrolling word strip */}
        <div
          ref={innerRef}
          className="words-inner absolute inset-x-0 top-0"
          style={{ lineHeight: `${LINE_HEIGHT_PX}px` }}
        >
          {testWords.map((word, wi) => {
            const isCurrentWord = wi === currentWordIndex
            const isCompleted   = wi < currentWordIndex
            const isCorrect     = wordResults[wi]   // only meaningful when isCompleted

            return (
              <span
                key={wi}
                ref={(el) => { wordRefs.current[wi] = el }}
                className="inline-block mr-3"
                style={{
                  fontSize: '1.375rem',      // 22px — generous but not huge
                  fontFamily: 'monospace',
                  letterSpacing: '0.01em',
                }}
              >
                {isCurrentWord ? (
                  /* ── Active word — character-level coloring + cursor ── */
                  <span className="relative">
                    {/* Characters already typed */}
                    {Array.from(testWords[currentWordIndex]).map((char, ci) => (
                      <span
                        key={ci}
                        style={{
                          color: CHAR_COLOR[charStatuses[ci] ?? 'pending'],
                          transition: 'color 60ms ease',
                        }}
                      >
                        {char}
                      </span>
                    ))}
                    {/* Extra chars typed beyond word length */}
                    {userInput.slice(testWords[currentWordIndex].length).split('').map((char, ci) => (
                      <span key={`ex-${ci}`} style={{ color: CHAR_COLOR.extra, opacity: 0.65 }}>
                        {char}
                      </span>
                    ))}
                    {/* Blinking cursor — inserted after last typed position */}
                    <span
                      className="animate-[cursor-blink_1.1s_step-end_infinite]"
                      style={{
                        display: 'inline-block',
                        width: '2px',
                        height: '1.3em',
                        verticalAlign: 'text-bottom',
                        background: 'var(--color-cta)',
                        borderRadius: '1px',
                        marginLeft: userInput.length > 0 ? '1px' : '-1px',
                        marginRight: '1px',
                        boxShadow: '0 0 6px var(--color-cta)',
                      }}
                    />
                  </span>
                ) : isCompleted ? (
                  /* ── Completed word — solid color based on correctness ── */
                  <span
                    style={{
                      color: isCorrect ? 'var(--success)' : 'var(--error)',
                      opacity: 0.55,
                    }}
                  >
                    {word}
                  </span>
                ) : (
                  /* ── Upcoming word — muted ── */
                  <span style={{ color: 'var(--muted)' }}>
                    {word}
                  </span>
                )}
              </span>
            )
          })}
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            height: '2.5rem',
            background: 'linear-gradient(to top, var(--paper), transparent)',
          }}
        />
      </div>

      {/* ── Input capture (sr-only) ── */}
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
        aria-label="Typing input — type the words shown above"
        id="typing-input"
      />

      {/* ── Skip button ── */}
      <div className="flex justify-center">
        <button
          onClick={onSkipWord}
          disabled={!isTestActive}
          className="px-4 py-2 rounded-[var(--radius-btn)] text-xs font-semibold uppercase tracking-widest transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
          style={{
            border: '1px solid var(--line)',
            color: 'var(--muted)',
            background: 'transparent',
            minHeight: '36px',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          Skip word
        </button>
      </div>
    </div>
  )
}
