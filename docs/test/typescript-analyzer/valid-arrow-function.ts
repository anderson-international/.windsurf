// Valid: Arrow function with explicit return type
export const calculateTotal = (items: number[]): number => {
  return items.reduce((sum, item) => sum + item, 0)
}
