import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as db from './database';
import { Product, Order, User } from './types';

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);
const host = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for network access

// CORS configuration - allow requests from anywhere (can be restricted via ALLOWED_ORIGINS env var)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*']; // Allow all origins by default

app.use(cors({
  origin: allowedOrigins[0] === '*' ? '*' : allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Simple in-memory session store (in production, use Redis or JWT)
interface Session {
  userId: number;
  username: string;
  role: string;
  createdAt: Date;
}

const sessions = new Map<string, Session>();

// Generate simple session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  // Attach user info to request
  (req as any).user = session;
  next();
}

// Middleware to check role permissions
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as Session | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// ===== AUTHENTICATION ENDPOINTS =====

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = db.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create session
    const token = generateSessionToken();
    sessions.set(token, {
      userId: user.id,
      username: user.username,
      role: user.role,
      createdAt: new Date(),
    });

    // Return user info and token
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: String(error) });
  }
});

// Logout
app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      sessions.delete(token);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout', error: String(error) });
  }
});

// Check session
app.get('/api/auth/session', requireAuth, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as Session;
    const dbUser = db.getUserById(user.userId);

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: dbUser.id,
        username: dbUser.username,
        name: dbUser.name,
        role: dbUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking session', error: String(error) });
  }
});

// ===== PRODUCT ENDPOINTS =====

// Get all products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const products = db.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: String(error) });
  }
});

// Search products
app.get('/api/products/search', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = db.searchProducts(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: String(error) });
  }
});

// Get single product
app.get('/api/products/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = db.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: String(error) });
  }
});

// Create product
app.post('/api/products', requireAuth, (req: Request, res: Response) => {
  try {
    const {
      name,
      lot,
      productType,
      unit,
      width,
      quantity,
      costPerUnit,
      location,
      description,
      bom,
      laborCostPerUnit,
    } = req.body;

    // Validation
    if (!name || !lot || !productType || !unit || quantity === undefined || costPerUnit === undefined || !location) {
      return res.status(400).json({
        message: 'Missing required fields: name, lot, productType, unit, quantity, costPerUnit, location are required',
      });
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' });
    }

    if (typeof costPerUnit !== 'number' || costPerUnit < 0) {
      return res.status(400).json({ message: 'Cost per unit must be a non-negative number' });
    }

    // No match found, create new product
    const newProduct = db.createProduct({
      name,
      lot,
      productType,
      unit,
      width,
      quantity,
      costPerUnit,
      location,
      description,
      bom,
      laborCostPerUnit,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: String(error) });
  }
});

// Update product
app.put('/api/products/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const {
      name,
      lot,
      productType,
      unit,
      width,
      quantity,
      costPerUnit,
      location,
      description,
      bom,
      laborCostPerUnit,
    } = req.body;

    // Validate quantity if provided
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' });
    }

    if (costPerUnit !== undefined && (typeof costPerUnit !== 'number' || costPerUnit < 0)) {
      return res.status(400).json({ message: 'Cost per unit must be a non-negative number' });
    }

    const updatedProduct = db.updateProduct(id, {
      name,
      lot,
      productType,
      unit,
      width,
      quantity,
      costPerUnit,
      location,
      description,
      bom,
      laborCostPerUnit,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: String(error) });
  }
});

// Delete product (requires manager or admin role)
app.delete('/api/products/:id', requireAuth, requireRole('manager', 'admin'), (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const deleted = db.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('pending orders')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting product', error: String(error) });
  }
});

// ===== ORDER ENDPOINTS =====

// Get all orders
app.get('/api/orders', (req: Request, res: Response) => {
  try {
    const orders = db.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: String(error) });
  }
});

// Get single order
app.get('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = db.getOrderById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: String(error) });
  }
});

