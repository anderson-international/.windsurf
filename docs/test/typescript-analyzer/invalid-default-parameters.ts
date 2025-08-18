// Invalid: Function with default parameters without return type
export function greet(name: string, greeting: string = 'Hello') {
  return `${greeting}, ${name}!`
}
