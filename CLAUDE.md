# Inventory Management System - Project Context

**IMPORTANT: This project is tested on a cloud server. Always commit and push changes to git after making modifications.**

## Recent Major Updates (November 2025)

The system has been upgraded from a simple inventory tracker to a **full ERP manufacturing system** with multi-stage production, cost tracking, and financial analytics.

### System Overview

This is a PSM (Pressure Sensitive Material) manufacturing ERP system that tracks the complete production flow from raw materials through multiple work-in-progress stages to finished goods, with detailed cost accounting.

**Manufacturing Process:**
```
Raw Materials (Film, Adhesive, Liner, Top-coat)
    ↓ Stage 1: Coating
Work in Progress (Coated Film)
    ↓ Stage 2: Adhesive Application
Work in Progress (Coated Film w/ Adhesive)
    ↓ Stage 3: Liner Application
Work in Progress (Master Roll)
    ↓ Stage 4: Cutting
Finished Goods (581-215, 582-22, etc.)
```

### Technology Stack

**Backend:**
- TypeScript 5.9.3 + Express 5.x
- JSON file database with BOM (Bill of Materials) support
- Session-based authentication (in-memory store)
- Cost calculation engine

**Frontend:**
- React 18 + TypeScript + Vite 7
- TailwindCSS for styling
- React Router v6 with protected routes
- Axios with auth interceptors

### Key Features Implemented

#### 1. Authentication & Authorization
- Login system (Demo/Demo credentials)
- Role-based access control: Operator, Manager, Admin
- Session management with auto-redirect on 401
- Protected routes throughout application
- Permission checks (e.g., only Manager/Admin can delete products)

#### 2. Multi-Stage Manufacturing
- **Product Types:**
  - `raw`: Purchased materials (Film, Adhesive, Liner, Top-coat)
  - `wip`: Work in Progress (Coated Film, Master Rolls, etc.)
  - `finished`: Final products ready for customers

- **Bill of Materials (BOM):**
  - Each WIP/Finished product has a BOM listing required inputs
  - Quantities specified per unit of output
  - Supports multi-level BOMs (WIP can use other WIP as inputs)

#### 3. Order Management System
Three order types replacing the old input-only system:

- **Purchase Orders**: Bring raw materials into inventory (outputs only)
- **Production Orders**: Consume inputs, produce outputs, calculate costs
- **Fulfillment Orders**: Ship products to customers (inputs only)

#### 4. Cost Accounting Engine
Automatic cost calculation when completing production orders:
- **Material costs**: Sum of (input quantity × input cost per unit)
- **Labor costs**: Output quantity × labor cost per unit
- **Total cost per unit**: (Material + Labor) / Output quantity
- Costs automatically update product.costPerUnit when produced
- Foundation for variance tracking (actual vs standard costs)

#### 5. Product Data Model
```typescript
interface Product {
  // Basic info
  id: number;
  name: string;
  lot: string;
  productType: 'raw' | 'wip' | 'finished';

  // Measurements
  unit: 'MSI' | 'feet' | 'lbs' | 'gallons' | 'units';
  width?: number; // in inches (for MSI/feet products)
  quantity: number;

  // Financials
  costPerUnit: number;
  laborCostPerUnit?: number;

  // Manufacturing
  bom?: BOMItem[]; // Bill of materials

  // Metadata
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 6. Sample Data - Product Lines
**581-215 (21.5" wide) Manufacturing Chain:**
1. PET Film + Top-coat 581 → Coated Film 581-215
2. Coated Film 581-215 + Adhesive 581 → Coated Film w/ Adhesive 581-215
3. Coated Film w/ Adhesive 581-215 + Liner → Master Roll 581-215
4. Master Roll 581-215 → 581-215 (finished, cut to spec)

**582-22 (22" wide) Manufacturing Chain:**
- Same 4-stage process with different top-coat and adhesive

**Placeholder Costs (to be updated with real data):**
- Raw materials: $0.30 - $1.50/MSI
- Labor: $0.15 - $0.30/MSI per stage
- Total finished product cost: ~$4-5/MSI

### MSI Calculation
The system uses MSI (thousand square inches) as the primary unit:
- Formula: `MSI = feet × width(inches) × 0.012`
- Product width encoded in SKU: 581-**215** = 21.5 inches, 582-**22** = 22 inches
- Example: 1000 feet × 21.5" wide = 1000 × 21.5 × 0.012 = 258 MSI

### API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login (returns token)
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/session` - Check current session

