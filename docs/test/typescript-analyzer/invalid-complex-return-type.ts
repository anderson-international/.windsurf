// Invalid: Function without complex return type
interface UserData {
  id: number
  name: string
  email: string
}

export function transformUser(raw: any) {
  const isValid = raw.id && raw.name && raw.email
  return {
    user: {
      id: raw.id || 0,
      name: raw.name || '',
      email: raw.email || ''
    },
    isValid
  }
}
