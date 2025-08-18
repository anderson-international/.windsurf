// Valid: Regular function with explicit return type
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}
