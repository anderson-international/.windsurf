import styles from './DeployProgressList.module.css'
import { useDeploy } from '../context/DeployContext'
import { useMemo, useState } from 'react'

function ms(sec: number | undefined) {
  if (!sec) return ''
  const s = (sec / 1000).toFixed(1)
  return `${s}s`
}

function formatWeightRange(min: unknown, max: unknown) {
  const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v as number)
  if (!isNum(min) || !isNum(max)) return ''
  const to2 = (n: number) => n.toFixed(2)
  return `${to2(min)} to ${to2(max)} kg`
}

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
function formatGBP(value: unknown) {
  const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v as number)
  if (!isNum(value)) return ''
  return gbpFmt.format(value)
}

export default function DeployProgressList() {
  const { snapshot, result, state } = useDeploy()
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [serviceOpen, setServiceOpen] = useState<Record<string, boolean>>({})
  // Build a map for final results to access preview.rates (post-deploy details)
  const resultByZoneId = useMemo(() => {
    const map: Record<string, any> = {}
    if (result) {
      for (const r of result.results) {
        map[r.zone_id] = r
      }
    }
    return map
  }, [result])
  // Build a map for snapshot-completed zones to access preview before final result
  const snapshotByZoneId = useMemo(() => {
    const map: Record<string, any> = {}
    if (snapshot) {
      for (const c of snapshot.completed) {
        if (c.preview) map[c.zone_id] = c
      }
    }
    return map
  }, [snapshot])

  if (state === 'idle') return null

  const hasAny = !!snapshot && snapshot.completed.length > 0
  const showPreparing = !hasAny && state === 'running'

  return (
    <div className={`card ${styles.wrap}`}>
      {showPreparing ? (
        <div className={styles.item}>
          <div className={styles.meta}>
            <div className={styles.zone}>Preparing…</div>
            <div className={styles.small}>
              {state === 'running' ? 'Waiting for first zone to complete' : ''}
            </div>
          </div>
          <div className={styles.small}>—</div>
        </div>
      ) : null}
      {(snapshot?.completed || []).map((z) => {
        const isOpen = !!open[z.zone_id]
        const details = resultByZoneId[z.zone_id] || snapshotByZoneId[z.zone_id]
        const rates = details?.preview?.rates as Array<{ title: string }> | undefined
        const groups: Array<{ title: string; count: number }> = (() => {
          if (!rates) return []
          const map = new Map<string, number>()
          for (const r of rates) map.set(r.title, (map.get(r.title) || 0) + 1)
          return Array.from(map.entries()).map(([title, count]) => ({ title, count }))
        })()

        return (
          <div key={z.zone_id} className={styles.item} role="button" tabIndex={0}
            onClick={() => setOpen((s) => ({ ...s, [z.zone_id]: !isOpen }))}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((s) => ({ ...s, [z.zone_id]: !isOpen })) } }}
          >
            <div className={styles.meta}>
              <div className={styles.zone}>{z.zone_name}</div>
              <div className={`${styles.small} ${styles.nowrap}`}>
                {z.duration_ms ? `Duration: ${ms(z.duration_ms)}` : ''}
              </div>
            </div>
            {z.success ? (
              <div className={styles.right}>
                <span className={styles.okText}>{z.rates_deployed ?? 0} rates</span>
                <span className={styles.tick}>✅</span>
              </div>
            ) : (
              <div className={styles.fail}>{`❌ ${z.error || 'Failed'}`}</div>
            )}
            {isOpen ? (
              <div className={styles.expand}>
                {groups.length ? (
                  groups.map((g) => {
                    const key = `${z.zone_id}::${g.title}`
                    const svcOpen = !!serviceOpen[key]
                    const svcRates = (rates || []).filter(r => r.title === g.title)
                    return (
                      <div key={g.title}>
                        <div
                          className={`${styles.expandRow} ${styles.serviceRow}`}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setServiceOpen(s => ({ ...s, [key]: !svcOpen })) }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setServiceOpen(s => ({ ...s, [key]: !svcOpen })) }
                          }}
                        >
                          <span>{g.title}</span>
                          <span className={styles.count}>{g.count} rates</span>
                        </div>
                        {svcOpen ? (
                          <div className={styles.ratesList}>
                            {svcRates.map((r, idx) => (
                              <div key={idx} className={styles.rateRow}>
                                <div className={styles.rateDesc}>
                                  <span className={styles.small}>{r.title}</span>
                                  {formatWeightRange((r as any).weightMin, (r as any).weightMax) ? (
                                    <span className={styles.small}>{formatWeightRange((r as any).weightMin, (r as any).weightMax)}</span>
                                  ) : null}
                                </div>
                                <div className={styles.price}>{formatGBP(r.price)}</div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                ) : (
                  <div className={styles.small}>No breakdown available</div>
                )}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
