// Edge case: File with only types and interfaces, no functions
interface User {
  id: number
  name: string
}

type Status = 'active' | 'inactive'

export type UserStatus = {
  user: User
  status: Status
}

// This file should pass all tests (0 functions = 0 violations)
