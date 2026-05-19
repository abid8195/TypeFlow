interface SettingsModalProps {
  isOpen:        boolean
  soundEnabled:  boolean
  onSoundToggle: (v: boolean) => void
  onClose:       () => void
}

export function SettingsModal({ isOpen, soundEnabled, onSoundToggle, onClose }: SettingsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fade-in_0.2s_ease-out]"
      style={{ background: 'var(--overlay)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]"
        style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Mobile drag handle */}
          <div className="flex justify-center mb-5 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line)' }} />
          </div>

          <h2 className="font-bold text-2xl text-center mb-6" style={{ fontFamily: "'Fraunces', Georgia, serif", color: 'var(--ink)' }}>
            About TypeFlow
          </h2>

          {/* Settings rows */}
          <div className="rounded-[var(--radius-btn)] overflow-hidden mb-6" style={{ border: '1px solid var(--line)' }}>

            {/* Sound toggle — interactive */}
            <div
              className="flex justify-between items-center px-4 py-3 text-sm"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <span style={{ color: 'var(--muted)' }}>Sound feedback</span>
              <button
                onClick={() => onSoundToggle(!soundEnabled)}
                className="relative w-11 h-6 rounded-full transition-all duration-200"
                style={{
                  background: soundEnabled ? 'var(--color-cta)' : 'var(--line)',
                  minHeight: '1.5rem',
                  minWidth: '2.75rem',
                }}
                aria-label={`Sound ${soundEnabled ? 'on' : 'off'}`}
                role="switch"
                aria-checked={soundEnabled}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-200"
                  style={{
                    background: 'var(--paper)',
                    transform: soundEnabled ? 'translateX(1.25rem)' : 'translateX(0)',
                  }}
                />
              </button>
            </div>

            {/* Info rows */}
            {([
              ['Storage',   'localStorage only', false],
              ['Tracking',  'None',              true],
              ['Analytics', 'None',              true],
              ['Accounts',  'Not required',      true],
              ['License',   'MIT',               false],
              ['Version',   '1.0.0',             false],
            ] as [string, string, boolean][]).map(([label, value, highlight], i, arr) => (
              <div
                key={label}
                className="flex justify-between items-center px-4 py-3 text-sm"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
              >
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="font-medium" style={{ color: highlight ? 'var(--success)' : 'var(--ink)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Privacy note */}
          <div className="rounded-[var(--radius-btn)] p-4 mb-6 text-center" style={{ background: 'color-mix(in srgb, var(--ink) 4%, transparent)', border: '1px solid var(--line)' }}>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              TypeFlow is free, offline-first, and open-source.<br />
              Your data stays in your browser — always.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-[var(--radius-btn)] font-bold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.97] transition-all duration-150 min-h-[44px]"
            style={{ background: 'var(--gradient-cta)', color: 'var(--paper)', boxShadow: 'var(--shadow-cta)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
