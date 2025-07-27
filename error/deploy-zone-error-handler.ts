import { NextApiRequest } from 'next'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  timestamp: string
}

export class DeployZoneErrorHandler {
  static formatError(error: unknown, req: NextApiRequest, timestamp: string): string {
    let errorMessage: string
    let errorType: string
    let errorStack: string | undefined

    if (error instanceof Error) {
      errorMessage = error.message
      errorType = error.constructor.name
      errorStack = error.stack
    } else if (typeof error === 'string') {
      errorMessage = error
      errorType = 'StringError'
      errorStack = undefined
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error)
      errorType = 'ObjectError'
      errorStack = undefined
    } else {
      errorMessage = String(error)
      errorType = 'UnknownError'
      errorStack = undefined
    }

    const detailedError = [
      `${errorType}: ${errorMessage}`,
      errorStack ? `Stack: ${errorStack.split('\n')[0]}` : null,
      `Zone: ${req.body?.zone_id || 'undefined'}`,
      `Timestamp: ${timestamp}`
    ].filter(Boolean).join(' | ')
    
    return detailedError
  }
}

export type { ApiResponse }
