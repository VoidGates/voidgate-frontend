/** Returns true when the 11 digits form a CPF with valid check digits. */
export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) return false
  // Sequences like 111.111.111-11 pass the checksum but are not real CPFs.
  if (/^(\d)\1{10}$/.test(digits)) return false

  const nums = [...digits].map(Number)
  const checkDigit = (length: number) => {
    let sum = 0
    for (let i = 0; i < length; i++) sum += nums[i] * (length + 1 - i)
    return ((sum * 10) % 11) % 10
  }
  return checkDigit(9) === nums[9] && checkDigit(10) === nums[10]
}

/** Keeps only the last two digits: 529.982.247-25 becomes ***.***.***-25. */
export function maskCpf(digits: string): string {
  return `***.***.***-${digits.slice(9)}`
}
