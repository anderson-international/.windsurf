// Valid: Function with template literal return type
export function createEventName(prefix: string): `${string}Event` {
  return `${prefix}Event`
}
