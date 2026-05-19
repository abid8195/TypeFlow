// ─── Storage schema version ───────────────────────────────────────────────────
// Bump when the shape of any stored object changes to trigger safe migration.
const SETTINGS_VERSION = 2

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredStats {
  bestWPM: number
  totalTests: number
  totalTyped: number
  averageAccuracy: number
}

export interface TypingHistoryEntry {
  id: string
  timestamp: number
  wpm: number
  accuracy: number
  duration: number
  errors: number
  difficulty: string
  wpmSamples: number[]   // per-second WPM snapshots during the test
}

export interface UserSettings {
  _v: number
  theme: 'dark' | 'light'
  testDuration: number
  difficulty: 'easy' | 'medium' | 'hard' | 'quotes'
  soundEnabled: boolean
  selectedLanguage: string
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  STATS:    'typeflow_stats',
  HISTORY:  'typeflow_history',
  SETTINGS: 'typeflow_settings',
  STREAK:   'typeflow_streak',
} as const

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  _v: SETTINGS_VERSION,
  theme: 'dark',
  testDuration: 60,
  difficulty: 'medium',
  soundEnabled: true,
  selectedLanguage: 'en',
}

// ─── Safe JSON read ───────────────────────────────────────────────────────────

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — degrade silently
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export function getSettings(): UserSettings {
  const stored = safeRead<UserSettings>(KEYS.SETTINGS)
  // Re-use stored values only when the schema version matches
  if (stored && stored._v === SETTINGS_VERSION) {
    return { ...DEFAULT_SETTINGS, ...stored }
  }
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  const current = getSettings()
  safeWrite(KEYS.SETTINGS, { ...current, ...settings, _v: SETTINGS_VERSION })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const DEFAULT_STATS: StoredStats = { bestWPM: 0, totalTests: 0, totalTyped: 0, averageAccuracy: 0 }

export function getStats(): StoredStats {
  return safeRead<StoredStats>(KEYS.STATS) ?? { ...DEFAULT_STATS }
}

export function getBestWPM(): number {
  return getStats().bestWPM
}

export function updateStats(wpm: number, accuracy: number, typedCount: number): void {
  const s = getStats()
  s.bestWPM       = Math.max(s.bestWPM, wpm)
  s.totalTests   += 1
  s.totalTyped   += typedCount
  s.averageAccuracy = (s.averageAccuracy * (s.totalTests - 1) + accuracy) / s.totalTests
  safeWrite(KEYS.STATS, s)
}

// ─── History (last 20 tests) ──────────────────────────────────────────────────

const MAX_HISTORY = 20

export function getHistory(): TypingHistoryEntry[] {
  return safeRead<TypingHistoryEntry[]>(KEYS.HISTORY) ?? []
}

export function addToHistory(
  wpm: number,
  accuracy: number,
  duration: number,
  errors: number,
  difficulty: string,
  wpmSamples: number[] = [],
): void {
  const history = getHistory()
  const entry: TypingHistoryEntry = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    wpm,
    accuracy,
    duration,
    errors,
    difficulty,
    wpmSamples,
  }
  history.push(entry)
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY)
  safeWrite(KEYS.HISTORY, history)
}

// ─── Streak ───────────────────────────────────────────────────────────────────

interface StreakData { current: number; best: number; lastTestDate: number }
const DEFAULT_STREAK: StreakData = { current: 0, best: 0, lastTestDate: 0 }

export function getTypingStreak(): StreakData {
  return safeRead<StreakData>(KEYS.STREAK) ?? { ...DEFAULT_STREAK }
}

export function updateTypingStreak(): void {
  const streak = getTypingStreak()
  const now    = Date.now()
  const DAY_MS = 86_400_000

  if (streak.lastTestDate === 0) {
    streak.current = 1
  } else {
    const elapsed = now - streak.lastTestDate
    if (elapsed < DAY_MS) {
      // Same calendar day — streak unchanged
    } else if (elapsed < DAY_MS * 2) {
      // Consecutive day
      streak.current += 1
    } else {
      // Missed a day — reset
      streak.current = 1
    }
  }

  streak.best         = Math.max(streak.best, streak.current)
  streak.lastTestDate = now
  safeWrite(KEYS.STREAK, streak)
}
