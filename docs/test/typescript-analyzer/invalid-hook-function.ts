// Invalid: Hook function without return type
export const useCounter = (initialValue: number = 0) => {
  const [count, setCount] = useState(initialValue)
  
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  
  return useMemo(() => ({
    count,
    increment,
    decrement
  }), [count, increment, decrement])
}
