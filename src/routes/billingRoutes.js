import express from 'express';
import * as billingController from '../controllers/billingController.js';
import * as inventoryController from '../controllers/inventoryController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ===== BILLING ROUTES =====
// Get all bills
router.get('/bills', billingController.getBills);

// Get bill by ID
router.get('/bills/:id', billingController.getBillById);

// Create bill
router.post('/bills', requireRole('admin', 'manager', 'billing_staff'), billingController.createBill);

// Update bill status
router.put('/bills/:id', requireRole('admin', 'manager', 'billing_staff'), billingController.updateBillStatus);

// Cancel bill
router.delete('/bills/:id', requireRole('admin', 'manager', 'billing_staff'), billingController.cancelBill);

// ===== INVENTORY/PRODUCT ROUTES =====
// Get all products
router.get('/products', inventoryController.getProducts);

// Search products
router.get('/products/search', inventoryController.searchProducts);

// Get product by barcode
router.get('/products/barcode/:barcode', inventoryController.getProductByBarcode);

// Get low stock products
router.get('/products/low-stock', inventoryController.getLowStockProducts);

// Get all categories
router.get('/categories', inventoryController.getCategories);

// Create category
router.post('/categories', requireRole('admin', 'manager'), inventoryController.createCategory);

// Create product
router.post('/products', requireRole('admin', 'manager'), inventoryController.createProduct);

// Update product
router.put('/products/:id', requireRole('admin', 'manager'), inventoryController.updateProduct);

export default router;
