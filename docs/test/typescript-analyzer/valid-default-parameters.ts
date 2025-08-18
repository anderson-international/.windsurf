// Valid: Function with default parameters and return type
export function greet(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}!`
}
