import { useLayoutEffect, useRef, useMemo, useState, useEffect } from 'react'
import type { WordOutcome } from '../App'

interface TypingAreaProps {
  testWords:        string[]
  userInput:        string
  currentWordIndex: number
  wordOutcomes:     WordOutcome[]
  isTestActive:     boolean
  onSkipWord:       () => void
}

type CharStatus = 'correct' | 'incorrect' | 'pending' | 'extra'

const CHAR_COLOR: Record<CharStatus, string> = {
  correct:   'var(--success)',
  incorrect: 'var(--error)',
  pending:   'var(--muted)',
  extra:     'var(--error)',
}

const LINE_HEIGHT_PX = 44
const VISIBLE_LINES  = 3

export function TypingArea({
  testWords,
  userInput,
  currentWordIndex,
  wordOutcomes,
  isTestActive,
  onSkipWord,
}: TypingAreaProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])

  // Track which word just flashed (correct completion) for CSS animation
  const [flashIndex, setFlashIndex] = useState<number | null>(null)
  // Track whether to shake current word (error input)
  const [shaking, setShaking] = useState(false)
  const prevOutcomesLen = useRef(0)
  const prevUserInput   = useRef('')

  // Detect a newly completed word → flash if correct, shake parent if incorrect
  useEffect(() => {
    if (wordOutcomes.length > prevOutcomesLen.current) {
      const newOutcome = wordOutcomes[wordOutcomes.length - 1]
      if (newOutcome === 'correct') {
        setFlashIndex(wordOutcomes.length - 1)
        setTimeout(() => setFlashIndex(null), 420)
      }
    }
    prevOutcomesLen.current = wordOutcomes.length
  }, [wordOutcomes])

  // Detect a new incorrect character typed → shake the word
  useEffect(() => {
    const prev = prevUserInput.current
    const curr = userInput
    if (curr.length > prev.length) {
      const newChar = curr[curr.length - 1]
      const expected = testWords[currentWordIndex]?.[curr.length - 1]
      if (expected !== undefined && newChar !== expected) {
        setShaking(true)
        setTimeout(() => setShaking(false), 360)
      }
    }
    prevUserInput.current = curr
  }, [userInput, currentWordIndex, testWords])

  // Scroll: keep current word on the top visible row
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
    for (let i = currentWord.length; i < userInput.length; i++) result.push('extra')
    return result
  }, [testWords, currentWordIndex, userInput])

  if (testWords.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-4">

      {/* ── Clipping window ── */}
      <div
        className="w-full relative select-none"
        style={{ height: `${LINE_HEIGHT_PX * VISIBLE_LINES}px`, overflow: 'hidden' }}
      >
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{ height: '1.5rem', background: 'linear-gradient(to bottom, var(--paper), transparent)' }} />

        {/* Inner scrolling strip */}
        <div ref={innerRef} className="words-inner absolute inset-x-0 top-0" style={{ lineHeight: `${LINE_HEIGHT_PX}px` }}>
          {testWords.map((word, wi) => {
            const isCurrentWord = wi === currentWordIndex
            const isCompleted   = wi < currentWordIndex
            const outcome       = wordOutcomes[wi]
            const isFlashing    = flashIndex === wi

            return (
              <span
                key={wi}
                ref={(el) => { wordRefs.current[wi] = el }}
                className="inline-block mr-3"
                style={{ fontSize: '1.375rem', fontFamily: 'monospace', letterSpacing: '0.01em' }}
              >
                {isCurrentWord ? (
                  /* ── Active word ── */
                  <span
                    className="relative"
                    style={{
                      display: 'inline-block',
                      animation: shaking ? 'shake 0.35s cubic-bezier(0.36,0.07,0.19,0.97)' : undefined,
                    }}
                  >
                    {Array.from(testWords[currentWordIndex]).map((char, ci) => (
                      <span
                        key={ci}
                        style={{ color: CHAR_COLOR[charStatuses[ci] ?? 'pending'], transition: 'color 50ms ease' }}
                      >
                        {char}
                      </span>
                    ))}
                    {/* Extra chars */}
                    {userInput.slice(testWords[currentWordIndex].length).split('').map((char, ci) => (
                      <span key={`ex-${ci}`} style={{ color: CHAR_COLOR.extra, opacity: 0.65 }}>{char}</span>
                    ))}
                    {/* Blinking cursor */}
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
                  /* ── Completed word ── */
                  <span
                    style={{
                      color: outcome === 'correct' ? 'var(--success)' : 'var(--error)',
                      opacity: isFlashing ? 1 : 0.45,
                      animation: isFlashing ? 'word-flash 0.4s ease-out forwards' : undefined,
                      transition: 'opacity 0.2s ease',
                      textDecoration: outcome === 'skipped' ? 'line-through' : undefined,
                    }}
                  >
                    {word}
                  </span>
                ) : (
                  /* ── Upcoming word ── */
                  <span style={{ color: 'var(--muted)' }}>{word}</span>
                )}
              </span>
            )
          })}
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ height: '2.5rem', background: 'linear-gradient(to top, var(--paper), transparent)' }} />
      </div>

      {/* ── Skip button ── */}
      <div className="flex justify-center">
        <button
          onClick={onSkipWord}
          disabled={!isTestActive}
          className="px-4 py-2 rounded-[var(--radius-btn)] text-xs font-semibold uppercase tracking-widest transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
          style={{ border: '1px solid var(--line)', color: 'var(--muted)', background: 'transparent', minHeight: '36px' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          Skip word
        </button>
      </div>
    </div>
  )
}
