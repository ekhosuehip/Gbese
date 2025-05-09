import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getNotifications, getTransactions} from '../controllers/activityController'

const router = Router()
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT

 * security:
 *   - bearerAuth: []

 * @description
 * This middleware (`protect`) ensures that a valid JWT token is provided in the Authorization header or cookies.
 * It should be applied to all protected routes. If the token is missing or invalid, it returns a 401 Unauthorized response.
 */

router.use(protect);
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags:
 *       - Notification
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications fetched successfully or no notifications found
 *       500:
 *         description: Internal server error
 */

router.get('/notifications', getNotifications);
/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions for the logged-in user
 *     tags:
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions fetched successfully or no recent transaction
 *       500:
 *         description: Internal server error
 */

router.get('/transactions', getTransactions)


export default router
