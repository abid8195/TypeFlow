// Local storage utility functions for persistence

interface StoredStats {
  bestWPM: number
  totalTests: number
  totalTyped: number
  averageAccuracy: number
}

interface TypingHistory {
  id: string
  timestamp: number
  wpm: number
  accuracy: number
  duration: number
  errors: number
  difficulty: string
}

interface UserSettings {
  theme: 'dark' | 'light'
  testDuration: number
  difficulty: 'easy' | 'medium' | 'hard'
  soundEnabled: boolean
  selectedLanguage: string
}

const STORAGE_KEYS = {
  BEST_WPM: 'typeflow_best_wpm',
  STATS: 'typeflow_stats',
  HISTORY: 'typeflow_history',
  SETTINGS: 'typeflow_settings',
  TYPING_STREAK: 'typeflow_streak',
}

// Default settings
const defaultSettings: UserSettings = {
  theme: 'dark',
  testDuration: 60,
  difficulty: 'medium',
  soundEnabled: true,
  selectedLanguage: 'en',
}

/**
 * Get best WPM from localStorage
 */
export function getBestWPM(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BEST_WPM)
    return stored ? parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

/**
 * Save best WPM to localStorage
 */
export function saveBestWPM(wpm: number): void {
  try {
    const current = getBestWPM()
    if (wpm > current) {
      localStorage.setItem(STORAGE_KEYS.BEST_WPM, wpm.toString())
    }
  } catch {
    // Silently fail - storage might be disabled
  }
}

/**
 * Get typing statistics from localStorage
 */
export function getStats(): StoredStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Silently fail
  }

  return {
    bestWPM: 0,
    totalTests: 0,
    totalTyped: 0,
    averageAccuracy: 0,
  }
}

/**
 * Update statistics after test completion
 */
export function updateStats(wpm: number, accuracy: number, typedCount: number): void {
  try {
    const stats = getStats()
    stats.bestWPM = Math.max(stats.bestWPM, wpm)
    stats.totalTests += 1
    stats.totalTyped += typedCount
    stats.averageAccuracy =
      (stats.averageAccuracy * (stats.totalTests - 1) + accuracy) / stats.totalTests

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  } catch {
    // Silently fail
  }
}

/**
 * Get typing history from localStorage
 */
export function getHistory(): TypingHistory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Silently fail
  }

  return []
}

/**
 * Add new test result to history
 */
export function addToHistory(
  wpm: number,
  accuracy: number,
  duration: number,
  errors: number,
  difficulty: string
): void {
  try {
    const history = getHistory()
    const newEntry: TypingHistory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      wpm,
      accuracy,
      duration,
      errors,
      difficulty,
    }

    history.push(newEntry)
    // Keep only last 100 tests
    if (history.length > 100) {
      history.shift()
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
  } catch {
    // Silently fail
  }
}

/**
 * Get user settings from localStorage
 */
export function getSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) }
    }
  } catch {
    // Silently fail
  }

  return defaultSettings
}

/**
 * Save user settings to localStorage
 */
export function saveSettings(settings: Partial<UserSettings>): void {
  try {
    const current = getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
  } catch {
    // Silently fail
  }
}

/**
 * Get typing streak information
 */
export function getTypingStreak(): { current: number; best: number; lastTestDate: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TYPING_STREAK)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Silently fail
  }

  return { current: 0, best: 0, lastTestDate: 0 }
}

/**
 * Update typing streak
 */
export function updateTypingStreak(): void {
  try {
    const streak = getTypingStreak()
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000
    const timeSinceLastTest = now - streak.lastTestDate

    if (timeSinceLastTest < dayInMs && streak.lastTestDate !== 0) {
      // Same day, don't increment
    } else if (timeSinceLastTest < 2 * dayInMs || streak.lastTestDate === 0) {
      // Within 48 hours (allows for timezone variance), or first test
      streak.current += 1
      streak.best = Math.max(streak.best, streak.current)
    } else {
      // More than 48 hours, reset streak
      streak.current = 1
    }

    streak.lastTestDate = now
    localStorage.setItem(STORAGE_KEYS.TYPING_STREAK, JSON.stringify(streak))
  } catch {
    // Silently fail
  }
}

/**
 * Clear all stored data (for development/testing)
 */
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch {
    // Silently fail
  }
}
