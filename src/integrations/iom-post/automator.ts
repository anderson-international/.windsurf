import { Browser, chromium, Page, Frame, Locator } from 'playwright';
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
    const context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
      locale: 'en-GB',
      timezoneId: 'Europe/London',
      colorScheme: 'light',
      viewport: { width: 1366, height: 900 },
    });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();
    return page;
  }

  async login(page: Page) {
    await page.goto(env.IOM_LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await this.acceptCookies(page);

    // Prefer a scoped form on the page
    const formOnPage = await this.findLoginForm(page);
    let loggedIn = false;
    if (formOnPage) {
      loggedIn = await this.tryLoginInForm(formOnPage, env.IOM_EMAIL, env.IOM_PASSWORD);
    }

    // Fallback: if not found on main page, try in frames
    if (!loggedIn) {
      const frames = page.frames().filter(f => f !== page.mainFrame());
      for (const frame of frames) {
        const formInFrame = await this.findLoginForm(frame);
        if (formInFrame) {
          loggedIn = await this.tryLoginInForm(formInFrame, env.IOM_EMAIL, env.IOM_PASSWORD);
          if (loggedIn) break;
        }
      }
    }

    if (!loggedIn) {
      await this.dumpDiagnostics(page, 'login-form-not-found');
      throw new Error('Login form not found or inputs not interactable');
    }

    // Navigate to business area after login
    await Promise.race([
      page.waitForURL(url => url.toString().includes(env.IOM_BUSINESS_URL), { timeout: 8000 }).catch(() => {}),
      page.waitForLoadState('domcontentloaded').catch(() => {}),
    ]);
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

  private async tryLoginInForm(form: Locator, email: string, password: string): Promise<boolean> {
    const emailCandidates = [
      () => form.getByLabel(/email|e-mail/i),
      () => form.getByPlaceholder(/email|e-mail/i),
      () => form.locator('input[id*="email" i]'),
      () => form.locator('input[name*="email" i]'),
      () => form.locator('input[type="email"]'),
      () => form.locator('#username, input[name="username"]'),
    ];
    const passwordCandidates = [
      () => form.getByLabel(/password/i),
      () => form.getByPlaceholder(/password/i),
      () => form.locator('input[id*="password" i], #password'),
      () => form.locator('input[type="password"]'),
    ];
    const submitCandidates = [
      () => form.getByRole('button', { name: /log in|sign in/i }),
      () => form.locator('button[type="submit"]'),
      () => form.locator('input[type="submit"]'),
      () => form.locator('button:has-text("Log in"), button:has-text("Sign in")'),
    ];

    try {
      const emailLoc = await this.firstLocator(emailCandidates, 9000);
      const passLoc = await this.firstLocator(passwordCandidates, 9000);
      if (!emailLoc || !passLoc) return false;
      await emailLoc.fill(email, { timeout: 5000 });
      await passLoc.fill(password, { timeout: 5000 });

      const submitLoc = await this.firstLocator(submitCandidates, 4000);
      if (submitLoc) {
        await Promise.all([
          submitLoc.click({ timeout: 5000 }).catch(() => {}),
        ]);
      }
      return true;
    } catch (err) {
      logger.error({ err }, 'Login attempt in form failed');
      return false;
    }
  }

  private async findLoginForm(target: Page | Frame): Promise<Locator | null> {
    // Common login form patterns on the site
    const candidates = [
      'form:has(button:has-text("Log in"))',
      'form:has-text("Password")',
      'form[action*="login" i]',
    ];
    for (const sel of candidates) {
      const loc = target.locator(sel).first();
      try {
        await loc.waitFor({ state: 'visible', timeout: 2000 });
        return loc;
      } catch {}
    }
    return null;
  }

  private async firstLocator(fns: Array<() => Locator>, timeoutMs: number): Promise<Locator | null> {
    const start = Date.now();
    for (const make of fns) {
      const remaining = Math.max(0, timeoutMs - (Date.now() - start));
      const loc = make();
      try {
        await loc.waitFor({ state: 'visible', timeout: remaining || 1 });
        return loc;
      } catch {}
    }
    return null;
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

  private async dumpDiagnostics(page: Page, prefix: string) {
    try {
      const tracesDir = path.join(process.cwd(), 'traces');
      try { fs.mkdirSync(tracesDir, { recursive: true }); } catch {}
      const html = await page.content();
      fs.writeFileSync(path.join(tracesDir, `${prefix}-${Date.now()}.html`), html);
      await page.screenshot({ path: path.join(tracesDir, `${prefix}-${Date.now()}.png`), fullPage: true });
      const frames = page.frames();
      logger.warn({ frameCount: frames.length, frames: frames.map(f => ({ url: f.url() })) }, 'Diagnostics: frames info');
    } catch (e) {
      logger.warn({ e }, 'Failed to dump diagnostics');
    }
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
