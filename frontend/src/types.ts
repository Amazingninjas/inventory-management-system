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
export type ProductUnit = 'MSI'; // MSI only for precision in manufacturing

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
  // Maintenance-specific costs
  stockPartsCost?: number;      // Extra stock parts not from inventory
  // Sales-specific costs
  travelCost?: number;           // Travel expenses
  // Shipping-specific costs
  carrierCost?: number;          // Freight/carrier costs
}

export interface Order {
  id: number;
  orderNumber: string;
  orderType: 'purchase' | 'production' | 'fulfillment' | 'r&d' | 'maintenance' | 'sales' | 'shipping';
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
