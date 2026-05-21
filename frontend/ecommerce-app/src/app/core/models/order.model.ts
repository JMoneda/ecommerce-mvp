export type OrderStatus = 'InProcess' | 'Paid' | 'Shipped' | 'Delivered';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
  customerName?: string;
}
