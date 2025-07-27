import { NextApiRequest, NextApiResponse } from 'next'
import { DeployZoneHandler } from '../../../handlers/deploy-zone-handler'
import { ApiResponse } from '../../../error/deploy-zone-error-handler'

interface SingleZoneDeploymentResult {
  success: boolean
  zone_id: string
  zone_name?: string
  deployed_rates: number
  total_rates: number
  existing_method_definitions: number
  error?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<SingleZoneDeploymentResult>>): Promise<void> {
  const deployHandler = new DeployZoneHandler()
  await deployHandler.handleRequest(req, res)
}
