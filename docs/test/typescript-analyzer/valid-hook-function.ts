// Valid: Hook function with explicit return type
interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
}

export const useCounter = (initialValue: number = 0): UseCounterReturn => {
  const [count, setCount] = useState(initialValue)
  
  const increment = useCallback(() => setCount(c => c + 1), [])
  const decrement = useCallback(() => setCount(c => c - 1), [])
  
  return useMemo(() => ({
    count,
    increment,
    decrement
  }), [count, increment, decrement])
}
