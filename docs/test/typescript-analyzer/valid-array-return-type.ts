// Valid: Function with array return type
export function getNumbers(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i)
}
