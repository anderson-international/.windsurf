// Valid: Multiple functions with explicit return types
export function sum(a: number, b: number): number {
  return a + b
}

export const multiply = (a: number, b: number): number => a * b

export async function fetchUser(id: string): Promise<{ name: string; email: string }> {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}
