import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getNotifications, 
        getTransactions, 
        fundAcc, 
        sendMoneyInternal, 
        sendMoneyExternal,
        requestMoney,
        acceptRequest,
        rejectRequest,
        getRequests} from '../controllers/activityController'

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
 *     tags:`
 *       - Transaction
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions fetched successfully or no recent transaction
 *       500:
 *         description: Internal server error
 */

router.get('/transactions', getTransactions);

router.post('/fund/account', fundAcc)
/**
 * @swagger
 * /api/v2/account/transfer/internal:
 *   post:
 *     summary: Send money internally to another user within the platform
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - accNumber
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               accNumber:
 *                 type: string
 *                 description: Receiver's phone number without the country code (e.g., '8123456789')
 *                 example: "8123456789"
 *               note:
 *                 type: string
 *                 example: "For lunch"
 *     responses:
 *       200:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transfer successful
 *       400:
 *         description: Invalid receiver details
 *       409:
 *         description: Insufficient funds
 *       500:
 *         description: Internal server error
 */


router.post('/send/internal', sendMoneyInternal);
/**
 * @swagger
 * /api/v2/account/transfer/internal/data:
 *   post:
 *     summary: Prepare internal transfer transaction details
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - accNumber
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               accNumber:
 *                 type: string
 *                 description: Receiver's phone number without country code
 *                 example: "8123456789"
 *               note:
 *                 type: string
 *                 example: "Thanks for the help"
 *     responses:
 *       200:
 *         description: Returns formatted transaction preview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transaction details
 *                 data:
 *                   type: object
 *                   properties:
 *                     to:
 *                       type: string
 *                       example: John Doe
 *                     date:
 *                       type: string
 *                       example: May 13, 2025
 *                     amount:
 *                       type: number
 *                       example: 1000
 *                     bank:
 *                       type: string
 *                       example: Gbese
 *                     reference:
 *                       type: string
 *                       example: INV-EXT-2025-8432
 *                     fee:
 *                       type: string
 *                       example: "#00.00"
 *                     total:
 *                       type: string
 *                       example: "#1000.00"
 *       400:
 *         description: Invalid receiver details
 *       500:
 *         description: Internal server error
 */

router.post('/send/internal/data', sendMoneyInternalData)

router.post('/send/external', sendMoneyExternal)

router.post('/send/external/data', sendMoneyExternalData)

router.post('/request/reject/:requestId', rejectRequest);


export default router
