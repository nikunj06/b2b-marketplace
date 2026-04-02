# B2B Marketplace — DBMS Mini Project

A simplified B2B wholesale platform (Manufacturer → Retailer), similar to IndiaMART.  
Built with **Node.js + Express + MySQL + Bootstrap** for university evaluation.

---

## 📁 Project Structure

```
B2B-MARKETPLACE/
├── controllers/          # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── adminController.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── roleMiddleware.js  # Role-based access
├── frontend/
│   ├── login.html
│   ├── register.html
│   ├── manufacturer.html
│   ├── retailer.html
│   └── admin.html
├── database/
│   ├── schema.sql         # All tables with constraints
│   ├── triggers.sql       # 3 triggers
│   ├── procedures.sql     # 3 stored procedures
│   ├── queries.sql        # 10 example queries (basic + complex)
│   └── sample_data.sql    # Test data
├── db.js                  # MySQL connection pool
├── server.js              # Express app entry point
├── package.json
└── postman_tests.json     # API test collection
```

---

## 🚀 HOW TO RUN LOCALLY

### Step 1: Install Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://dev.mysql.com/downloads/) (v8.0+)
- [Postman](https://www.postman.com/) (for API testing)

### Step 2: Set Up the Database
```sql
-- Open MySQL Workbench or MySQL CLI, then run in order:
SOURCE database/schema.sql;
SOURCE database/triggers.sql;
SOURCE database/procedures.sql;
SOURCE database/sample_data.sql;
```

### Step 3: Install Node Dependencies
```bash
cd B2B-MARKETPLACE
npm install
```

### Step 4: Start the Server
```bash
node server.js
# or for auto-reload:
npx nodemon server.js
```

### Step 5: Open the App
- Visit: **http://localhost:3000/login.html**

---

## 🔐 Demo Login Credentials

| Role         | Email                    | Password    |
|--------------|--------------------------|-------------|
| Admin        | admin@b2b.com            | password123 |
| Manufacturer | ravi@texcorp.com         | password123 |
| Manufacturer | priya@priyaelec.com      | password123 |
| Retailer     | ankit@ankitmart.com      | password123 |
| Retailer     | meena@meenastores.com    | password123 |

---

## 🗄️ ER Diagram Description

### Entities & Relationships

```
Users (1) ─────── (1) Manufacturers
Users (1) ─────── (1) Retailers

Manufacturers (1) ─────── (M) Products
Products      (1) ─────── (1) Inventory   [Composite PK: product_id + manufacturer_id]
Manufacturers (1) ─────── (1) Inventory

Retailers     (1) ─────── (M) Purchase_Orders
Manufacturers (1) ─────── (M) Purchase_Orders
Purchase_Orders (1) ────── (M) Order_Items
Products      (1) ─────── (M) Order_Items
```

### Why these cardinalities?
- **Users → Manufacturers (1:1)**: A user account can register as only one manufacturer.
- **Users → Retailers (1:1)**: A user account can register as only one retailer.
- **Manufacturers → Products (1:M)**: One manufacturer can list many products.
- **Products → Inventory (1:1)**: Each product has exactly one inventory record per manufacturer (composite PK enforces this).
- **Purchase_Orders → Order_Items (1:M)**: One order can contain multiple products/line items.

---

## 📊 Database Design Concepts Demonstrated

### Normalization (3NF)
- **1NF**: All attributes are atomic. No repeating groups.
- **2NF**: All non-key attributes depend on the full primary key (important in Inventory with composite PK).
- **3NF**: No transitive dependencies. `price_at_purchase` is stored in `Order_Items` (not derived from current price) to avoid update anomalies.

### Constraints
- **PRIMARY KEY**: All tables have a PK.
- **FOREIGN KEY**: Referential integrity enforced across all relationships.
- **COMPOSITE PK**: `Inventory(product_id, manufacturer_id)` — prevents duplicate inventory entries.
- **UNIQUE**: `email`, `gst_number` — prevent duplicate registrations.
- **CHECK**: `stock_quantity >= 0`, `wholesale_price > 0`, `quantity > 0`.
- **ENUM**: `role` and `order_status` restrict to valid values only.

### Triggers
1. **prevent_negative_stock**: Fires BEFORE UPDATE on Inventory. Raises error if stock goes negative.
2. **log_order_status_change**: Fires AFTER UPDATE on Purchase_Orders. Writes to audit log table.
3. **prevent_order_item_without_stock**: Fires BEFORE INSERT on Order_Items. Validates stock and MOQ.

### Stored Procedures
1. **PlaceOrder**: Uses a TRANSACTION to atomically validate, create order, insert items, deduct stock. Rolls back on failure.
2. **UpdateOrderStatus**: Safely updates order status with validation.
3. **GetManufacturerSalesReport**: Aggregated sales report per manufacturer.

### Transactions
The `PlaceOrder` procedure uses `START TRANSACTION`, `COMMIT`, and `ROLLBACK` to ensure:
- Either ALL steps succeed (order created, stock deducted), or
- NONE of them persist (rollback on failure).

---

## 📝 Report Content

### Problem Statement
Traditional wholesale trade in India relies heavily on phone calls, visits, and informal negotiations. Small manufacturers struggle to reach retailers, while retailers have limited visibility into available products and pricing. This project implements a simplified B2B marketplace that digitizes bulk product listing, discovery, and order placement between manufacturers and retailers.

### Objectives
1. Design a normalized relational database demonstrating 3NF.
2. Implement role-based access for Manufacturers, Retailers, and Admins.
3. Demonstrate transactions via atomic order placement.
4. Use triggers for data integrity enforcement.
5. Provide stored procedures for reusable database logic.
6. Build a REST API with JWT authentication.
7. Create a responsive web-based dashboard UI.

### System Architecture
The system follows a 3-tier architecture:
- **Presentation Layer**: HTML/CSS/Bootstrap/JavaScript frontend
- **Application Layer**: Node.js + Express.js REST API
- **Data Layer**: MySQL relational database

### Transaction Explanation
The PlaceOrder stored procedure wraps all order-related operations in a single transaction. This ensures atomicity: if stock deduction fails (e.g., another order depletes stock simultaneously), the entire transaction rolls back, preventing partial data corruption.

### Trigger Explanation
Triggers enforce business rules at the database level, independent of application code. For example, `prevent_negative_stock` fires before any UPDATE on the Inventory table, ensuring stock can never go below zero regardless of how the database is accessed.

---

## 📬 API Endpoints Summary

| Method | Endpoint                         | Auth   | Role         |
|--------|----------------------------------|--------|--------------|
| POST   | /api/auth/register               | No     | Public       |
| POST   | /api/auth/login                  | No     | Public       |
| POST   | /api/products/add                | Yes    | Manufacturer |
| GET    | /api/products/all                | Yes    | Any          |
| GET    | /api/products/manufacturer/:id   | Yes    | Manufacturer |
| PUT    | /api/products/inventory/update   | Yes    | Manufacturer |
| POST   | /api/orders/place                | Yes    | Retailer     |
| GET    | /api/orders/retailer/:id         | Yes    | Retailer     |
| GET    | /api/orders/manufacturer/:id     | Yes    | Manufacturer |
| PUT    | /api/orders/status               | Yes    | Manufacturer |
| GET    | /api/admin/users                 | Yes    | Admin        |
| GET    | /api/admin/orders                | Yes    | Admin        |
| GET    | /api/admin/inventory             | Yes    | Admin        |
| GET    | /api/admin/stats                 | Yes    | Admin        |
