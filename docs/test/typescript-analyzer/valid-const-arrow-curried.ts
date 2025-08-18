// Valid: Const arrow function curried with explicit return types
export const createHandler = (
  action: string
): (data: any) => void => (data: any) => {
  console.log(`${action}:`, data)
}

export const handleSelectChange = (
  fieldName: string
): (e: ChangeEvent<HTMLSelectElement>) => void => (e: ChangeEvent<HTMLSelectElement>) => {
  console.log(`Field ${fieldName} changed:`, e.target.value)
}
