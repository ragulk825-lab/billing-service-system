import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Dashboard data
router.get('/dashboard', reportController.getDashboardData);

// Monthly revenue
router.get('/monthly-revenue', reportController.getMonthlyRevenue);

// Top products
router.get('/top-products', reportController.getTopProducts);

// Daily report
router.get('/daily', reportController.getDailyReport);

// Monthly report
router.get('/monthly', reportController.getMonthlyReport);

export default router;
