// Invalid: Async generator function missing return type
export async function* asyncNumberGenerator() {
  let i = 0
  while (i < 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    yield i++
  }
}
