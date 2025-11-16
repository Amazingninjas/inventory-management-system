# Inventory Management API Documentation

## Base URL
```
http://localhost:5000/api
```

## Product Endpoints

### Get All Products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Steel Sheet",
    "sku": "RAW-001",
    "quantity": 500,
    "location": "Warehouse A",
    "description": "Cold-rolled steel sheets",
    "createdAt": "2025-11-13T21:28:39.538Z",
    "updatedAt": "2025-11-13T21:28:39.538Z"
  }
]
```

### Search Products
```http
GET /api/products/search?q=steel
```

**Query Parameters:**
- `q` (string, required): Search query (searches name and SKU)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Steel Sheet",
    "sku": "RAW-001",
    ...
  }
]
```

### Get Single Product
```http
GET /api/products/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Steel Sheet",
  ...
}
```

### Create Product
```http
POST /api/products
```

**Request Body:**
```json
{
  "name": "New Product",
  "sku": "PRD-001",
  "quantity": 100,
  "location": "Warehouse A",
  "description": "Optional description"
}
```

**Response:** (201 Created)
```json
{
  "id": 7,
  "name": "New Product",
  "sku": "PRD-001",
  "quantity": 100,
  "location": "Warehouse A",
  "description": "Optional description",
  "createdAt": "2025-11-13T21:29:29.947Z",
  "updatedAt": "2025-11-13T21:29:29.947Z"
}
```

**Validation:**
- `name`, `sku`, `quantity`, `location` are required
- `quantity` must be a non-negative number
- `sku` must be unique

### Update Product
```http
PUT /api/products/:id
```

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "quantity": 150,
  "location": "Warehouse B"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Name",
  ...
}
```

### Delete Product
```http
DELETE /api/products/:id
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

**Error:** Cannot delete products used in pending orders

---

## Order Endpoints

### Get All Orders
```http
GET /api/orders
```

**Response:**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-001",
    "type": "production",
    "status": "pending",
    "inputs": [
      {
        "productId": 1,
        "productName": "Steel Sheet",
        "productSku": "RAW-001",
        "quantity": 10,
        "location": "Warehouse A"
      }
    ],
    "notes": "Production run for table frames",
    "createdAt": "2025-11-13T21:28:39.538Z"
  }
]
```

### Get Single Order
```http
GET /api/orders/:id
```

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-001",
  ...
}
```

### Create Order
```http
POST /api/orders
```

**Request Body:**
```json
{
  "type": "production",
  "inputs": [
    {
      "productId": 1,
      "quantity": 10
    },
    {
      "productId": 2,
      "quantity": 5
    }
  ],
  "notes": "Optional order notes"
}
```

**Response:** (201 Created)
```json
{
  "id": 2,
  "orderNumber": "ORD-002",
  "type": "production",
  "status": "pending",
  "inputs": [...],
  "notes": "Optional order notes",
  "createdAt": "2025-11-13T21:29:43.107Z"
}
```

**Validation:**
- `type` must be "production" or "fulfillment"
- `inputs` must be a non-empty array
- Each input must have `productId` and `quantity`
- `quantity` must be a positive number
- All `productId` values must exist

### Complete Order
```http
PUT /api/orders/:id/complete
```

**Response:**
```json
{
  "message": "Order completed successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-001",
    "status": "completed",
    "completedAt": "2025-11-13T21:29:30.043Z",
    ...
  }
}
```

**Error Response:** (400 Bad Request)
```json
{
  "message": "Cannot complete order due to inventory issues",
  "errors": [
    "Insufficient stock for Steel Sheet: need 10, have 5"
  ],
  "order": {...}
}
```

**Business Logic:**
- Can only complete orders with status "pending"
- Validates sufficient inventory for all input items
- Deducts input quantities from product inventory
- Updates product `updatedAt` timestamps

### Delete Order
```http
DELETE /api/orders/:id
```

**Response:**
```json
{
  "message": "Order deleted successfully"
}
```

**Error:** Can only delete pending orders

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields: name, sku, quantity, location are required"
}
```

### 404 Not Found
```json
{
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error fetching products",
  "error": "Detailed error message"
}
```

---

## Database

**Location:** `backend/data/db.json`

**Structure:**
```json
{
  "products": [...],
  "orders": [...],
  "nextProductId": 7,
  "nextOrderId": 2,
  "nextOrderNumber": 2
}
```

Data persists across server restarts.

---

## Testing Examples

### Test Product Creation
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Widget",
    "sku": "TEST-001",
    "quantity": 100,
    "location": "Warehouse A",
    "description": "Test product"
  }'
```

### Test Order Creation
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fulfillment",
    "inputs": [
      {"productId": 5, "quantity": 3}
    ],
    "notes": "Ship tables to customer"
  }'
```

### Test Order Completion
```bash
curl -X PUT http://localhost:5000/api/orders/1/complete
```

### Test Search
```bash
curl "http://localhost:5000/api/products/search?q=steel"
```
