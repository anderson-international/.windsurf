import type { NextApiRequest, NextApiResponse } from 'next'
import { getSelectableTargets, resolveShopifyTarget } from '../../../services/shopify-target-resolver'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const current = resolveShopifyTarget().target
    const targets = getSelectableTargets()
    return res.status(200).json({ currentTarget: current, targets })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
