// Invalid: Generator function missing return type
export function* numberGenerator() {
  let i = 0
  while (i < 10) {
    yield i++
  }
}
