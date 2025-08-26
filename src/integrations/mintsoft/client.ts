import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { env } from '../../config/env';
import { CourierService, MintsoftOrder, OrderStatus } from './types';

const OrderSchema = z.object({
  OrderId: z.number(),
  OrderStatusId: z.number(),
  CourierServiceId: z.number().nullable().optional(),
  OrderNumber: z.string().optional(),
  Channel: z.string().nullable().optional(),
  CustomerName: z.string().nullable().optional(),
  Address1: z.string().nullable().optional(),
  Address2: z.string().nullable().optional(),
  City: z.string().nullable().optional(),
  Postcode: z.string().nullable().optional(),
  CountryCode: z.string().nullable().optional(),
  Weight: z.number().nullable().optional(),
  CreatedDate: z.string().optional(),
});

const StatusSchema = z.object({ Id: z.number(), Name: z.string() });
const CourierSchema = z.object({ Id: z.number(), Name: z.string() });

export class MintsoftClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.MINTSOFT_API_URL,
      headers: {
        'Accept': 'application/json',
        'ms-apikey': env.MINTSOFT_API_KEY,
      },
      timeout: 30000,
    });
  }

  async getOrders(): Promise<MintsoftOrder[]> {
    const res = await this.http.get('/api/Order/List');
    const arr = z.array(OrderSchema).parse(res.data);
    return arr as MintsoftOrder[];
  }

  async getStatuses(): Promise<OrderStatus[]> {
    const res = await this.http.get('/api/Order/Statuses');
    return z.array(StatusSchema).parse(res.data) as OrderStatus[];
  }

  async getCourierServices(): Promise<CourierService[]> {
    const res = await this.http.get('/api/Courier/Services');
    return z.array(CourierSchema).parse(res.data) as CourierService[];
  }
}
