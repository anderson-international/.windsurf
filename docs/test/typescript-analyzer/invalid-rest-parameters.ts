// Invalid: Function with rest parameters without return type
export function combineStrings(separator: string, ...strings: string[]) {
  return strings.join(separator)
}
