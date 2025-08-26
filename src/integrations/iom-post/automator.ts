import { Browser, chromium, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';

// Inline result shape in method signature to avoid unused type warnings

export class IomPoAutomator {
  private browser?: Browser;

  async start() {
    this.browser = await chromium.launch({ headless: true });
  }

  async stop() {
    await this.browser?.close();
  }

  private async newPage(): Promise<Page> {
    if (!this.browser) throw new Error('Browser not started');
    const context = await this.browser.newContext();
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    return page;
  }

  async login(page: Page) {
    await page.goto(env.IOM_LOGIN_URL);
    // TODO: Replace selectors after reverse-engineering the page
    await page.fill('input[type="email"]', env.IOM_EMAIL);
    await page.fill('input[type="password"]', env.IOM_PASSWORD);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('button[type="submit"]')
    ]);
    // Navigate to business area
    await page.goto(env.IOM_BUSINESS_URL);
  }

  async addOrderToManifest(page: Page, order: { orderId: number; weight?: number | null }) {
    await page.goto(env.IOM_MANIFEST_URL);
    // TODO: Fill required fields based on reverse engineered form
    // Placeholder action
    await page.waitForLoadState('domcontentloaded');
    // Return a fake reference for now
    return `REF-${order.orderId}`;
  }

  async submitOrders(orders: Array<{ orderId: number; weight?: number | null }>): Promise<Array<{ orderId: number; success: boolean; message?: string; reference?: string }>> {
    const page = await this.newPage();
    try {
      await this.login(page);
      const results: Array<{ orderId: number; success: boolean; message?: string; reference?: string }> = [];
      for (const o of orders) {
        try {
          const reference = await this.addOrderToManifest(page, o);
          results.push({ orderId: o.orderId, success: true, reference });
        } catch (err: any) {
          logger.error({ err }, 'Failed to add order to manifest');
          results.push({ orderId: o.orderId, success: false, message: err?.message || 'Unknown error' });
        }
      }
      return results;
    } finally {
      // Save trace per context
      try {
        const tracesDir = path.join(process.cwd(), 'traces');
        try { fs.mkdirSync(tracesDir, { recursive: true }); } catch {}
        await page.context().tracing.stop({ path: path.join(tracesDir, `manifest-trace-${Date.now()}.zip`) });
      } catch (e) {
        logger.warn({ e }, 'Failed to save trace');
      }
      await page.context().close();
    }
  }
}
