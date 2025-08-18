// Invalid: Mixed export styles missing return types
function internalHelper(x: number) {
  return x.toString()
}

export function publicFunction(data: number[]) {
  return data.map(internalHelper)
}

export const arrowFunction = (input: string) => {
  return parseInt(input)
}
