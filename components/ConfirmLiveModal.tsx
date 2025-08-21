import { useEffect, useState, type ReactElement } from 'react'
import styles from './ConfirmLiveModal.module.css'

export default function ConfirmLiveModal({
  open,
  targetLabel,
  titleSuffix,
  onCancel,
  onConfirm,
}: {
  open: boolean
  targetLabel?: string
  titleSuffix?: string
  onCancel: () => void
  onConfirm: () => void
}): ReactElement | null {
  const [text, setText] = useState('')
  const [_pressing, setPressing] = useState(false)

  useEffect(() => {
    if (!open) setText('')
  }, [open])

  if (!open) return null

  const canConfirm = text.trim().toUpperCase() === 'LIVE'

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="live-title">
      <div className={styles.modal}>
        <div id="live-title" className={styles.title}>
          {`Enable Live Deploy${titleSuffix ? ` - ${titleSuffix}` : ''}`}
        </div>
        {targetLabel ? (
          <div className={`${styles.body} ${styles.bodyPlain}`}>{targetLabel}</div>
        ) : null}
        <input
          className={styles.input}
          placeholder="Type LIVE to confirm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className={styles.row}>
          <button className="button" onClick={onCancel}>Cancel</button>
          <button
            className="button danger"
            onMouseDown={() => setPressing(true)}
            onMouseUp={() => setPressing(false)}
            onMouseLeave={() => setPressing(false)}
            onClick={() => canConfirm && onConfirm()}
            disabled={!canConfirm}
            title={canConfirm ? 'Enable live deploy' : 'Type LIVE to enable'}
          >
            Enable Live
          </button>
        </div>
      </div>
    </div>
  )
}
