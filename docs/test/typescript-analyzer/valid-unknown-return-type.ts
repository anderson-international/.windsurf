// Valid: Function with unknown return type
export function parseJson(input: string): unknown {
  return JSON.parse(input)
}
