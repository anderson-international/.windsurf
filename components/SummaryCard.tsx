import styles from './SummaryCard.module.css'
import { useDeploy } from '../context/DeployContext'

export default function SummaryCard() {
  const { state, result, snapshot, target, targets } = useDeploy()
  if (state === 'idle') return null

  const total = result?.total_zones_processed ?? snapshot?.total_zones ?? 0
  const ok = result?.successful_deployments ?? (snapshot?.completed.filter(c => c.success).length ?? 0)
  const fail = result?.failed_deployments ?? (snapshot?.completed.filter(c => !c.success).length ?? 0)
  const aborted = state === 'aborted' ? Math.max(0, (snapshot?.total_zones || 0) - (snapshot?.completed.length || 0)) : 0

  return (
    <div className={`card ${styles.wrap}`}>
      {target ? (
        <div className={styles.row}>
          <div>Target</div>
          <div style={{ fontSize: '1rem', fontWeight: 400 }}>
            {(() => {
              const t = targets.find((x) => x.key === target)
              const url = t ? t.storeUrl : ''
              return url.replace(/^https?:\/\//, '')
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
