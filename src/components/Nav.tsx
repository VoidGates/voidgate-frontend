import { Logo } from './Logo.tsx'
import { GITHUB_URL } from './links.ts'

export function Nav() {
  return (
    <header className="nav">
      <a href="#top" aria-label="VoidGate, início">
        <Logo />
      </a>
      <nav aria-label="Seções">
        <ul className="nav__links">
          <li>
            <a href="#teste">Teste um ataque</a>
          </li>
          <li>
            <a href="#como-funciona">Como funciona</a>
          </li>
          <li>
            <a href="#para-quem">Para quem</a>
          </li>
          <li>
            <a href={GITHUB_URL}>GitHub</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
