// Invalid: Type guard function missing return type
export function isString(value: unknown) {
  return typeof value === 'string'
}
