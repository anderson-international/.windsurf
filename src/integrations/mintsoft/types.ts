export interface MintsoftOrder {
  OrderId: number;
  OrderStatusId: number;
  CourierServiceId: number | null;
  OrderNumber?: string;
  Channel?: string | null;
  CustomerName?: string | null;
  Address1?: string | null;
  Address2?: string | null;
  City?: string | null;
  Postcode?: string | null;
  CountryCode?: string | null;
  Weight?: number | null;
  CreatedDate?: string;
}

export interface OrderStatus {
  Id: number;
  Name: string;
}

export interface CourierService {
  Id: number;
  Name: string;
}
