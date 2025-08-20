import type { NextApiRequest, NextApiResponse } from 'next'
import { AbortFlag } from '../../../services/abort-flag'
import { ProgressReporter } from '../../../services/progress-reporter'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Only POST supported' })
  }
  const { reason } = (req.body || {}) as { reason?: string }
  AbortFlag.abort(reason || 'Aborted by user')
  ProgressReporter.markAborted(reason || 'Aborted by user')
  return res.status(200).json({ ok: true })
}
