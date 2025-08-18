// Invalid: Function with utility types return type missing annotation
interface User {
  id: number
  name: string
  email: string
}

export function getPartialUser() {
  return { name: 'John' }
}