**Products:**
- `GET /api/products` - List all products
- `GET /api/products/search?q=query` - Search by name/lot
- `POST /api/products` - Create (requires auth)
- `PUT /api/products/:id` - Update (requires auth)
- `DELETE /api/products/:id` - Delete (requires auth + Manager/Admin role)

**Orders:**
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order (requires auth)
  - Body: `{ orderType, inputs[], outputs[], notes }`
- `PUT /api/orders/:id/complete` - Complete order, update inventory & costs (requires auth)
- `DELETE /api/orders/:id` - Cancel pending order (requires auth)

### Database Structure
File: `backend/data/db.json`

```json
{
  "users": [
    { "id": 1, "username": "Demo", "password": "Demo", "role": "admin", "name": "Demo User" }
  ],
  "products": [
    // 6 raw materials
    // 6 WIP products (3 stages × 2 product lines)
    // 2 finished products
  ],
  "orders": [],
  "nextUserId": 2,
  "nextProductId": 15,
  "nextOrderId": 1,
  "nextOrderNumber": 1
}
```

### UI Status

**Completed:**
- Login page with credential display
- Authentication routing and context
- Layout with user info and role badges
- Logout functionality

**Needs UI Updates (backend supports, UI needs work):**
- Product pages: Display product type, width, cost, BOM
- Order creation: Select order type, configure inputs AND outputs
- Order details: Show production costs breakdown
- Dashboard: Financial summaries, inventory valuation

### Business Logic

**Production Order Completion:**
1. Validate sufficient inventory for all inputs
2. Deduct input quantities from inventory
3. Calculate material costs (sum of input quantities × input costs)
4. Calculate labor costs (output quantity × labor cost per unit)
5. Add output quantities to inventory
6. Update output product costPerUnit with calculated cost
7. Store costs on order for reporting
8. Mark order as completed with timestamp and user ID

**Constraints:**
- Cannot delete products used in pending orders
- Cannot delete products (requires Manager/Admin role)
- Cannot complete orders with insufficient inventory
- Minimum PSM width: 10 inches (typical constraint)

### Next Steps for Full ERP Demo

**High Priority:**
1. Update product list UI to show type badges, costs, width
2. Redesign order creation modal for order type selection
3. Add production cost display on order details
4. Update dashboard with financial KPIs

**Future Enhancements:**
- Standard costs for variance analysis
- Multi-location inventory tracking
- Purchase order integration with vendors
- Customer order management
- Work order scheduling and capacity planning
- Quality control checkpoints
- Scrap/waste tracking
- Reporting module (P&L, inventory valuation, production efficiency)

### Development Commands

**Start both servers:**
```bash
# Backend
cd backend && npm run dev  # http://localhost:5000

# Frontend
cd frontend && npm run dev # http://localhost:5173
```

**Or use Windows launcher:**
```
start-inventory-system.bat
```

### Demo Credentials
- Username: `Demo`
- Password: `Demo`
- Role: Admin (full access)

### Important Files
- `backend/src/types.ts` - All TypeScript interfaces
- `backend/src/database.ts` - Data operations & cost calculation
- `backend/src/index.ts` - API routes & authentication
- `frontend/src/types.ts` - Frontend type definitions
- `frontend/src/api.ts` - API client with auth interceptors
- `frontend/src/context/AuthContext.tsx` - Authentication state management

### Cost Tracking Example

**Production Order: Make 100 MSI of Coated Film 581-215**
- Inputs:
  - 100 MSI PET Film @ $0.50/MSI = $50.00
  - 100 MSI Top-coat 581 @ $0.80/MSI = $80.00
- Labor: 100 MSI @ $0.25/MSI = $25.00
- **Total cost: $155.00**
- **Cost per unit: $1.55/MSI**

When the order completes:
- Inventory: -100 Film, -100 Top-coat, +100 Coated Film
- Coated Film 581-215 costPerUnit updated to $1.55

This cost rolls up through subsequent stages, building the final product cost.
- to memorize
- to memorize
- to memorize