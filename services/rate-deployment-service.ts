import { PrismaClient } from '@prisma/client'
import { ShopifyConfig } from './shopify-config'
import { ZoneMatcher } from './zone-matcher-core'
import { RateDeploymentRepository } from './rate-deployment-repository'
import { RateDeploymentOrchestrator } from './rate-deployment-orchestrator'
import { GeneratedRate } from '../types/rate-generation'
import { DeploymentSummary } from '../types/deployment-summary'
import { ZoneMatchingResult } from './zone-matcher-types'

const prisma = new PrismaClient()

export class RateDeploymentService {
  private readonly config: ShopifyConfig
  private readonly zoneMatcher: ZoneMatcher
  private readonly repository: RateDeploymentRepository
  private readonly orchestrator: RateDeploymentOrchestrator

  constructor(config: ShopifyConfig) {
    this.config = config
    this.zoneMatcher = new ZoneMatcher(config)
    this.repository = new RateDeploymentRepository(prisma)
    this.orchestrator = new RateDeploymentOrchestrator(config)
  }

  async fetchGeneratedRates(): Promise<GeneratedRate[]> {
    return this.repository.fetchGeneratedRates()
  }

  async performZoneMatching(transformedRates: GeneratedRate[]): Promise<ZoneMatchingResult> {
    const shopifyZones = await this.zoneMatcher.fetchShopifyZones()
    const databaseZones = this.zoneMatcher.extractDatabaseZones(transformedRates)
    return this.zoneMatcher.matchZones(shopifyZones, databaseZones, transformedRates)
  }

  async deployRates(matchingResult: ZoneMatchingResult): Promise<DeploymentSummary> {
    return this.orchestrator.deployRates(matchingResult)
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect()
  }
}
