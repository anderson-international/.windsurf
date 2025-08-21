import { useState, useCallback } from 'react'
import { useDeploy } from '../context/DeployContext'
import ConfirmLiveModal from './ConfirmLiveModal'
import styles from './DeployControls.module.css'

export default function DeployControls() {
  const { state, dryRun, setDryRun, startDeploy, reset, error, target, targets, setTarget, abortDeploy } = useDeploy()
  const running = state === 'running'
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { targetName, targetUrl } = (() => {
    const t = targets.find((x: { key: string; storeUrl: string }): boolean => x.key === target)
    return { targetName: target || undefined, targetUrl: t?.storeUrl }
  })()

  const handleStart = useCallback(async (): Promise<void> => {
    if (!dryRun) {
      setConfirmOpen(true)
      return
    }
    await startDeploy()
  }, [dryRun, startDeploy])

  return (
    <div className={`card ${styles.wrap}`}>
      <div className={styles.panelGrid}>
        {}
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
        {}
        <div className={styles.rightCell}>
          <button className={`button ${styles.wideBtn}`} onClick={handleStart} disabled={running}>
            {running ? 'Deploying…' : 'Deploy'}
          </button>
        </div>
        {}
        <label className={styles.toggle}>
          {targets.length ? (
            <select
              aria-label="Target"
              value={target ?? ''}
              onChange={(e) => setTarget(e.target.value)}
              disabled={running}
              className={styles.select}
            >
              <option value="" disabled>
                Select a target
              </option>
              {targets.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.key}
                </option>
              ))}
            </select>
          ) : (
            <select aria-label="Target" value="" disabled className={styles.select}>
              <option value="">No targets available</option>
            </select>
          )}
        </label>
        {}
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
      {}
      {error ? (
        <div style={{ color: 'var(--danger)', fontSize: '.95rem' }}>
          Error: {error}
        </div>
      ) : null}
    </div>
  )
}
