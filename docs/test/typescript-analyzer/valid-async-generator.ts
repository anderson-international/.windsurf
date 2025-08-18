// Valid: Async generator function with return type
export async function* asyncNumberGenerator(): AsyncGenerator<number, void, unknown> {
  let i = 0
  while (i < 10) {
    await new Promise(resolve => setTimeout(resolve, 100))
    yield i++
  }
}
