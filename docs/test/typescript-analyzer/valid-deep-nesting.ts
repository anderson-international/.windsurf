// Valid: Deeply nested function with return types
export function createNestedProcessor(): {
  outer: {
    middle: {
      inner: (data: string) => { processed: string; length: number }
    }
  }
} {
  return {
    outer: {
      middle: {
        inner: (data: string): { processed: string; length: number } => {
          const processed = data.toUpperCase()
          return { processed, length: processed.length }
        }
      }
    }
  }
}
