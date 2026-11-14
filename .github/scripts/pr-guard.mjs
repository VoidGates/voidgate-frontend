// Scans a unified diff (stdin) for signs of malicious or dangerous changes.
// Prints a Markdown report; exits 1 when any "block" finding is present.
import { readFileSync, appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const RULES = [
  // block: almost never legitimate in this repo
  { level: 'block', name: 'Chave privada', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { level: 'block', name: 'Token AWS', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { level: 'block', name: 'Token GitHub', re: /\b(gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/ },
  { level: 'block', name: 'Token Slack', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { level: 'block', name: 'Segredo hardcoded', re: /(api[_-]?key|secret|passw(or)?d|token)["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i },
  { level: 'block', name: 'Download executado no shell', re: /\b(curl|wget)\b[^\n|]*\|\s*(sudo\s+)?(ba|z)?sh\b/ },
  { level: 'block', name: 'Código decodificado executado', re: /\b(eval|Function)\s*\(\s*(atob|Buffer\.from|unescape|decodeURIComponent)\s*\(/ },
  { level: 'block', name: 'Caractere Unicode invisível (Trojan Source)', re: /[‪-‮⁦-⁩​⁠]/ },
  { level: 'block', name: 'Hook de instalação npm', file: /(^|\/)package\.json$/, re: /"(pre|post)?install"\s*:/ },
  { level: 'block', name: 'Pacote baixado fora do registry npm', file: /(^|\/)package-lock\.json$/, re: /"resolved":\s*"(?!https:\/\/registry\.npmjs\.org\/)/ },
  { level: 'block', name: 'Troca de registry npm', file: /(^|\/)\.npmrc$/, re: /registry\s*=/ },
  // warn: legitimate sometimes, needs a human look
  { level: 'warn', name: 'eval / new Function', re: /\beval\s*\(|\bnew Function\s*\(/ },
  { level: 'warn', name: 'child_process', re: /child_process/ },
  { level: 'warn', name: 'Blob base64/hex longo (possível payload ofuscado)', re: /[A-Za-z0-9+/=]{200,}|(\\x[0-9a-f]{2}){30,}/i },
  { level: 'warn', name: 'Workflow usa pull_request_target', file: /^\.github\/workflows\//, re: /pull_request_target/ },
  { level: 'warn', name: 'Workflow acessa secrets', file: /^\.github\/workflows\//, re: /\$\{\{\s*secrets\./ },
]

const SENSITIVE_PATHS = [
  [/^\.github\//, 'Altera CI/CD (.github/) — revise com atenção redobrada'],
  [/(^|\/)package\.json$/, 'Altera dependências ou scripts npm'],
  [/(^|\/)vite\.config\.[jt]s$/, 'Altera a configuração do build'],
]

export function scan(diff) {
  const findings = []
  const files = new Set()
  let file = null
  let line = 0
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++ ')) {
      file = raw === '+++ /dev/null' ? null : raw.slice(6)
      if (file) files.add(file)
      continue
    }
    const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
    if (hunk) { line = Number(hunk[1]); continue }
    const bin = raw.match(/^Binary files .* and b\/(.+) differ$/)
    if (bin) { findings.push({ level: 'warn', name: 'Arquivo binário', file: bin[1], line: 0 }); continue }
    if (!file || raw.startsWith('---')) continue
    if (raw.startsWith('+')) {
      const text = raw.slice(1)
      for (const r of RULES) {
        if (r.file && !r.file.test(file)) continue
        if (r.re.test(text)) findings.push({ level: r.level, name: r.name, file, line })
      }
      line++
    } else if (!raw.startsWith('-') && !raw.startsWith('\\')) line++
  }
  for (const f of files)
    for (const [re, why] of SENSITIVE_PATHS)
      if (re.test(f)) findings.push({ level: 'warn', name: why, file: f, line: 0 })
  return findings
}

export function report(findings) {
  const blocks = findings.filter(f => f.level === 'block')
  const head = blocks.length
    ? `## 🚫 PR Guard: ${blocks.length} problema(s) bloqueante(s)\nEste PR não pode ser mergeado até os itens 🚫 serem removidos.`
    : findings.length
      ? '## ⚠️ PR Guard: revisão humana necessária\nNada bloqueante, mas o aprovador deve conferir os pontos abaixo.'
      : '## ✅ PR Guard: nenhum padrão suspeito encontrado\nAinda precisa da aprovação de outro membro.'
  const rows = findings.map(f =>
    `| ${f.level === 'block' ? '🚫' : '⚠️'} | ${f.name} | \`${f.file}${f.line ? `:${f.line}` : ''}\` |`)
  return [head, ...(rows.length ? ['', '| | Regra | Onde |', '|---|---|---|', ...rows] : [])].join('\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = scan(readFileSync(0, 'utf8'))
  const md = report(findings)
  console.log(md)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + '\n')
  process.exit(findings.some(f => f.level === 'block') ? 1 : 0)
}
