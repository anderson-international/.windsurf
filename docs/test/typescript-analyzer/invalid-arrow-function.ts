// Invalid: Arrow function without return type
export const calculateTotal = (items: number[]) => {
  return items.reduce((sum, item) => sum + item, 0)
}
