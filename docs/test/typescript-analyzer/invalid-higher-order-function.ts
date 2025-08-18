// Invalid: Higher-order function without return type
export function createHandler(action: string) {
  return (data: any) => {
    console.log(`${action}:`, data)
  }
}
