// Utility functions for typing test calculations

/**
 * Calculate words per minute
 * @param words - Number of words typed
 * @param minutes - Time elapsed in minutes
 * @returns WPM rounded to nearest integer
 */
export function calculateWPM(words: number, minutes: number): number {
  if (minutes === 0) return 0
  return Math.round(words / minutes)
}

/**
 * Calculate accuracy percentage
 * @param correct - Number of correct characters
 * @param total - Total number of characters typed
 * @returns Accuracy percentage rounded to 1 decimal
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100
  return Math.round((correct / total) * 1000) / 10
}

/**
 * Generate random words from word pool
 * @param wordPool - Array of words to choose from
 * @param count - Number of words to generate
 * @returns Array of random words
 */
export function generateWords(wordPool: string[], count: number): string[] {
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    words.push(wordPool[Math.floor(Math.random() * wordPool.length)])
  }
  return words
}

/**
 * Compare typed text with original text character by character
 * @param original - Original text
 * @param typed - Text typed by user
 * @returns Object with correct and incorrect counts
 */
export function compareText(original: string, typed: string): {
  correct: number
  incorrect: number
  total: number
} {
  let correct = 0
  let incorrect = 0

  for (let i = 0; i < original.length; i++) {
    if (i < typed.length) {
      if (typed[i] === original[i]) {
        correct++
      } else {
        incorrect++
      }
    } else {
      incorrect++
    }
  }

  if (typed.length > original.length) {
    incorrect += typed.length - original.length
  }

  return {
    correct,
    incorrect,
    total: correct + incorrect,
  }
}

/**
 * Calculate gross WPM (without accuracy penalty)
 * @param typedCharacters - Total characters typed
 * @param minutes - Time elapsed in minutes
 * @returns Gross WPM
 */
export function calculateGrossWPM(typedCharacters: number, minutes: number): number {
  const words = typedCharacters / 5 // Standard: 5 chars = 1 word
  return calculateWPM(words, minutes)
}

/**
 * Calculate net WPM (with accuracy penalty)
 * @param typedCharacters - Total characters typed
 * @param errors - Number of errors
 * @param minutes - Time elapsed in minutes
 * @returns Net WPM (minimum 0)
 */
export function calculateNetWPM(typedCharacters: number, errors: number, minutes: number): number {
  const grossWPM = calculateGrossWPM(typedCharacters, minutes)
  const errorPenalty = (errors / minutes)
  return Math.max(0, grossWPM - errorPenalty)
}

/**
 * Format time for display (mm:ss)
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get keystroke sound feedback (for accessibility)
 * @param isCorrect - Whether keystroke was correct
 * @returns Sound type identifier
 */
export function getKeystrokeSound(isCorrect: boolean): 'correct' | 'error' {
  return isCorrect ? 'correct' : 'error'
}
