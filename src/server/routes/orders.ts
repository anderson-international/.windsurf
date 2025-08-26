import { Router, Request, Response } from 'express';
import { MintsoftClient } from '../../integrations/mintsoft/client';

const router = Router();
const ms = new MintsoftClient();

router.get('/orders', async (req: Request, res: Response) => {
  try {
    const [orders, statuses, couriers] = await Promise.all([
      ms.getOrders(),
      ms.getStatuses(),
      ms.getCourierServices(),
    ]);

    // Build lookup maps
    const statusMap = new Map(statuses.map(s => [s.Id, s.Name] as const));
    const courierMap = new Map(couriers.map(c => [c.Id, c.Name] as const));

    // Parse filters (multi-select)
    const statusFilter = ([] as string[]).concat(req.query.status as any || []).map(Number).filter(Boolean);
    const courierFilter = ([] as string[]).concat(req.query.courier as any || []).map(Number).filter(Boolean);

    const filtered = orders.filter(o => {
      const statusOk = statusFilter.length === 0 || statusFilter.includes(o.OrderStatusId);
      const courierOk = courierFilter.length === 0 || (o.CourierServiceId != null && courierFilter.includes(o.CourierServiceId));
      return statusOk && courierOk;
    });

    res.render('orders', {
      orders: filtered,
      statuses,
      couriers,
      statusMap,
      courierMap,
      selectedStatus: statusFilter,
      selectedCourier: courierFilter,
    });
  } catch (err: any) {
    res.status(500).send(`Failed to load orders: ${err?.message || 'Unknown error'}`);
  }
});

export default router;
