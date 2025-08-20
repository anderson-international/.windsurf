import styles from './ActionStatus.module.css'
import { useDeploy } from '../context/DeployContext'

export default function ActionStatus() {
  const { state, dryRun, aborting } = useDeploy()

  // Only visible while action is occurring
  const running = state === 'running'
  const visible = running || aborting
  if (!visible) return null

  const variant = aborting ? 'danger' : dryRun ? 'info' : 'success'
  const label = aborting ? 'Aborting' : dryRun ? 'Dry Run' : 'Live Deploy'

  return (
    <div className={styles._wrap}>
      <div className={`${styles.badge} ${styles[variant]}`}>
        <span>{label}</span>
        <span className={styles.spinner} aria-hidden="true" />
      </div>
    </div>
  )
}
