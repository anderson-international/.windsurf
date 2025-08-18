// Invalid: Multiple functions without return types
export function sum(a: number, b: number) {
  return a + b
}

export const multiply = (a: number, b: number) => a * b

export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
