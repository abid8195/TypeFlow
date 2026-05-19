export function Footer() {
  return (
    <footer
      className="shrink-0 h-9 flex items-center justify-center px-4"
      style={{ borderTop: '1px solid var(--line)' }}
    >
      <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
        Free &amp; open-source ·{' '}
        <a
          href="https://freeappstore.online"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline underline-offset-2 transition-colors duration-150"
          style={{ color: 'var(--color-cta)' }}
        >
          FreeAppStore
        </a>
        {' '}· MIT · No tracking
      </p>
    </footer>
  )
}
