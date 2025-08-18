// Invalid: Function without union return type
export function parseValue(input: string) {
  if (input === '') return null
  const num = Number(input)
  return isNaN(num) ? input : num
}
