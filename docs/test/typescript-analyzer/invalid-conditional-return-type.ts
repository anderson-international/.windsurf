// Invalid: Function with conditional return type missing annotation
export function getValue<T extends boolean>(includeData: T) {
  return includeData ? { data: 'value' } : null
}
