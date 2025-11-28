// User types
export type UserRole = 'operator' | 'manager' | 'admin';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Product types
export type ProductType = 'raw' | 'wip' | 'finished';
export type ProductUnit = 'MSI' | 'feet' | 'lbs' | 'gallons' | 'units';

export interface BOMItem {
  productId: number;
  productName: string;
  productLot: string;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  lot: string;
  productType: ProductType;
  unit: ProductUnit;
  width?: number;
  quantity: number;
  costPerUnit: number;
  location: string;
  description?: string;
  bom?: BOMItem[];
  laborCostPerUnit?: number;
  createdAt: string;
  updatedAt: string;
}

// Order types
export interface OrderItem {
  productId: number;
  productName: string;
  productLot: string;
  quantity: number;
  location: string;
  costPerUnit?: number;
}

export interface ProductionCosts {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  costPerUnit: number;
  standardCost?: number;
  variance?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  orderType: 'purchase' | 'production' | 'fulfillment' | 'r&d';
  status: 'pending' | 'completed' | 'cancelled';
  inputs: OrderItem[];
  outputs: OrderItem[];
  costs?: ProductionCosts;
  notes?: string;
  createdAt: string;
  createdBy: number;
  completedAt?: string;
  completedBy?: number;
}
