interface NavbarProps {
  bestWPM: number
  streak: number
  onSettingsClick: () => void
}

export function Navbar({ onSettingsClick }: NavbarProps) {
  return (
    <nav
      className="shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40"
      style={{ borderBottom: '1px solid var(--line)', background: 'var(--dock)', backdropFilter: 'blur(12px)' }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--gradient-cta)', boxShadow: 'var(--shadow-cta)' }}
        >
          <span
            className="font-bold text-base leading-none"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: 'var(--paper)' }}
          >
            T
          </span>
        </div>
        <span
          className="font-bold text-lg"
          style={{ fontFamily: "'Fraunces', Georgia, serif", background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          TypeFlow
        </span>
      </div>

      {/* Settings */}
      <button
        onClick={onSettingsClick}
        className="w-9 h-9 rounded-[var(--radius-btn)] flex items-center justify-center transition-all duration-150 active:scale-95"
        style={{ border: '1px solid var(--line)', background: 'transparent' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        aria-label="Settings"
      >
        <svg className="w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </nav>
  )
}
