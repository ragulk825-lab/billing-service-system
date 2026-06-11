# API Documentation - Service Center Management System

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except `/auth/login`) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "username": "admin",
    "email": "admin@servicecenter.local",
    "fullName": "Administrator",
    "role": "admin"
  }
}
```

**Status Code:** 200

---

### 2. Get Current User Profile
**Endpoint:** `GET /auth/profile`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "username": "admin",
    "email": "admin@servicecenter.local",
    "fullName": "Administrator",
    "role": "admin",
    "phone": "9876543210",
    "status": "active",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### 3. Refresh Token
**Endpoint:** `POST /auth/refresh-token`

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token"
}
```

---

## Customer Endpoints

### 1. Get All Customers
**Endpoint:** `GET /customers`

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "cust-001",
      "name": "John Doe",
      "phone": "9876543210",
      "email": "john@example.com",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "gstin": "27AABCT1234H1Z0",
      "outstandingBalance": 5000,
      "status": "active",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 2. Search Customers
**Endpoint:** `GET /customers/search?query=john`

**Query Parameters:**
- `query` (string, required) - Search by name, phone, or email

**Response:** Array of matching customers

---

### 3. Get Customer Details
**Endpoint:** `GET /customers/:id`

**Response:** Single customer object

---

### 4. Create Customer
**Endpoint:** `POST /customers`

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "email": "john@example.com",
  "alternatePhone": "9876543211",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "gstin": "27AABCT1234H1Z0"
}
```

**Required Fields:** name, phone

---

### 5. Update Customer
**Endpoint:** `PUT /customers/:id`

**Request Body:** Same as Create (all fields optional)

---

### 6. Delete Customer
**Endpoint:** `DELETE /customers/:id`

**Note:** Marks customer as inactive instead of hard delete

---

### 7. Get Customer Bills
**Endpoint:** `GET /customers/:id/bills`

**Response:** Array of bills for the customer

---

### 8. Get Customer Services
**Endpoint:** `GET /customers/:id/services`

**Response:** Array of services for the customer

---

## Billing Endpoints

### 1. Get All Bills
**Endpoint:** `GET /billing/bills`

**Query Parameters:**
- `status` - Filter by status (draft, confirmed, printed, cancelled)
- `paymentStatus` - Filter by payment status (paid, pending, partial)
- `customerId` - Filter by customer

---

### 2. Get Bill Details
**Endpoint:** `GET /billing/bills/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "bill-001",
    "invoiceNumber": "INV-20240115-0001",
    "customerId": "cust-001",
    "customerName": "John Doe",
    "billDate": "2024-01-15T10:00:00Z",
    "subtotal": 10000,
    "discountAmount": 1000,
    "discountPercentage": 10,
    "taxAmount": 1620,
    "totalAmount": 10620,
    "paidAmount": 10620,
    "paymentStatus": "paid",
    "paymentMethod": "cash",
    "status": "confirmed",
    "items": [
      {
        "id": "item-001",
        "productName": "RAM 8GB",
        "quantity": 2,
        "unitPrice": 5000,
        "discount": 0,
        "tax": 1620,
        "total": 10000
      }
    ]
  }
}
```

---

### 3. Create Bill
**Endpoint:** `POST /billing/bills`

**Request Body:**
```json
{
  "customerId": "cust-001",
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitPrice": 5000,
      "discount": 500,
      "tax": 0
    }
  ],
  "discountAmount": 1000,
  "discountPercentage": 0,
  "notes": "Service charge applied",
  "paymentMethod": "cash"
}
```

---

### 4. Update Bill Status
**Endpoint:** `PUT /billing/bills/:id`

**Request Body:**
```json
{
  "status": "confirmed",
  "paymentStatus": "paid",
  "paidAmount": 10620
}
```

---

### 5. Cancel Bill
**Endpoint:** `DELETE /billing/bills/:id`

**Note:** Cancels bill and restores inventory

---

## Product Endpoints

### 1. Get All Products
**Endpoint:** `GET /billing/products`

**Query Parameters:**
- `categoryId` - Filter by category
- `status` - Filter by status

---

### 2. Search Products
**Endpoint:** `GET /billing/products/search?query=ram`

**Response:** Array of matching products

---

### 3. Get Product by Barcode
**Endpoint:** `GET /billing/products/barcode/:barcode`

---

### 4. Get Low Stock Products
**Endpoint:** `GET /billing/products/low-stock`

**Response:** Products where quantity <= reorderLevel

---

### 5. Create Product
**Endpoint:** `POST /billing/products`

**Request Body:**
```json
{
  "categoryId": "cat-001",
  "name": "RAM 8GB DDR4",
  "description": "8GB RAM Module",
  "sku": "RAM-8GB-001",
  "barcode": "1234567890123",
  "purchasePrice": 2500,
  "sellingPrice": 3500,
  "reorderLevel": 10,
  "unit": "pcs",
  "hsn": "8471.30.90",
  "gstApplicable": true
}
```

---

### 6. Update Product
**Endpoint:** `PUT /billing/products/:id`

---

## Service Endpoints

### 1. Get All Services
**Endpoint:** `GET /services`

**Query Parameters:**
- `status` - Filter by status
- `technicianId` - Filter by technician

---

### 2. Get Service Details
**Endpoint:** `GET /services/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "srv-001",
    "serviceId": "SRV-20240115-0001",
    "customerId": "cust-001",
    "customerName": "John Doe",
    "deviceType": "laptop",
    "serialNumber": "SN123456",
    "deviceModel": "Dell XPS 13",
    "problemDescription": "Screen not turning on",
    "estimatedCost": 5000,
    "finalCost": 4500,
    "technicianId": "tech-001",
    "technicianName": "John Technician",
    "status": "completed",
    "createdAt": "2024-01-15T10:00:00Z",
    "timeline": [
      {
        "id": "tl-001",
        "status": "received",
        "description": "Service ticket created",
        "createdBy": "admin",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### 3. Create Service
**Endpoint:** `POST /services`

**Request Body:**
```json
{
  "customerId": "cust-001",
  "deviceType": "laptop",
  "serialNumber": "SN123456",
  "deviceModel": "Dell XPS 13",
  "problemDescription": "Screen not turning on",
  "estimatedCost": 5000
}
```

**Device Types:** laptop, desktop, printer, monitor, ups, router, switch, networking_device

---

### 4. Update Service Status
**Endpoint:** `PUT /services/:id/status`

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Diagnosed faulty motherboard"
}
```

**Valid Statuses:** received, diagnosing, waiting_parts, in_progress, completed, delivered

---

### 5. Assign Technician
**Endpoint:** `PUT /services/:id/technician`

**Request Body:**
```json
{
  "technicianId": "tech-001"
}
```

---

### 6. Search Services
**Endpoint:** `GET /services/search?query=john&searchType=customer`

**Query Parameters:**
- `query` - Search term (required)
- `searchType` - customer, phone, serviceId, serial (optional, default: customer)

---

## Expense Endpoints

### 1. Get All Expenses
**Endpoint:** `GET /expenses`

**Query Parameters:**
- `category` - Filter by category
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

---

### 2. Create Expense
**Endpoint:** `POST /expenses`

**Request Body:**
```json
{
  "category": "rent",
  "description": "Office rent - January",
  "amount": 50000,
  "paymentMethod": "transfer",
  "reference": "Cheque #001",
  "expenseDate": "2024-01-01"
}
```

**Categories:** rent, electricity, salary, internet, supplies, maintenance, other

---

### 3. Delete Expense
**Endpoint:** `DELETE /expenses/:id`

---

### 4. Get Expense Summary
**Endpoint:** `GET /expenses/summary`

**Query Parameters:**
- `startDate` - Start date
- `endDate` - End date

---

## Report Endpoints

### 1. Get Dashboard Data
**Endpoint:** `GET /reports/dashboard`

**Response:** Today's stats, recent bills, recent services

---

### 2. Get Daily Report
**Endpoint:** `GET /reports/daily?date=2024-01-15`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "revenue": 15000,
    "expenses": 5000,
    "profit": 10000,
    "serviceRevenue": 0,
    "servicesCompleted": 2
  }
}
```

---

### 3. Get Monthly Report
**Endpoint:** `GET /reports/monthly?month=2024-01`

**Response:** Monthly revenue, expenses, services completed, top products

---

### 4. Get Monthly Revenue
**Endpoint:** `GET /reports/monthly-revenue?year=2024`

**Response:** Array of revenue by month

---

### 5. Get Top Products
**Endpoint:** `GET /reports/top-products?limit=10`

**Response:** Top selling products

---

## User Endpoints

### 1. Get All Users
**Endpoint:** `GET /users`

**Response:** Array of all users (Admin/Manager only)

---

### 2. Create User
**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "username": "technician1",
  "email": "tech1@servicecenter.local",
  "password": "secure_password",
  "fullName": "John Technician",
  "role": "technician",
  "phone": "9876543210"
}
```

**Roles:** admin, manager, technician, billing_staff

---

### 3. Update User
**Endpoint:** `PUT /users/:id`

---

### 4. Change Password
**Endpoint:** `POST /users/:id/change-password`

**Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

---

### 5. Delete User
**Endpoint:** `DELETE /users/:id`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": "Required field missing"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Duplicate entry or constraint violation"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details (development only)"
}
```

---

## Rate Limiting
Currently no rate limiting is implemented. Can be added using `express-rate-limit` middleware.

---

## Pagination
Not implemented yet. Can be added to list endpoints in future versions.

---

## Version
API Version: 1.0.0

---

## Support
For API issues, check logs in `/logs/app.log` or `/logs/error.log`
