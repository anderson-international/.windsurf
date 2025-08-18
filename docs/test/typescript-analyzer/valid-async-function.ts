// Valid: Async function with explicit return type
export async function fetchData(url: string): Promise<{ data: any }> {
  const response = await fetch(url)
  return response.json()
}
