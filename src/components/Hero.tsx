import { HeroFlow } from './HeroFlow.tsx'
import { GITHUB_URL } from './links.ts'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__text">
        <h1>O firewall que fala a língua da IA.</h1>
        <p className="lead">
          O VoidGate fica entre o seu chatbot e o modelo de IA. Ele barra quem
          tenta manipular a IA e esconde dados pessoais antes que eles vazem.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#teste">
            Testar um ataque
          </a>
          <a className="btn btn--ghost" href={GITHUB_URL}>
            Ver o código no GitHub
          </a>
        </div>
      </div>
      <HeroFlow />
    </section>
  )
}
