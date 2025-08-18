// Valid: Mixed export styles with return types
function internalHelper(x: number): string {
  return x.toString()
}

export function publicFunction(data: number[]): string[] {
  return data.map(internalHelper)
}

export const arrowFunction = (input: string): number => {
  return parseInt(input)
}
