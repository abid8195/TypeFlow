interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
      style={{ background: 'var(--overlay)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[color:var(--panel)] shadow-2xl p-7 animate-[slide-up_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[color:var(--ink)] text-center mb-6">
          Settings
        </h2>

        <div className="space-y-4 mb-6">
          <Row label="Theme"    value="Dark (always)" />
          <Row label="Storage"  value="localStorage only" />
          <Row label="Tracking" value="None" />
          <Row label="Analytics"value="None" />
          <Row label="Accounts" value="Not required" />
          <Row label="Version"  value="1.0.0" />
        </div>

        <div className="rounded-xl bg-[color:var(--glass)] border border-[color:var(--line)] p-3 mb-6">
          <p className="text-[color:var(--muted)] text-xs text-center leading-relaxed">
            TypeFlow is free, offline-first, and open-source.<br />
            Your data stays in your browser — always.
          </p>
        </div>

        <button
          onClick={onClose}
          style={{ background: 'var(--gradient-cta)', color: 'var(--paper)' }}
          className="w-full py-3 rounded-[var(--radius-btn)] font-bold text-sm hover:opacity-90 transition-all duration-200 min-h-[44px]"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-[color:var(--line)] pb-3 last:border-0 last:pb-0">
      <span className="text-[color:var(--muted)]">{label}</span>
      <span className="font-medium text-[color:var(--success)]">{value}</span>
    </div>
  )
}
