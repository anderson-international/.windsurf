// Valid: Function with union return type
export function parseValue(input: string): string | number | null {
  if (input === '') return null
  const num = Number(input)
  return isNaN(num) ? input : num
}
