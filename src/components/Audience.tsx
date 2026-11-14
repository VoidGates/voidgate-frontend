import { GITHUB_URL } from './links.ts'

const AUDIENCES = [
  {
    title: 'Startups e PMEs',
    text: 'Colocam um chatbot no ar sem correr o risco de vazar dados de clientes.',
  },
  {
    title: 'Órgãos públicos',
    text: 'Usam IA no atendimento com registro do que foi bloqueado, como pede a LGPD.',
  },
  {
    title: 'Desenvolvedores',
    text: 'Trocam uma URL e ganham uma camada de proteção que entende português.',
  },
]

export function Audience() {
  return (
    <section className="section" id="para-quem">
      <div className="wrap">
        <h2 className="section__title">
          Feito para quem não tem um time de segurança.
        </h2>
        <div className="audience">
          {AUDIENCES.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="oss">
          <div>
            <h2 className="oss__title">Aberto para qualquer um conferir.</h2>
            <p className="lead">
              Em segurança, ninguém deveria confiar numa caixa-preta. O código
              do VoidGate é público, e qualquer pessoa pode propor novas regras
              de proteção.
            </p>
            <a className="btn btn--ghost" href={GITHUB_URL}>
              Ver o código no GitHub
            </a>
          </div>
          <pre className="oss__rule" aria-label="Exemplo de regra de proteção">
            <span className="k">- id:</span> <span className="s">ignorar-instrucoes</span>
            {'\n'}
            <span className="k">  quando:</span> pedido para ignorar as regras
            {'\n'}
            <span className="k">  acao:</span> <span className="s">bloquear</span>
            {'\n'}
            <span className="k">  exemplos:</span> ataques e textos legítimos
          </pre>
        </div>
      </div>
    </section>
  )
}
