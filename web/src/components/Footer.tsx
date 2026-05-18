export function Footer() {
  return (
    <footer className="shrink-0 h-10 flex items-center justify-center px-4 border-t border-[color:var(--line)] bg-[var(--dock)] backdrop-blur-md">
      <p className="text-[color:var(--muted)] text-xs text-center">
        Free &amp; open-source on{' '}
        <a
          href="https://freeappstore.online"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--color-cta)] hover:underline underline-offset-2 transition-colors"
        >
          FreeAppStore
        </a>
        {' '}· MIT License · No tracking · No accounts
      </p>
    </footer>
  )
}
