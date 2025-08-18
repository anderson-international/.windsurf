// Valid: Function with rest parameters and return type
export function combineStrings(separator: string, ...strings: string[]): string {
  return strings.join(separator)
}
