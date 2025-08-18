// Valid: Async arrow function with explicit return type
export const fetchData = async (url: string): Promise<{ data: any }> => {
  const response = await fetch(url)
  return response.json()
}
