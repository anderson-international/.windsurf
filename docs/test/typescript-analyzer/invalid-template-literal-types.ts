// Invalid: Function with template literal return type missing annotation
export function createEventName(prefix: string) {
  return `${prefix}Event`
}
