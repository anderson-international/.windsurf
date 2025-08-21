// Formatting helpers used by UI components

export function ms(msValue: number | undefined): string {
  if (typeof msValue !== 'number' || !Number.isFinite(msValue)) return ''
  const s = (msValue / 1000).toFixed(1)
  return `${s}s`
}

export function formatWeightRange(min: unknown, max: unknown): string {
  const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  if (!isNum(min) || !isNum(max)) return ''
  const to2 = (n: number): string => n.toFixed(2)
  return `${to2(min)} to ${to2(max)} kg`
}

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
export function formatGBP(value: unknown): string {
  const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  if (!isNum(value)) return ''
  return gbpFmt.format(value)
}
