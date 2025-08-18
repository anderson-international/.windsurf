// Invalid: Assertion function missing return type
export function assertIsString(value: unknown) {
  if (typeof value !== 'string') {
    throw new Error('Value is not a string')
  }
}
