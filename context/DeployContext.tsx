import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { DeployAllZonesResponse, ProgressSnapshot, TargetsResponse } from '../lib/api/rates'
import { getProgressSnapshot, postDeployAllZones, getTargets, postAbort } from '../lib/api/rates'

export type DeployState = 'idle' | 'running' | 'done' | 'error' | 'aborted'

interface DeployContextValue {
  state: DeployState
  dryRun: boolean
  setDryRun: (v: boolean) => void
  target?: string
  targets: Array<{ key: string; storeUrl: string }>
  setTarget: (t: string) => void
  snapshot?: ProgressSnapshot
  result?: DeployAllZonesResponse
  error?: string
  startDeploy: () => Promise<void>
  reset: () => void
  abortDeploy: () => Promise<void>
  aborting: boolean
}

const DeployContext = createContext<DeployContextValue | undefined>(undefined)

export function DeployProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DeployState>('idle')
  const [dryRun, setDryRun] = useState<boolean>(true)
  const [targets, setTargets] = useState<Array<{ key: string; storeUrl: string }>>([])
  const [target, setTarget] = useState<string | undefined>(undefined)
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | undefined>(undefined)
  const [result, setResult] = useState<DeployAllZonesResponse | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [aborting, setAborting] = useState<boolean>(false)

  const poller = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const abortedRef = useRef<boolean>(false)
  const lastCompletedCount = useRef<number>(0)

  const stopPolling = useCallback(() => {
    if (poller.current) {
      clearInterval(poller.current)
      poller.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const pollProgress = useCallback(() => {
    stopPolling()
    poller.current = setInterval(async () => {
      try {
        const ac = new AbortController()
        abortRef.current = ac
        const s = await getProgressSnapshot(ac.signal)
        setSnapshot(s)
        // close aborting message when next zone completes or when terminal state reached
        const completedCount = s.completed?.length || 0
        if (completedCount > lastCompletedCount.current) {
          setAborting(false)
          lastCompletedCount.current = completedCount
        }
        if (s.aborted || s.done) {
          // terminal state reached — ensure aborting indicator is cleared
          setAborting(false)
        }
        if (s.aborted) {
          abortedRef.current = true
          setState('aborted')
          stopPolling()
        } else if (s.done) {
          stopPolling()
        }
      } catch {
        // ignore polling errors
      }
    }, 2000)
  }, [stopPolling])

  const startDeploy = useCallback(async () => {
    try {
      setError(undefined)
      setResult(undefined)
      setSnapshot(undefined)
      abortedRef.current = false
      lastCompletedCount.current = 0
      setAborting(false)
      setState('running')
      pollProgress()
      const r = await postDeployAllZones(dryRun, target)
      setResult(r)
      setState(abortedRef.current ? 'aborted' : 'done')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
      setState('error')
    } finally {
      stopPolling()
    }
  }, [dryRun, pollProgress, stopPolling, target])

  const abortDeploy = useCallback(async () => {
    try {
      await postAbort('User requested abort')
      setAborting(true)
    } catch (e) {
      // surface as non-fatal; polling will still catch abort
    }
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setState('idle')
    setSnapshot(undefined)
    setResult(undefined)
    setError(undefined)
    setAborting(false)
  }, [stopPolling])

  useEffect(() => () => stopPolling(), [stopPolling])

  // Safety: if we're no longer running, ensure the aborting flag is cleared.
  // This covers cases where mobile browsers throttle timers and a terminal
  // progress snapshot isn't observed to clear it via pollProgress.
  useEffect(() => {
    if (state !== 'running' && aborting) {
      setAborting(false)
    }
  }, [state, aborting])

  // Load targets on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const info: TargetsResponse = await getTargets()
        if (!mounted) return
        setTargets(info.targets)
        setTarget(info.currentTarget)
      } catch (e) {
        // ignore; UI can still deploy using env default
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const value = useMemo(
    () => ({ state, dryRun, setDryRun, target, targets, setTarget, snapshot, result, error, startDeploy, reset, abortDeploy, aborting }),
    [state, dryRun, target, targets, snapshot, result, error, startDeploy, reset, abortDeploy, aborting]
  )

  return <DeployContext.Provider value={value}>{children}</DeployContext.Provider>
}

export function useDeploy() {
  const ctx = useContext(DeployContext)
  if (!ctx) throw new Error('useDeploy must be used within DeployProvider')
  return ctx
}
