import { useCallback, useEffect, useRef, useState } from 'react'
import { generateWords } from '../utils/typing'
import { difficulties } from '../data/words'

interface UseTypingTestOptions {
  duration: number
  difficulty: 'easy' | 'medium' | 'hard'
  onTestComplete?: (results: TestResults) => void
}

export interface TestResults {
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
  totalChars: number
  duration: number
}

interface TypingState {
  testWords: string[]
  userInput: string
  currentWordIndex: number
  isTestActive: boolean
  timeRemaining: number
  startTime: number | null
  duration?: number
}

/**
 * Hook for managing typing test state and calculations
 */
export function useTypingTest(options: UseTypingTestOptions) {
  const { duration, difficulty, onTestComplete } = options

  const [state, setState] = useState<TypingState>({
    testWords: [],
    userInput: '',
    currentWordIndex: 0,
    isTestActive: false,
    timeRemaining: duration,
    startTime: null,
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wordPoolRef = useRef(difficulties[difficulty].wordPool)

  // Initialize test
  const startTest = useCallback(() => {
    const wordPool = difficulties[difficulty].wordPool
    const words = generateWords(wordPool, 100) // Generate enough words for longest test
    wordPoolRef.current = wordPool

    setState({
      testWords: words,
      userInput: '',
      currentWordIndex: 0,
      isTestActive: true,
      timeRemaining: duration,
      startTime: Date.now(),
      duration,
    })
  }, [difficulty, duration])

  // Handle user input
  const handleInput = useCallback((input: string) => {
    if (!state.isTestActive) return

    setState((prevState) => {
      const newUserInput = input

      // Auto-advance to next word when space is typed
      if (
        newUserInput.endsWith(' ') &&
        prevState.currentWordIndex < prevState.testWords.length - 1
      ) {
        return {
          ...prevState,
          userInput: '',
          currentWordIndex: prevState.currentWordIndex + 1,
        }
      }

      return {
        ...prevState,
        userInput: newUserInput,
      }
    })
  }, [state.isTestActive])

  // Timer effect
  useEffect(() => {
    if (!state.isTestActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      return
    }

    timerRef.current = setInterval(() => {
      setState((prevState) => {
        const newTimeRemaining = prevState.timeRemaining - 1

        if (newTimeRemaining <= 0) {
          // Test complete
          const results = calculateResults(prevState)
          onTestComplete?.(results)
          return {
            ...prevState,
            isTestActive: false,
            timeRemaining: 0,
          }
        }

        return {
          ...prevState,
          timeRemaining: newTimeRemaining,
        }
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [state.isTestActive, onTestComplete])

  const restartTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    startTest()
  }, [startTest])

  const skipWord = useCallback(() => {
    if (state.currentWordIndex < state.testWords.length - 1) {
      setState((prev) => ({
        ...prev,
        userInput: '',
        currentWordIndex: prev.currentWordIndex + 1,
      }))
    }
  }, [state.currentWordIndex, state.testWords.length])

  return {
    ...state,
    startTest,
    handleInput,
    restartTest,
    skipWord,
  }
}

/**
 * Calculate test results
 */
function calculateResults(state: TypingState): TestResults {
  const elapsedSeconds =
    state.startTime ? (Date.now() - state.startTime) / 1000 : state.duration || 60
  const elapsedMinutes = Math.max(elapsedSeconds / 60, 0.016) // Minimum 1 second

  // Count correctly typed words
  let correctWords = 0
  let totalErrors = 0
  let correctChars = 0
  let totalChars = 0

  for (let i = 0; i <= state.currentWordIndex && i < state.testWords.length; i++) {
    const testWord = state.testWords[i]
    const userWord = i === state.currentWordIndex ? state.userInput.trim() : ''

    totalChars += testWord.length
    if (i < state.currentWordIndex) {
      if (state.userInput === testWord) {
        correctWords++
        correctChars += testWord.length
      } else {
        totalErrors += Math.abs(testWord.length - userWord.length)
      }
    }
  }

  const wpm = Math.max(0, Math.round((correctWords / elapsedMinutes) * 100) / 100)
  const accuracy =
    totalChars > 0
      ? Math.max(0, Math.round(((totalChars - totalErrors) / totalChars) * 1000) / 10)
      : 100

  return {
    wpm: Math.max(0, wpm),
    accuracy: Math.min(100, accuracy),
    errors: totalErrors,
    correctChars,
    totalChars,
    duration: Math.round(elapsedSeconds),
  }
}

interface UseTimerOptions {
  duration: number
  isActive: boolean
  onComplete?: () => void
}

/**
 * Hook for managing test timer
 */
export function useTimer(options: UseTimerOptions) {
  const { duration, isActive, onComplete } = options
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      return
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive, onComplete])

  const reset = useCallback(() => {
    setTimeRemaining(duration)
  }, [duration])

  return { timeRemaining, reset }
}
