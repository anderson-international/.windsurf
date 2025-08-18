// Invalid: Deeply nested function missing return types
export function createNestedProcessor() {
  return {
    outer: {
      middle: {
        inner: (data: string) => {
          const processed = data.toUpperCase()
          return { processed, length: processed.length }
        }
      }
    }
  }
}
