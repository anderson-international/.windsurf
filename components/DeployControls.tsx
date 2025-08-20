import { useState } from 'react'
import { useDeploy } from '../context/DeployContext'
import ConfirmLiveModal from './ConfirmLiveModal'
import styles from './DeployControls.module.css'

export default function DeployControls() {
  const { state, dryRun, setDryRun, startDeploy, reset, error, target, targets, setTarget, abortDeploy } = useDeploy()
  const running = state === 'running'
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { targetName, targetUrl } = (() => {
    const t = targets.find((x) => x.key === target)
    return { targetName: target || undefined, targetUrl: t?.storeUrl }
  })()

  const handleStart = async () => {
    if (!dryRun) {
      setConfirmOpen(true)
      return
    }
    await startDeploy()
  }

  return (
    <div className={`card ${styles.wrap}`}>
      <div className={styles.panelGrid}>
        {/* Row 1: Toggle on the left */}
        <div className={styles.toggleRow}>
          <div className={styles.modeWrap}>
            <div
              role="switch"
              aria-checked={!dryRun}
              tabIndex={0}
              className={`${styles.modeToggle} ${!dryRun ? styles.live : styles.dry} ${running ? styles.modeDisabled : ''}`}
              onClick={() => {
                if (running) return
                setDryRun(!dryRun)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (running) return
                  setDryRun(!dryRun)
                }
              }}
              aria-label={dryRun ? 'Dry Run' : 'Live Deploy'}
            >
              <div className={`${styles.modeTrack} ${!dryRun ? styles.live : ''}`} />
              <div className={styles.modeKnob}>
                <span className={styles.modeKnobText}>{dryRun ? 'Dry Run' : 'Live'}</span>
              </div>
              <span className={`${styles.modeGhost} ${dryRun ? '' : styles.dry}`}>{dryRun ? 'Live' : 'Dry Run'}</span>
            </div>
          </div>
        </div>
        {/* Row 1: Deploy button on the right, aligned with toggle */}
        <div className={styles.rightCell}>
          <button className={`button ${styles.wideBtn}`} onClick={handleStart} disabled={running}>
            {running ? 'Deploying…' : 'Deploy'}
          </button>
        </div>
        {/* Row 2: Dropdown on the left, no label visible */}
        <label className={styles.toggle}>
          <select
            aria-label="Target"
            value={target || ''}
            onChange={(e) => setTarget(e.target.value)}
            disabled={running || !targets.length}
            className={styles.select}
          >
            {(targets.length ? targets : [{ key: target || '', storeUrl: '' }]).map((t) => (
              <option key={t.key} value={t.key}>
                {t.key}
              </option>
            ))}
          </select>
        </label>
        {/* Row 2: Reset/Abort button on the right, aligned with dropdown */}
        <div className={styles.rightCell}>
          {running ? (
            <button className={`button danger ${styles.wideBtn}`} onClick={abortDeploy}>
              Abort
            </button>
          ) : (
            <button className={`button danger ${styles.wideBtn}`} onClick={reset}>
              Reset
            </button>
          )}
        </div>
      </div>
      <ConfirmLiveModal
        open={confirmOpen}
        titleSuffix={targetName}
        targetLabel={targetUrl}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => { setConfirmOpen(false); await startDeploy() }}
      />
      {/* Removed single-purpose abort message; rely on ActionStatus component for status */}
      {error ? (
        <div style={{ color: 'var(--danger)', fontSize: '.95rem' }}>
          Error: {error}
        </div>
      ) : null}
    </div>
  )
}
