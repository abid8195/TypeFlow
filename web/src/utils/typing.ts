import { quotesPool } from '../data/words'

// ─── Named constants ──────────────────────────────────────────────────────────

export const WORD_BUFFER_SIZE  = 150    // words generated at test start
export const MIN_ELAPSED_MINS  = 0.016  // floor ~1 second to avoid div-by-zero
export const STATS_INTERVAL_MS = 200    // live-stats update frequency

// ─── WPM / accuracy ──────────────────────────────────────────────────────────

export function calculateWPM(words: number, minutes: number): number {
  if (minutes === 0) return 0
  return Math.round(words / minutes)
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100
  return Math.round((correct / total) * 1000) / 10
}

// ─── Word generation ─────────────────────────────────────────────────────────

/** Random words from a pool — used for easy / medium / hard modes. */
export function generateWords(wordPool: string[], count: number): string[] {
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    words.push(wordPool[Math.floor(Math.random() * wordPool.length)])
  }
  return words
}

/**
 * Words stitched from real quotes in sequence.
 * Picks quotes at random, concatenates their words until `count` words are reached.
 * Used for "quotes" difficulty mode.
 */
export function generateQuoteWords(count: number): string[] {
  if (quotesPool.length === 0) return []
  const words: string[] = []
  while (words.length < count) {
    const quote = quotesPool[Math.floor(Math.random() * quotesPool.length)]
    words.push(...quote)
  }
  return words.slice(0, count)
}

// ─── Text comparison ─────────────────────────────────────────────────────────

export function compareText(
  original: string,
  typed: string,
): { correct: number; incorrect: number; total: number } {
  let correct = 0, incorrect = 0
  for (let i = 0; i < original.length; i++) {
    i < typed.length
      ? (typed[i] === original[i] ? correct++ : incorrect++)
      : incorrect++
  }
  if (typed.length > original.length) incorrect += typed.length - original.length
  return { correct, incorrect, total: correct + incorrect }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
