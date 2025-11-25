// Type definitions for the inventory management system

// User roles with increasing permissions
export type UserRole = 'operator' | 'manager' | 'admin';

export interface User {
  id: number;
  username: string;
  password: string; // In production, this would be hashed
  role: UserRole;
  name: string;
  createdAt: string;
}

// Product types in the manufacturing process
export type ProductType = 'raw' | 'wip' | 'finished';

// Units of measurement
export type ProductUnit = 'MSI' | 'feet' | 'lbs' | 'gallons' | 'units';

// Bill of Materials item
export interface BOMItem {
  productId: number;
  productName: string;
  productLot: string;
  quantity: number; // How many units of input needed per 1 unit of output
}

export interface Product {
  id: number;
  name: string;
  lot: string;
  productType: ProductType;
  unit: ProductUnit;
  width?: number; // in inches, for products measured in MSI/feet
  quantity: number;
  costPerUnit: number; // $ per unit
  location: string;
  description?: string;
  bom?: BOMItem[]; // Bill of materials (for wip/finished products)
  laborCostPerUnit?: number; // $ per unit for manufacturing
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productLot: string;
  quantity: number;
  location: string;
  costPerUnit?: number; // Snapshot of cost at time of order
}

// Production costs tracking
export interface ProductionCosts {
  materialCost: number;
  laborCost: number;
  totalCost: number;
  costPerUnit: number;
  standardCost?: number; // Expected cost per unit
  variance?: number; // Actual - standard (per unit)
}

export interface Order {
  id: number;
  orderNumber: string;
  orderType: 'purchase' | 'production' | 'fulfillment';
  status: 'pending' | 'completed' | 'cancelled';
  inputs: OrderItem[]; // Products consumed
  outputs: OrderItem[]; // Products produced/received
  costs?: ProductionCosts;
  notes?: string;
  createdAt: string;
  createdBy: number; // user id
  completedAt?: string;
  completedBy?: number; // user id
}

export interface Database {
  users: User[];
  products: Product[];
  orders: Order[];
  nextUserId: number;
  nextProductId: number;
  nextOrderId: number;
  nextOrderNumber: number;
}
