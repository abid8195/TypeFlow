import { useEffect, useState } from 'react'
import {
  getSettings,
  saveSettings,
  getBestWPM,
  getTypingStreak,
  addToHistory,
  updateStats,
  updateTypingStreak,
} from '../utils/storage'

interface UserSettings {
  theme: 'dark' | 'light'
  testDuration: number
  difficulty: 'easy' | 'medium' | 'hard'
  soundEnabled: boolean
  selectedLanguage: string
}

/**
 * Hook for managing user settings with localStorage persistence
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load settings on mount
    const loaded = getSettings()
    setSettings(loaded)
    setIsLoading(false)
  }, [])

  const updateSetting = (key: keyof UserSettings, value: unknown) => {
    setSettings((prev) => {
      if (!prev) return prev
      const updated = { ...prev, [key]: value }
      saveSettings(updated)
      return updated
    })
  }

  return {
    settings,
    isLoading,
    updateSetting,
  }
}

/**
 * Hook for managing user statistics
 */
export function useStats() {
  const [bestWPM, setBestWPM] = useState(0)
  const [streak, setStreak] = useState({ current: 0, best: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setBestWPM(getBestWPM())
    const streakData = getTypingStreak()
    setStreak({ current: streakData.current, best: streakData.best })
    setIsLoading(false)
  }, [])

  const recordTest = (
    wpm: number,
    accuracy: number,
    typedCount: number,
    errors: number,
    difficulty: string
  ) => {
    updateStats(wpm, accuracy, typedCount)
    addToHistory(wpm, accuracy, Math.round(typedCount / 5), errors, difficulty)
    updateTypingStreak()

    // Update local state
    setBestWPM((prev) => Math.max(prev, wpm))
    const streakData = getTypingStreak()
    setStreak({ current: streakData.current, best: streakData.best })
  }

  return {
    bestWPM,
    streak,
    isLoading,
    recordTest,
  }
}
