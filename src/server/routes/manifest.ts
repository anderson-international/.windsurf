import { Router, Request, Response } from 'express';
import { MintsoftClient } from '../../integrations/mintsoft/client';
import { IomPoAutomator } from '../../integrations/iom-post/automator';
import { logger } from '../../lib/logger';

const router = Router();
const ms = new MintsoftClient();

router.post('/manifest/submit', async (req: Request, res: Response) => {
  const ids = ([] as string[]).concat(req.body.orderIds || []).map((x) => Number(x)).filter(Boolean);
  if (ids.length === 0) {
    return res.status(400).send('No orders selected');
  }

  try {
    const allOrders = await ms.getOrders();
    const selected = allOrders.filter(o => ids.includes(o.OrderId));

    const automator = new IomPoAutomator();
    await automator.start();
    const results = await automator.submitOrders(selected.map(o => ({ orderId: o.OrderId, weight: o.Weight ?? null })));
    await automator.stop();

    logger.info({ count: results.length }, 'Manifest submission completed');
    res.render('manifest-result', { results });
  } catch (err: any) {
    logger.error({ err }, 'Manifest submission failed');
    res.status(500).send(`Manifest submission failed: ${err?.message || 'Unknown error'}`);
  }
});

export default router;
