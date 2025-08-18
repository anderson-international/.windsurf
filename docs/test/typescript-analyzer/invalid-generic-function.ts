// Invalid: Generic function without return type
export function identity<T>(value: T) {
  return value
}
