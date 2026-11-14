import { useState } from 'react'

const STEPS = [
  {
    title: 'Sua aplicação envia',
    text: 'O chatbot manda a mensagem do cliente para o VoidGate.',
    status: 'recebendo',
  },
  {
    title: 'O VoidGate confere',
    text: 'Procura manipulação e dados pessoais, e decide: liberar, esconder ou bloquear.',
    status: 'conferindo a mensagem',
  },
  {
    title: 'A IA responde',
    text: 'Só o que é seguro chega ao modelo.',
    status: 'mensagem liberada',
  },
  {
    title: 'A resposta é conferida',
    text: 'Se a IA tentar devolver um dado sensível, ele é escondido.',
    status: 'conferindo a resposta',
  },
]

const MODELS = ['Modelo na nuvem', 'Modelo da empresa', 'Modelo local']

/** Where the moving dot sits in the diagram for each step. */
const DOT_POSITION = [
  { x: 235, y: 100 },
  { x: 380, y: 166 },
  { x: 525, y: 100 },
  { x: 235, y: 140 },
]

export function HowItWorks() {
  const [step, setStep] = useState(1)
  const [model, setModel] = useState(MODELS[0])
  const dot = DOT_POSITION[step]

  return (
    <section className="section" id="como-funciona">
      <div className="wrap">
        <h2 className="section__title">Como funciona</h2>
        <p className="lead">
          Basta trocar um endereço na configuração. Clique em cada etapa.
        </p>

        <div className="how">
          <ol className="how__steps">
            {STEPS.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  className="how__step"
                  aria-pressed={step === index}
                  onClick={() => setStep(index)}
                >
                  <span className="how__number">{index + 1}</span>
                  <b>{item.title}</b>
                  <span className="how__text">{item.text}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="panel how__panel">
            <svg
              className="how__diagram"
              viewBox="0 0 760 220"
              role="img"
              aria-label={`Etapa ${step + 1}: ${STEPS[step].title}. ${model} conectado ao VoidGate.`}
            >
              <line
                className={`how__line ${step === 0 ? 'is-active' : ''}`}
                x1="180"
                y1="100"
                x2="290"
                y2="100"
              />
              <line
                className={`how__line ${step === 2 ? 'is-active' : ''}`}
                x1="470"
                y1="100"
                x2="580"
                y2="100"
              />
              <line
                className={`how__line how__line--return ${step === 3 ? 'is-active' : ''}`}
                x1="180"
                y1="140"
                x2="580"
                y2="140"
              />

              <rect className="how__node" x="0" y="70" width="180" height="90" rx="18" />
              <text className="how__label" x="90" y="121" textAnchor="middle">
                Sua aplicação
              </text>

              <rect
                className={`how__gate ${step === 1 || step === 3 ? 'is-busy' : ''}`}
                x="290"
                y="45"
                width="180"
                height="140"
                rx="22"
              />
              <text className="how__gate-title" x="380" y="108" textAnchor="middle">
                VoidGate
              </text>
              <text className="how__gate-status" x="380" y="134" textAnchor="middle">
                {STEPS[step].status}
              </text>

              <rect className="how__node" x="580" y="70" width="180" height="90" rx="18" />
              <text className="how__label" x="670" y="121" textAnchor="middle">
                {model}
              </text>

              <circle
                className="how__dot"
                r="8"
                style={{ transform: `translate(${dot.x}px, ${dot.y}px)` }}
              />
            </svg>

            <p className="note">
              Funciona com qualquer modelo. Troque e veja que nada muda no
              VoidGate:
            </p>
            <div className="chips" role="group" aria-label="Modelo de IA">
              {MODELS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="chip"
                  aria-pressed={model === name}
                  onClick={() => setModel(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
