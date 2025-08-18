// Invalid: Const arrow function curried without explicit return types
export const createHandler = (
  action: string
) => (data: any) => {
  console.log(`${action}:`, data)
}

export const handleSelectChange = (
  fieldName: string
) => (e: ChangeEvent<HTMLSelectElement>) => {
  console.log(`Field ${fieldName} changed:`, e.target.value)
}
