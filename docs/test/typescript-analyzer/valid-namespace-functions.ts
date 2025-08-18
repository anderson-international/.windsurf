// Valid: Functions within namespace with return types
export namespace Utils {
  export function format(value: string): string {
    return value.trim()
  }
  
  export function parse(input: string): number {
    return parseInt(input, 10)
  }
}
