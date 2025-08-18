// Valid: IIFE with return type
export const result = (function(): string {
  return 'immediate result'
})()

export const calculator = (function(): { add: (a: number, b: number) => number } {
  return {
    add: (a: number, b: number): number => a + b
  }
})()
