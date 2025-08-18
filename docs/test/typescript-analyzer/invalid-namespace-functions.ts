// Invalid: Functions within namespace missing return types
export namespace Utils {
  export function format(value: string) {
    return value.trim()
  }
  
  export function parse(input: string) {
    return parseInt(input, 10)
  }
}
