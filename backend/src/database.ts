import * as fs from 'fs';
import * as path from 'path';
import { Database, Product, Order } from './types';

const DB_FILE = path.join(__dirname, '../data/db.json');

// Initialize with sample data
const initialData: Database = {
  products: [
    {
      id: 1,
      name: 'Steel Sheet',
      lot: 'RAW-001',
      quantity: 500,
      location: 'Warehouse A',
      description: 'Cold-rolled steel sheets for manufacturing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Screws (Box)',
      lot: 'RAW-002',
      quantity: 1000,
      location: 'Warehouse A',
      description: 'M6 screws, 100 per box',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Wood Plank',
      lot: 'RAW-003',
      quantity: 300,
      location: 'Warehouse B',
      description: 'Oak planks 2x4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Paint (Gallon)',
      lot: 'RAW-004',
      quantity: 50,
      location: 'Warehouse B',
      description: 'White enamel paint',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Table',
      lot: 'FIN-001',
      quantity: 25,
      location: 'Warehouse C',
      description: 'Finished dining table',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Chair',
      lot: 'FIN-002',
      quantity: 100,
      location: 'Warehouse C',
      description: 'Finished dining chair',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  orders: [
    {
      id: 1,
      orderNumber: 'ORD-001',
      type: 'production',
      status: 'pending',
      inputs: [
        {
          productId: 1,
          productName: 'Steel Sheet',
          productLot: 'RAW-001',
          quantity: 10,
          location: 'Warehouse A',
        },
        {
          productId: 2,
          productName: 'Screws (Box)',
          productLot: 'RAW-002',
          quantity: 2,
          location: 'Warehouse A',
        },
      ],
      notes: 'Production run for table frames',
      createdAt: new Date().toISOString(),
    },
  ],
  nextProductId: 7,
  nextOrderId: 2,
  nextOrderNumber: 2,
};

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load database from file
export function loadDatabase(): Database {
  ensureDataDirectory();

  if (!fs.existsSync(DB_FILE)) {
    // Create initial database file
    saveDatabase(initialData);
    return initialData;
  }

  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading database, using initial data:', error);
    return initialData;
  }
}

// Save database to file
export function saveDatabase(db: Database): void {
  ensureDataDirectory();

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
    throw new Error('Failed to save database');
  }
}

// Product operations
export function getAllProducts(): Product[] {
  const db = loadDatabase();
  return db.products;
}

export function getProductById(id: number): Product | undefined {
  const db = loadDatabase();
  return db.products.find(p => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const db = loadDatabase();
  const lowerQuery = query.toLowerCase();
  return db.products.filter(
    p => p.name.toLowerCase().includes(lowerQuery) ||
         p.lot.toLowerCase().includes(lowerQuery)
  );
}

export function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const db = loadDatabase();

  const newProduct: Product = {
    ...productData,
    id: db.nextProductId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.products.push(newProduct);
  db.nextProductId++;
  saveDatabase(db);

  return newProduct;
}

export function updateProduct(id: number, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
  const db = loadDatabase();
  const productIndex = db.products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return null;
  }

  db.products[productIndex] = {
    ...db.products[productIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  return db.products[productIndex];
}

export function deleteProduct(id: number): boolean {
  const db = loadDatabase();
  const productIndex = db.products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return false;
  }

  // Check if product is used in any pending orders
  const usedInOrders = db.orders.some(
    order => order.status === 'pending' &&
    order.inputs.some(input => input.productId === id)
  );

  if (usedInOrders) {
    throw new Error('Cannot delete product that is used in pending orders');
  }

  db.products.splice(productIndex, 1);
  saveDatabase(db);
  return true;
}

// Order operations
export function getAllOrders(): Order[] {
  const db = loadDatabase();
  return db.orders;
}

export function getOrderById(id: number): Order | undefined {
  const db = loadDatabase();
  return db.orders.find(o => o.id === id);
}

export function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>): Order {
  const db = loadDatabase();

  const orderNumber = `ORD-${String(db.nextOrderNumber).padStart(3, '0')}`;

  const newOrder: Order = {
    ...orderData,
    id: db.nextOrderId,
    orderNumber,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.orders.push(newOrder);
  db.nextOrderId++;
  db.nextOrderNumber++;
  saveDatabase(db);

  return newOrder;
}

export function completeOrder(id: number): { order: Order; errors: string[] } {
  const db = loadDatabase();
  const orderIndex = db.orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  const order = db.orders[orderIndex];

  if (order.status !== 'pending') {
    throw new Error(`Cannot complete order with status: ${order.status}`);
  }

  // Validate inventory availability
  const errors: string[] = [];
  for (const input of order.inputs) {
    const product = db.products.find(p => p.id === input.productId);
    if (!product) {
      errors.push(`Product not found: ${input.productName} (ID: ${input.productId})`);
      continue;
    }

    if (product.quantity < input.quantity) {
      errors.push(
        `Insufficient stock for ${product.name}: need ${input.quantity}, have ${product.quantity}`
      );
    }
  }

  if (errors.length > 0) {
    return { order, errors };
  }

  // Deduct inventory
  for (const input of order.inputs) {
    const productIndex = db.products.findIndex(p => p.id === input.productId);
    if (productIndex !== -1) {
      db.products[productIndex].quantity -= input.quantity;
      db.products[productIndex].updatedAt = new Date().toISOString();
    }
  }

  // Update order status
  db.orders[orderIndex].status = 'completed';
  db.orders[orderIndex].completedAt = new Date().toISOString();

  saveDatabase(db);

  return { order: db.orders[orderIndex], errors: [] };
}

export function deleteOrder(id: number): boolean {
  const db = loadDatabase();
  const orderIndex = db.orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return false;
  }

  const order = db.orders[orderIndex];

  if (order.status !== 'pending') {
    throw new Error('Can only delete pending orders');
  }

  db.orders.splice(orderIndex, 1);
  saveDatabase(db);
  return true;
}
