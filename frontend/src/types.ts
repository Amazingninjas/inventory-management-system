export interface Product {
  id: number;
  name: string;
  lot: string;
  quantity: number;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productLot: string;
  quantity: number;
  location: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  type: 'production' | 'fulfillment';
  status: 'pending' | 'completed' | 'cancelled';
  inputs: OrderItem[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}
