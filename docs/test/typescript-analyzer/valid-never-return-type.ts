// Valid: Function with never return type
export function throwError(message: string): never {
  throw new Error(message)
}
