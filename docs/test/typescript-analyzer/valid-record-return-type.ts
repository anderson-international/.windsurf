// Valid: Function with Record return type
export function createMapping(keys: string[]): Record<string, boolean> {
  return keys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
}
