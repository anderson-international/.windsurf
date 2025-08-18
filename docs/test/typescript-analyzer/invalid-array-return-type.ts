// Invalid: Function with array return type missing annotation
export function getNumbers(count: number) {
  return Array.from({ length: count }, (_, i) => i)
}
