import type { NextApiRequest, NextApiResponse } from 'next'
import { ProgressReporter } from '../../../services/progress-reporter'

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const snapshot = ProgressReporter.getSnapshot()
    return res.status(200).json(snapshot)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
