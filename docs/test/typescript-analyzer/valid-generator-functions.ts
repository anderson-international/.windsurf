// Valid: Generator function with return type
export function* numberGenerator(): Generator<number, void, unknown> {
  let i = 0
  while (i < 10) {
    yield i++
  }
}
