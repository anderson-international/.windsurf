// Valid: Function with destructuring parameters and return type
export function processUser({ name, age }: { name: string; age: number }): string {
  return `${name} is ${age} years old`
}
