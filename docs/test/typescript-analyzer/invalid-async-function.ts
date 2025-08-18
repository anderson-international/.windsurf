// Invalid: Async function without return type
export async function fetchData(url: string) {
  const response = await fetch(url)
  return response.json()
}
