import { PrismaClient } from '@prisma/client'

export class DatabaseClient {
  private readonly prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  getClient(): PrismaClient {
    return this.prisma
  }

  async connect(): Promise<void> {
    await this.prisma.$connect()
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}
