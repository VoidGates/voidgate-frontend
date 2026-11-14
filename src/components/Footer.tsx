import { Logo } from './Logo.tsx'
import { GITHUB_URL } from './links.ts'

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <Logo size="footer" />
        <p>Feito no Amazonas para o HackBrasil 2026.</p>
      </div>
      <p className="footer__right">
        Josias, Kael, Matheus e Lucas
        <br />
        <a href={GITHUB_URL}>github.com/VoidGates</a>
      </p>
    </footer>
  )
}
