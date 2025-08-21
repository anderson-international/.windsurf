import styles from './SummaryCard.module.css'
import { useDeploy } from '../context/DeployContext'

function stripProtocolAndSlash(u: string): string {
  let s = u
  const colon = s.indexOf(':')
  if (colon >= 0 && s.length > colon + 2 && s.charCodeAt(colon + 1) === 47 && s.charCodeAt(colon + 2) === 47) {
    s = s.slice(colon + 3)
  }
  if (s.endsWith('/')) s = s.slice(0, -1)
  return s
}

export default function SummaryCard() {
  const { state, result, snapshot, target, targets } = useDeploy()
  if (state === 'idle') {
    return (
      <div className={`card ${styles.wrap}`}>
        <div className={styles.row}>
          <div>Status</div>
          <div className={styles.small}>Ready. No deployment in progress.</div>
        </div>
      </div>
    )
  }

  const total = result?.total_zones_processed ?? snapshot?.total_zones ?? 0
  const ok = result?.successful_deployments ?? (snapshot?.completed.filter(c => c.success).length ?? 0)
  const fail = result?.failed_deployments ?? (snapshot?.completed.filter(c => !c.success).length ?? 0)
  const aborted: number = (() => {
    if (state !== 'aborted') return 0
    const total = snapshot?.total_zones
    const done = snapshot?.completed ? snapshot.completed.length : undefined
    if (typeof total === 'number' && typeof done === 'number') {
      return Math.max(0, total - done)
    }
    return 0
  })()

  return (
    <div className={`card ${styles.wrap}`}>
      {target ? (
        <div className={styles.row}>
          <div>Target</div>
          <div style={{ fontSize: '1rem', fontWeight: 400 }}>
            {((): string => {
              const t = targets.find((x: { key: string; storeUrl: string }): boolean => x.key === target)
              const url: string = t ? t.storeUrl : ''
              return stripProtocolAndSlash(url)
            })()}
          </div>
        </div>
      ) : null}
      <div className={styles.row}>
        <div>Total zones</div>
        <div className={styles.count}>{total}</div>
      </div>
      <div className={styles.row}>
        <div>Successful</div>
        <div className={styles.count} style={{ color: '#6ad66a' }}>{ok}</div>
      </div>
      <div className={styles.row}>
        <div>Failed</div>
        <div className={styles.count} style={{ color: '#ff6b6b' }}>{fail}</div>
      </div>
      <div className={styles.row}>
        <div>Aborted</div>
        <div className={styles.count} style={{ color: 'var(--warning)' }}>{aborted}</div>
      </div>
      <div className={styles.small}>
        {state === 'running' && !snapshot ? 'In progress… awaiting first updates' : 'Use the progress list below for per-zone details.'}
      </div>
    </div>
  )
}
