// Invalid: IIFE missing return type
export const result = (function() {
  return 'immediate result'
})()

export const calculator = (function() {
  return {
    add: (a: number, b: number) => a + b
  }
})()