// Create order
app.post('/api/orders', requireAuth, (req: Request, res: Response) => {
  try {
    const { orderType, inputs, outputs, notes } = req.body;
    const user = (req as any).user as Session;

    // Validation
    if (!orderType) {
      return res.status(400).json({
        message: 'Missing required field: orderType is required',
      });
    }

    if (orderType !== 'purchase' && orderType !== 'production' && orderType !== 'fulfillment') {
      return res.status(400).json({
        message: 'Invalid order type. Must be "purchase", "production", or "fulfillment"',
      });
    }

    // Validate inputs (required for production and fulfillment)
    const validatedInputs = [];
    if (inputs && Array.isArray(inputs) && inputs.length > 0) {
      for (const input of inputs) {
        if (!input.productId || !input.quantity) {
          return res.status(400).json({
            message: 'Each input must have productId and quantity',
          });
        }

        if (typeof input.quantity !== 'number' || input.quantity <= 0) {
          return res.status(400).json({
            message: 'Input quantity must be a positive number',
          });
        }

        // Fetch product details
        const product = db.getProductById(input.productId);
        if (!product) {
          return res.status(404).json({
            message: `Product not found: ID ${input.productId}`,
          });
        }

        validatedInputs.push({
          productId: product.id,
          productName: product.name,
          productLot: product.lot,
          quantity: input.quantity,
          location: product.location,
          costPerUnit: product.costPerUnit,
        });
      }
    }

    // Validate outputs (required for purchase and production)
    const validatedOutputs = [];
    if (outputs && Array.isArray(outputs) && outputs.length > 0) {
      for (const output of outputs) {
        if (!output.productId || !output.quantity) {
          return res.status(400).json({
            message: 'Each output must have productId and quantity',
          });
        }

        if (typeof output.quantity !== 'number' || output.quantity <= 0) {
          return res.status(400).json({
            message: 'Output quantity must be a positive number',
          });
        }

        // Fetch product details
        const product = db.getProductById(output.productId);
        if (!product) {
          return res.status(404).json({
            message: `Product not found: ID ${output.productId}`,
          });
        }

        validatedOutputs.push({
          productId: product.id,
          productName: product.name,
          productLot: product.lot,
          quantity: output.quantity,
          location: product.location,
          costPerUnit: product.costPerUnit,
        });
      }
    }

    // Type-specific validation
    if (orderType === 'purchase' && validatedOutputs.length === 0) {
      return res.status(400).json({
        message: 'Purchase orders must have at least one output',
      });
    }

    if (orderType === 'production') {
      if (validatedInputs.length === 0) {
        return res.status(400).json({
          message: 'Production orders must have at least one input',
        });
      }
      if (validatedOutputs.length === 0) {
        return res.status(400).json({
          message: 'Production orders must have at least one output',
        });
      }
    }

    if (orderType === 'fulfillment' && validatedInputs.length === 0) {
      return res.status(400).json({
        message: 'Fulfillment orders must have at least one input',
      });
    }

    const newOrder = db.createOrder({
      orderType,
      inputs: validatedInputs,
      outputs: validatedOutputs,
      notes,
      createdBy: user.userId,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: String(error) });
  }
});

// Complete order
app.put('/api/orders/:id/complete', requireAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = (req as any).user as Session;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const result = db.completeOrder(id, user.userId);

    if (result.errors.length > 0) {
      return res.status(400).json({
        message: 'Cannot complete order due to inventory issues',
        errors: result.errors,
        order: result.order,
      });
    }

    res.json({
      message: 'Order completed successfully',
      order: result.order,
    });
  } catch (error: any) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Cannot complete order')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error completing order', error: String(error) });
  }
});

// Delete order
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const deleted = db.deleteOrder(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    if (error.message.includes('pending orders')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting order', error: String(error) });
  }
});

// ===== SERVER =====

app.listen(port, host, () => {
  console.log(`🚀 Inventory Management API running on http://${host}:${port}`);
  console.log(`📦 Database file: backend/data/db.json`);
  console.log(`🌐 API endpoints available at http://${host}:${port}/api`);
  console.log(`\n📡 Network Access:`);
  console.log(`   Local:   http://localhost:${port}/api`);
  console.log(`   Network: http://<your-ip>:${port}/api`);
  console.log(`\n💡 To find your IP: ipconfig (Windows) or ifconfig (Linux/Mac)`);
});
