import { isValidCpf, maskCpf } from './cpf.ts'

export type Verdict = 'allow' | 'mask' | 'block'

export type FindingKind = 'manipulation' | 'invisible' | 'cpf' | 'email'

export type Finding = {
  kind: FindingKind
  /** Start and end offsets in the original text (end is exclusive). */
  start: number
  end: number
  /** Short explanation in plain Portuguese, shown to the visitor. */
  reason: string
}

export type Analysis = {
  verdict: Verdict
  findings: Finding[]
  /** What would reach the model: null when the message is blocked. */
  forwarded: string | null
}

type Rule = { pattern: RegExp; reason: string }

/**
 * Simplified rules for the browser demo. Patterns run on a normalized copy of
 * the text: lowercase, without accents and without invisible characters.
 */
const MANIPULATION_RULES: Rule[] = [
  {
    pattern:
      /\b(ignore|ignora|ignorar|esqueca|esquecer|desconsidere|desconsiderar)\b.{0,30}\b(instrucoes|instrucao|regras|orientacoes|diretrizes)\b/g,
    reason: 'Pede para a IA desobedecer as regras definidas pela empresa.',
  },
  {
    pattern:
      /\b(ignore|disregard|forget)\b.{0,30}\b(instructions|rules|guidelines)\b/g,
    reason: 'Pede para a IA desobedecer as regras definidas pela empresa.',
  },
  {
    pattern:
      /\b(finja|fingir|finge|aja como|agir como|voce agora e|a partir de agora voce e)\b.{0,30}\b(administrador|admin|desenvolvedor|sem regras|sem restricoes)\b/g,
    reason: 'Tenta fazer a IA assumir um papel com mais permissões.',
  },
  {
    pattern:
      /\b(pretend|act as|you are now)\b.{0,30}\b(admin|administrator|developer|unrestricted|dan)\b/g,
    reason: 'Tenta fazer a IA assumir um papel com mais permissões.',
  },
  {
    pattern:
      /\b(mostre|revele|repita|diga|imprima)\b.{0,30}\b(prompt|instrucoes internas|instrucoes do sistema|instrucoes iniciais)\b/g,
    reason: 'Tenta descobrir as instruções secretas da IA.',
  },
  {
    pattern:
      /\b(show|reveal|repeat|print)\b.{0,30}\b(system prompt|your instructions|initial instructions)\b/g,
    reason: 'Tenta descobrir as instruções secretas da IA.',
  },
  {
    pattern: /\b(modo desenvolvedor|developer mode|jailbreak)\b/g,
    reason: 'Tenta tirar a IA do modo seguro.',
  },
]

const INVISIBLE_CHARS = /[\u200B-\u200D\u2060\uFEFF]/
const CPF_PATTERN = /(?<!\d)(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})(?!\d)/g
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g

type Normalized = {
  text: string
  /** For each character of the normalized text, its offset in the original. */
  origin: number[]
}

/** Lowercases, removes accents and drops invisible characters, keeping offsets. */
function normalize(text: string): Normalized {
  let normalized = ''
  const origin: number[] = []
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (INVISIBLE_CHARS.test(char)) continue
    const base = char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    const out = base.length === 1 ? base : char.toLowerCase()
    for (const piece of out) {
      normalized += piece
      origin.push(i)
    }
  }
  return { text: normalized, origin }
}

function findManipulation(text: string): Finding[] {
  const { text: normalized, origin } = normalize(text)
  const findings: Finding[] = []
  for (const rule of MANIPULATION_RULES) {
    for (const match of normalized.matchAll(rule.pattern)) {
      const first = match.index
      const last = first + match[0].length - 1
      findings.push({
        kind: 'manipulation',
        start: origin[first],
        end: origin[last] + 1,
        reason: rule.reason,
      })
    }
  }
  return findings
}

function findInvisible(text: string): Finding[] {
  const findings: Finding[] = []
  for (let i = 0; i < text.length; i++) {
    if (INVISIBLE_CHARS.test(text[i])) {
      findings.push({
        kind: 'invisible',
        start: i,
        end: i + 1,
        reason: 'Caracteres invisíveis, que podem esconder instruções. Eles seriam removidos.',
      })
    }
  }
  return findings
}

function findPersonalData(text: string): Finding[] {
  const findings: Finding[] = []
  for (const match of text.matchAll(CPF_PATTERN)) {
    const digits = match.slice(1, 5).join('')
    if (isValidCpf(digits)) {
      findings.push({
        kind: 'cpf',
        start: match.index,
        end: match.index + match[0].length,
        reason: 'Um CPF válido. Ele seria escondido antes de chegar à IA.',
      })
    }
  }
  for (const match of text.matchAll(EMAIL_PATTERN)) {
    findings.push({
      kind: 'email',
      start: match.index,
      end: match.index + match[0].length,
      reason: 'Um e-mail. Ele seria escondido antes de chegar à IA.',
    })
  }
  return findings
}

function maskEmail(email: string): string {
  const at = email.indexOf('@')
  return `${email[0]}***${email.slice(at)}`
}

/** Builds the text that would reach the model, with personal data masked. */
function applyMasks(text: string, findings: Finding[]): string {
  const masks = findings
    .filter((f) => f.kind === 'cpf' || f.kind === 'email')
    .sort((a, b) => b.start - a.start)
  let result = text
  for (const finding of masks) {
    const original = text.slice(finding.start, finding.end)
    const replacement =
      finding.kind === 'cpf'
        ? maskCpf(original.replace(/\D/g, ''))
        : maskEmail(original)
    result =
      result.slice(0, finding.start) + replacement + result.slice(finding.end)
  }
  return result.replace(new RegExp(INVISIBLE_CHARS.source, 'g'), '')
}

/** Overlapping manipulation matches are merged so each phrase is shown once. */
function mergeOverlaps(findings: Finding[]): Finding[] {
  const sorted = [...findings].sort((a, b) => a.start - b.start)
  const merged: Finding[] = []
  for (const finding of sorted) {
    const previous = merged.at(-1)
    if (
      previous &&
      previous.kind === finding.kind &&
      finding.start < previous.end
    ) {
      previous.end = Math.max(previous.end, finding.end)
    } else {
      merged.push({ ...finding })
    }
  }
  return merged
}

export function analyze(text: string): Analysis {
  const findings = mergeOverlaps([
    ...findManipulation(text),
    ...findInvisible(text),
    ...findPersonalData(text),
  ])

  // Invisible characters alone are common in copied text, so they are only
  // removed. A block needs an actual manipulation attempt.
  const isBlocked = findings.some((f) => f.kind === 'manipulation')
  if (isBlocked) return { verdict: 'block', findings, forwarded: null }

  return {
    verdict: findings.length > 0 ? 'mask' : 'allow',
    findings,
    forwarded: applyMasks(text, findings),
  }
}
