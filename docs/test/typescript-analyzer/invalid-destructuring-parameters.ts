// Invalid: Function with destructuring parameters without return type
export function processUser({ name, age }: { name: string; age: number }) {
  return `${name} is ${age} years old`
}
