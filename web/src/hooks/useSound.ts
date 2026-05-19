import { useCallback, useRef } from 'react'

type SoundType = 'wordCorrect' | 'wordError' | 'testEnd'

interface SoundConfig {
  frequency: number
  duration: number   // seconds
  volume: number
  type: OscillatorType
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  wordCorrect: { frequency: 880,  duration: 0.06, volume: 0.06, type: 'sine'     },
  wordError:   { frequency: 200,  duration: 0.10, volume: 0.10, type: 'sawtooth' },
  testEnd:     { frequency: 660,  duration: 0.18, volume: 0.08, type: 'sine'     },
}

/**
 * Thin wrapper around Web Audio API for in-app sound feedback.
 * Creates a fresh AudioContext per sound to avoid state issues.
 * Fails silently if the browser blocks audio (e.g. no user gesture yet).
 */
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return
      try {
        // Reuse or create AudioContext
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
          ctxRef.current = new AudioContext()
        }
        const ctx = ctxRef.current
        if (ctx.state === 'suspended') ctx.resume()

        const cfg  = SOUNDS[type]
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type            = cfg.type
        osc.frequency.value = cfg.frequency

        const now = ctx.currentTime
        gain.gain.setValueAtTime(cfg.volume, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + cfg.duration)

        osc.start(now)
        osc.stop(now + cfg.duration)
      } catch {
        // Audio unavailable — silent degradation
      }
    },
    [enabled],
  )

  return { play }
}
