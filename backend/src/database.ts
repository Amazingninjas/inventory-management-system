import * as fs from 'fs';
import * as path from 'path';
import { Database, Product, Order, User, ProductionCosts } from './types';

const DB_FILE = path.join(__dirname, '../data/db.json');

// Initialize with sample data
const initialData: Database = {
  users: [
    {
      id: 1,
      username: 'Demo',
      password: 'Demo', // In production, this would be hashed
      role: 'admin',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    },
  ],
  products: [
    // ===== RAW MATERIALS =====
    {
      id: 1,
      name: 'PET Film',
      lot: 'RAW-FILM-001',
      productType: 'raw',
      unit: 'MSI',
      quantity: 5000,
      costPerUnit: 0.50,
      location: 'Raw Materials - Bay 1',
      description: 'Polyester film base material',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Top-coat 581',
      lot: 'RAW-TC581-001',
      productType: 'raw',
      unit: 'MSI',
      quantity: 3000,
      costPerUnit: 0.80,
      location: 'Raw Materials - Bay 2',
      description: 'Custom top-coat material for 581 series',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Top-coat 582',
      lot: 'RAW-TC582-001',
      productType: 'raw',
      unit: 'MSI',
      quantity: 3000,
      costPerUnit: 0.90,
      location: 'Raw Materials - Bay 2',
      description: 'Custom top-coat material for 582 series',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Acrylic Adhesive 581',
      lot: 'RAW-ADH581-001',
      productType: 'raw',
      unit: 'MSI',
      quantity: 2500,
      costPerUnit: 1.20,
      location: 'Raw Materials - Bay 3',
      description: 'Acrylic adhesive for 581 series',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Acrylic Adhesive 582',
      lot: 'RAW-ADH582-001',
      productType: 'raw',
      unit: 'MSI',
      quantity: 2500,
      costPerUnit: 1.50,
      location: 'Raw Materials - Bay 3',
      description: 'Acrylic adhesive for 582 series',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Silicone Liner',
      lot: 'RAW-LINER-001',
      productType: 'raw',
      unit: 'MSI',
      quantity: 4000,
      costPerUnit: 0.30,
      location: 'Raw Materials - Bay 4',
      description: 'Silicone release liner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // ===== WIP: COATED FILM (Stage 1: Coating) =====
    {
      id: 7,
      name: 'Coated Film 581-215',
      lot: 'WIP-CF581-215',
      productType: 'wip',
      unit: 'MSI',
      width: 21.5,
      quantity: 0,
      costPerUnit: 0, // Calculated from BOM
      location: 'WIP - Coating Line',
      description: 'PET Film with 581 top-coat applied, 21.5" wide',
      laborCostPerUnit: 0.25,
      bom: [
        { productId: 1, productName: 'PET Film', productLot: 'RAW-FILM-001', quantity: 1 },
        { productId: 2, productName: 'Top-coat 581', productLot: 'RAW-TC581-001', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      name: 'Coated Film 582-22',
      lot: 'WIP-CF582-22',
      productType: 'wip',
      unit: 'MSI',
      width: 22,
      quantity: 0,
      costPerUnit: 0,
      location: 'WIP - Coating Line',
      description: 'PET Film with 582 top-coat applied, 22" wide',
      laborCostPerUnit: 0.25,
      bom: [
        { productId: 1, productName: 'PET Film', productLot: 'RAW-FILM-001', quantity: 1 },
        { productId: 3, productName: 'Top-coat 582', productLot: 'RAW-TC582-001', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // ===== WIP: COATED FILM W/ ADHESIVE (Stage 2: Adhesive Application) =====
    {
      id: 9,
      name: 'Coated Film w/ Adhesive 581-215',
      lot: 'WIP-CFA581-215',
      productType: 'wip',
      unit: 'MSI',
      width: 21.5,
      quantity: 0,
      costPerUnit: 0,
      location: 'WIP - Adhesive Line',
      description: 'Coated Film 581 with adhesive applied, 21.5" wide',
      laborCostPerUnit: 0.30,
      bom: [
        { productId: 7, productName: 'Coated Film 581-215', productLot: 'WIP-CF581-215', quantity: 1 },
        { productId: 4, productName: 'Acrylic Adhesive 581', productLot: 'RAW-ADH581-001', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Coated Film w/ Adhesive 582-22',
      lot: 'WIP-CFA582-22',
      productType: 'wip',
      unit: 'MSI',
      width: 22,
      quantity: 0,
      costPerUnit: 0,
      location: 'WIP - Adhesive Line',
      description: 'Coated Film 582 with adhesive applied, 22" wide',
      laborCostPerUnit: 0.30,
      bom: [
        { productId: 8, productName: 'Coated Film 582-22', productLot: 'WIP-CF582-22', quantity: 1 },
        { productId: 5, productName: 'Acrylic Adhesive 582', productLot: 'RAW-ADH582-001', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // ===== WIP: MASTER ROLLS (Stage 3: Liner Application) =====
    {
      id: 11,
      name: 'Master Roll 581-215',
      lot: 'WIP-MR581-215',
      productType: 'wip',
      unit: 'MSI',
      width: 21.5,
      quantity: 0,
      costPerUnit: 0,
      location: 'WIP - Liner Line',
      description: 'Complete PSM with liner, 21.5" wide, ready for cutting',
      laborCostPerUnit: 0.20,
      bom: [
        { productId: 9, productName: 'Coated Film w/ Adhesive 581-215', productLot: 'WIP-CFA581-215', quantity: 1 },
        { productId: 6, productName: 'Silicone Liner', productLot: 'RAW-LINER-001', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 12,
      name: 'Master Roll 582-22',
      lot: 'WIP-MR582-22',
      productType: 'wip',
      unit: 'MSI',
      width: 22,
      quantity: 0,
      costPerUnit: 0,
      location: 'WIP - Liner Line',
      description: 'Complete PSM with liner, 22" wide, ready for cutting',
      laborCostPerUnit: 0.20,
      bom: [
        { productId: 10, productName: 'Coated Film w/ Adhesive 582-22', productLot: 'WIP-CFA582-22', quantity: 1 },
        { productId: 6, productName: 'Silicone Liner', productLot: 'RAW-LINER-001', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // ===== FINISHED GOODS (Stage 4: Cutting) =====
    {
      id: 13,
      name: '581-215',
      lot: 'FIN-581-215',
      productType: 'finished',
      unit: 'MSI',
      width: 21.5,
      quantity: 0,
      costPerUnit: 0,
      location: 'Finished Goods',
      description: 'Finished PSM product 581-215, cut to customer specifications',
      laborCostPerUnit: 0.15,
      bom: [
        { productId: 11, productName: 'Master Roll 581-215', productLot: 'WIP-MR581-215', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 14,
      name: '582-22',
      lot: 'FIN-582-22',
      productType: 'finished',
      unit: 'MSI',
      width: 22,
      quantity: 0,
      costPerUnit: 0,
      location: 'Finished Goods',
      description: 'Finished PSM product 582-22, cut to customer specifications',
      laborCostPerUnit: 0.15,
      bom: [
        { productId: 12, productName: 'Master Roll 582-22', productLot: 'WIP-MR582-22', quantity: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  orders: [],
  nextUserId: 2,
  nextProductId: 15,
  nextOrderId: 1,
  nextOrderNumber: 1,
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

// ===== USER OPERATIONS =====

export function getUserByUsername(username: string): User | undefined {
  const db = loadDatabase();
  return db.users.find(u => u.username === username);
}

export function getUserById(id: number): User | undefined {
  const db = loadDatabase();
  return db.users.find(u => u.id === id);
}

// ===== PRODUCT OPERATIONS =====

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

export function createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'> & {
  extraCosts?: {
    stockPartsCost?: number;
    travelCost?: number;
    carrierCost?: number;
    laborCost?: number;
  };
}): Order {
  const db = loadDatabase();

  const orderNumber = `ORD-${String(db.nextOrderNumber).padStart(3, '0')}`;

  // Extract extraCosts and create initial costs object if provided
  const { extraCosts, ...restOrderData } = orderData;
  const initialCosts = extraCosts && (extraCosts.stockPartsCost || extraCosts.travelCost || extraCosts.carrierCost || extraCosts.laborCost)
    ? {
        materialCost: 0,
        laborCost: extraCosts.laborCost || 0,
        totalCost: 0,
        costPerUnit: 0,
        stockPartsCost: extraCosts.stockPartsCost,
        travelCost: extraCosts.travelCost,
        carrierCost: extraCosts.carrierCost,
      }
    : undefined;

  const newOrder: Order = {
    ...restOrderData,
    id: db.nextOrderId,
    orderNumber,
    status: 'pending',
    createdAt: new Date().toISOString(),
    costs: initialCosts,
  };

  db.orders.push(newOrder);
  db.nextOrderId++;
  db.nextOrderNumber++;
  saveDatabase(db);

  return newOrder;
}

// Helper function to calculate production costs based on BOM
function calculateProductionCosts(
  product: Product,
  quantity: number,
  db: Database
): { materialCost: number; laborCost: number; totalCost: number; costPerUnit: number } {
  let materialCost = 0;
  let laborCost = 0;

  // Calculate material costs from BOM
  if (product.bom && product.bom.length > 0) {
    for (const bomItem of product.bom) {
      const inputProduct = db.products.find(p => p.id === bomItem.productId);
      if (inputProduct) {
        // Material cost = input quantity per unit × output quantity × cost per unit of input
        materialCost += bomItem.quantity * quantity * inputProduct.costPerUnit;
      }
    }
  }

  // Calculate labor cost
  if (product.laborCostPerUnit) {
    laborCost = product.laborCostPerUnit * quantity;
  }

  const totalCost = materialCost + laborCost;
  const costPerUnit = quantity > 0 ? totalCost / quantity : 0;

  return { materialCost, laborCost, totalCost, costPerUnit };
}

export function completeOrder(id: number, userId?: number): { order: Order; errors: string[] } {
  const db = loadDatabase();
  const orderIndex = db.orders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  const order = db.orders[orderIndex];

  if (order.status !== 'pending') {
    throw new Error(`Cannot complete order with status: ${order.status}`);
  }

  const errors: string[] = [];

  // Validate inventory availability for inputs (if any)
  if (order.inputs && order.inputs.length > 0) {
    for (const input of order.inputs) {
      const product = db.products.find(p => p.id === input.productId);
      if (!product) {
        errors.push(`Product not found: ${input.productName} (ID: ${input.productId})`);
        continue;
      }

      if (product.quantity < input.quantity) {
        errors.push(
          `Insufficient stock for ${product.name}: need ${input.quantity} ${product.unit}, have ${product.quantity} ${product.unit}`
        );
      }
    }
  }

  if (errors.length > 0) {
    return { order, errors };
  }

  // Process order based on type
  let productionCosts: ProductionCosts | undefined;

  if (order.orderType === 'purchase') {
    // PURCHASE ORDER: Add outputs to inventory (receiving materials)
    for (const output of order.outputs) {
      const productIndex = db.products.findIndex(p => p.id === output.productId);
      if (productIndex !== -1) {
        db.products[productIndex].quantity += output.quantity;
        db.products[productIndex].updatedAt = new Date().toISOString();
      }
    }
  } else if (order.orderType === 'production') {
    // PRODUCTION ORDER: Deduct inputs, add outputs, calculate costs

    // Deduct inputs
    for (const input of order.inputs) {
      const productIndex = db.products.findIndex(p => p.id === input.productId);
      if (productIndex !== -1) {
        db.products[productIndex].quantity -= input.quantity;
        db.products[productIndex].updatedAt = new Date().toISOString();
      }
    }

    // Add outputs and calculate costs
    let totalMaterialCost = 0;
    let totalLaborCost = 0;
    let totalOutputQuantity = 0;

    for (const output of order.outputs) {
      const productIndex = db.products.findIndex(p => p.id === output.productId);
      if (productIndex !== -1) {
        const product = db.products[productIndex];

        // Calculate production costs for this output
        const costs = calculateProductionCosts(product, output.quantity, db);
        totalMaterialCost += costs.materialCost;
        totalLaborCost += costs.laborCost;
        totalOutputQuantity += output.quantity;

        // Update product inventory and cost
        db.products[productIndex].quantity += output.quantity;
        db.products[productIndex].costPerUnit = costs.costPerUnit;
        db.products[productIndex].updatedAt = new Date().toISOString();
      }
    }

    // Store production costs on order
    const totalCost = totalMaterialCost + totalLaborCost;
    const costPerUnit = totalOutputQuantity > 0 ? totalCost / totalOutputQuantity : 0;

    productionCosts = {
      materialCost: totalMaterialCost,
      laborCost: totalLaborCost,
      totalCost,
      costPerUnit,
      // Variance calculation could be added here if standard costs are defined
    };

    db.orders[orderIndex].costs = productionCosts;
  } else if (order.orderType === 'fulfillment' || order.orderType === 'r&d') {
    // FULFILLMENT/R&D ORDER: Deduct inputs (shipping out / R&D usage)
    for (const input of order.inputs) {
      const productIndex = db.products.findIndex(p => p.id === input.productId);
      if (productIndex !== -1) {
        db.products[productIndex].quantity -= input.quantity;
        db.products[productIndex].updatedAt = new Date().toISOString();
      }
    }

    // For R&D, calculate material costs from inputs
    if (order.orderType === 'r&d') {
      let materialCost = 0;
      for (const input of order.inputs) {
        materialCost += (input.costPerUnit || 0) * input.quantity;
      }

      const laborCost = (order.costs?.laborCost || 0);
      productionCosts = {
        materialCost,
        laborCost,
        totalCost: materialCost + laborCost,
        costPerUnit: 0,
      };
      db.orders[orderIndex].costs = productionCosts;
    }
  } else if (order.orderType === 'maintenance') {
    // MAINTENANCE ORDER: Deduct inputs (parts used) + calculate costs
    let materialCost = 0;

    // Deduct parts used from inventory
    for (const input of order.inputs) {
      const productIndex = db.products.findIndex(p => p.id === input.productId);
      if (productIndex !== -1) {
        db.products[productIndex].quantity -= input.quantity;
        db.products[productIndex].updatedAt = new Date().toISOString();
        materialCost += (input.costPerUnit || 0) * input.quantity;
      }
    }

    // Add stock parts cost (parts not from inventory)
    const stockPartsCost = (order.costs?.stockPartsCost || 0);
    const laborCost = (order.costs?.laborCost || 0);
    const totalCost = materialCost + stockPartsCost + laborCost;

    productionCosts = {
      materialCost,
      laborCost,
      totalCost,
      costPerUnit: 0,
      stockPartsCost,
    };
    db.orders[orderIndex].costs = productionCosts;
  } else if (order.orderType === 'sales') {
    // SALES ORDER: No inventory changes, just track costs
    const travelCost = (order.costs?.travelCost || 0);
    const laborCost = (order.costs?.laborCost || 0);
    const totalCost = travelCost + laborCost;

    productionCosts = {
      materialCost: 0,
      laborCost,
      totalCost,
      costPerUnit: 0,
      travelCost,
    };
    db.orders[orderIndex].costs = productionCosts;
  } else if (order.orderType === 'shipping') {
    // SHIPPING ORDER: Deduct packaging materials + calculate costs
    let materialCost = 0;

    // Deduct packaging materials from inventory
    for (const input of order.inputs) {
      const productIndex = db.products.findIndex(p => p.id === input.productId);
      if (productIndex !== -1) {
        db.products[productIndex].quantity -= input.quantity;
        db.products[productIndex].updatedAt = new Date().toISOString();
        materialCost += (input.costPerUnit || 0) * input.quantity;
      }
    }

    const carrierCost = (order.costs?.carrierCost || 0);
    const laborCost = (order.costs?.laborCost || 0);
    const totalCost = materialCost + carrierCost + laborCost;

    productionCosts = {
      materialCost,
      laborCost,
      totalCost,
      costPerUnit: 0,
      carrierCost,
    };
    db.orders[orderIndex].costs = productionCosts;
  }

  // Update order status
  db.orders[orderIndex].status = 'completed';
  db.orders[orderIndex].completedAt = new Date().toISOString();
  if (userId) {
    db.orders[orderIndex].completedBy = userId;
  }

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
