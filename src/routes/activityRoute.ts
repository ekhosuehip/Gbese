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

router.get('/transactions', getTransactions);

router.get('/request/:requestId', getRequests);

router.post('/send/request', requestMoney);

router.post('/fund/account', fundAcc);

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
 * /transfer/external:
 *   post:
 *     summary: Send money to an external bank account
 *     tags:
 *       - Transfer
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
 *               - bankName
 *               - accNumber
 *               - accName
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               bankName:
 *                 type: string
 *                 example: "Access Bank"
 *               accNumber:
 *                 type: string
 *                 example: "0123456789"
 *               accName:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       200:
 *         description: Transfer successful
 *       409:
 *         description: Insufficient funds
 *       500:
 *         description: Internal server error
 */
router.post('/send/external', sendMoneyExternal);


router.patch('/request/accept/:requestId', acceptRequest);
/**
 * @swagger
 * /request/reject/{requestId}:
 *   patch:
 *     summary: Reject a pending request
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the request to reject
 *     responses:
 *       200:
 *         description: Request rejected
 *       403:
 *         description: Not authorized to reject this request
 *       500:
 *         description: Internal server error
 */

router.patch('/request/reject/:requestId', rejectRequest);


export default router
