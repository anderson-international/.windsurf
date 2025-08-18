// Valid: Higher-order function with explicit return type
export function createHandler(action: string): (data: any) => void {
  return (data: any) => {
    console.log(`${action}:`, data)
  }
}
