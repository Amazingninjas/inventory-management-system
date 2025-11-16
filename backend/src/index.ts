import express, { Request, Response } from 'express';
import cors from 'cors';
import * as db from './database';
import { Product, Order } from './types';

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
app.post('/api/products', (req: Request, res: Response) => {
  try {
    const { name, lot, quantity, location, description } = req.body;

    // Validation
    if (!name || !lot || quantity === undefined || !location) {
      return res.status(400).json({
        message: 'Missing required fields: name, lot, quantity, location are required',
      });
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' });
    }

    // Check if a product with the same name, lot, AND location exists
    const existingProducts = db.getAllProducts();
    const existingProduct = existingProducts.find(
      p => p.name === name && p.lot === lot && p.location === location
    );

    if (existingProduct) {
      // Consolidate: add quantity to existing product
      const updatedProduct = db.updateProduct(existingProduct.id, {
        quantity: existingProduct.quantity + quantity,
        description: description || existingProduct.description, // Use new description if provided
      });

      return res.status(200).json({
        message: 'Product consolidated with existing inventory',
        product: updatedProduct,
        consolidated: true,
      });
    }

    // No match found, create new product
    const newProduct = db.createProduct({
      name,
      lot,
      quantity,
      location,
      description,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: String(error) });
  }
});

// Update product
app.put('/api/products/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const { name, lot, quantity, location, description } = req.body;

    // Validate quantity if provided
    if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number' });
    }

    // No longer checking for duplicate lots - multiple products can have the same lot
    // as long as they differ in name or location

    const updatedProduct = db.updateProduct(id, {
      name,
      lot,
      quantity,
      location,
      description,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: String(error) });
  }
});

// Delete product
app.delete('/api/products/:id', (req: Request, res: Response) => {
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
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { type, inputs, notes } = req.body;

    // Validation
    if (!type || !inputs) {
      return res.status(400).json({
        message: 'Missing required fields: type and inputs are required',
      });
    }

    if (type !== 'production' && type !== 'fulfillment') {
      return res.status(400).json({
        message: 'Invalid order type. Must be "production" or "fulfillment"',
      });
    }

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({
        message: 'Inputs must be a non-empty array',
      });
    }

    // Validate each input item
    const validatedInputs = [];
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
      });
    }

    const newOrder = db.createOrder({
      type,
      inputs: validatedInputs,
      notes,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: String(error) });
  }
});

// Complete order
app.put('/api/orders/:id/complete', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const result = db.completeOrder(id);

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
