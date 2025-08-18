// Invalid: Curried function missing return types
export function add(a: number) {
  return (b: number) => a + b
}
