// Valid: Function with utility types return type
interface User {
  id: number
  name: string
  email: string
}

export function getPartialUser(): Partial<User> {
  return { name: 'John' }
}
