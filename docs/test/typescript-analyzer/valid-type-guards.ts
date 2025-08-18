// Valid: Type guard function with return type
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}
