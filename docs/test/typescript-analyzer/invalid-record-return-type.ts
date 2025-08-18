// Invalid: Function with Record return type missing annotation
export function createMapping(keys: string[]) {
  return keys.reduce((acc, key) => ({ ...acc, [key]: true }), {})
}
