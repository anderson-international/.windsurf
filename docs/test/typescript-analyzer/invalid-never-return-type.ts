// Invalid: Function with never return type missing annotation
export function throwError(message: string) {
  throw new Error(message)
}
