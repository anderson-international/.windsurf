import { Browser, chromium, Page, Frame } from 'playwright';
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
    await page.goto(env.IOM_LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await this.acceptCookies(page);

    // Try filling within page, then fallback to an iframe if present
    const filledOnPage = await this.tryLoginInTarget(page, env.IOM_EMAIL, env.IOM_PASSWORD);
    if (!filledOnPage) {
      const frames = page.frames().filter(f => f !== page.mainFrame());
      for (const frame of frames) {
        if (await this.tryLoginInTarget(frame, env.IOM_EMAIL, env.IOM_PASSWORD)) break;
      }
    }

    // Navigate to business area after login
    await page.goto(env.IOM_BUSINESS_URL, { waitUntil: 'domcontentloaded' });
  }

  private async acceptCookies(target: Page | Frame) {
    try {
      const acceptSelectors = [
        '#cookiesAcceptAll',
        'a#cookiesAcceptAll',
        'a.button#cookiesAcceptAll',
        'text=Accept All Cookies',
        '[data-dismiss="modal"]:has-text("Accept All Cookies")'
      ];
      for (const sel of acceptSelectors) {
        const loc = target.locator(sel).first();
        if (await loc.count().then(c => c > 0)) {
          await loc.click({ timeout: 3000 }).catch(() => {});
          break;
        }
      }
    } catch {}
  }

  private async tryLoginInTarget(target: Page | Frame, email: string, password: string): Promise<boolean> {
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      '#email',
      '#username',
      'input[name="username"]',
    ];
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '#password',
    ];
    const submitSelectors = [
      'button[type="submit"]',
      'text=/^(sign in|log in)$/i',
    ];

    try {
      const emailLoc = await this.firstExisting(target, emailSelectors, 8000);
      const passLoc = await this.firstExisting(target, passwordSelectors, 8000);
      if (!emailLoc || !passLoc) return false;
      await emailLoc.fill(email, { timeout: 5000 });
      await passLoc.fill(password, { timeout: 5000 });

      const submitLoc = await this.firstExisting(target, submitSelectors, 3000);
      if (submitLoc) {
        await Promise.all([
          (target as Page).waitForLoadState?.('domcontentloaded').catch(() => {}),
          submitLoc.click({ timeout: 5000 }).catch(() => {})
        ]);
      }
      return true;
    } catch (err) {
      try {
        const tracesDir = path.join(process.cwd(), 'traces');
        try { fs.mkdirSync(tracesDir, { recursive: true }); } catch {}
        if ('screenshot' in target) {
          await (target as Page).screenshot({ path: path.join(tracesDir, `login-error-${Date.now()}.png`) });
        }
      } catch {}
      logger.error({ err }, 'Login attempt failed');
      return false;
    }
  }

  private async firstExisting(target: Page | Frame, selectors: string[], timeoutMs: number) {
    const start = Date.now();
    for (const sel of selectors) {
      const remaining = Math.max(0, timeoutMs - (Date.now() - start));
      try {
        const loc = target.locator(sel).first();
        await loc.waitFor({ state: 'visible', timeout: remaining || 1 });
        return loc;
      } catch {}
    }
    return null;
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
