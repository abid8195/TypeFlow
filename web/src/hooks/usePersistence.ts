import { useEffect, useState, useCallback } from 'react'
import {
  getSettings,
  saveSettings,
  getBestWPM,
  getTypingStreak,
  getHistory,
  addToHistory,
  updateStats,
  updateTypingStreak,
  type TypingHistoryEntry,
  type UserSettings,
} from '../utils/storage'

// ─── Settings ─────────────────────────────────────────────────────────────────

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSettings(getSettings())
    setIsLoading(false)
  }, [])

  const updateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setSettings((prev) => {
        if (!prev) return prev
        const updated = { ...prev, [key]: value }
        saveSettings(updated)
        return updated
      })
    },
    [],
  )

  return { settings, isLoading, updateSetting }
}

// ─── Stats + streak ───────────────────────────────────────────────────────────

export function useStats() {
  const [bestWPM,  setBestWPM]  = useState(0)
  const [streak,   setStreak]   = useState({ current: 0, best: 0 })
  const [history,  setHistory]  = useState<TypingHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setBestWPM(getBestWPM())
    const s = getTypingStreak()
    setStreak({ current: s.current, best: s.best })
    setHistory(getHistory())
    setIsLoading(false)
  }, [])

  const recordTest = useCallback(
    (
      wpm: number,
      accuracy: number,
      typedCount: number,
      errors: number,
      difficulty: string,
      wpmSamples: number[] = [],
    ) => {
      updateStats(wpm, accuracy, typedCount)
      addToHistory(wpm, accuracy, Math.round(typedCount / 5), errors, difficulty, wpmSamples)
      updateTypingStreak()

      setBestWPM((prev) => Math.max(prev, wpm))
      const s = getTypingStreak()
      setStreak({ current: s.current, best: s.best })
      setHistory(getHistory())
    },
    [],
  )

  return { bestWPM, streak, history, isLoading, recordTest }
}
