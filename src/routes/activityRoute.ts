import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getNotifications, 
        getTransactions, 
        fundAcc, 
        sendMoneyInternal, 
        sendMoneyInternalData, 
        sendMoneyExternalData,
        sendMoneyExternal,
        requestMoneyData} from '../controllers/activityController'

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
/**
 * @swagger
 * /api/v2/account/fund:
 *   post:
 *     summary: Generate a Paystack payment link to fund user account
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
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Funding link created
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
 *                   example: Funding link created
 *                 data:
 *                   type: string
 *                   example: https://paystack.com/pay/some-random-link
 *       401:
 *         description: Unauthorized user
 *       500:
 *         description: Internal server error
 */

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
/**
 * @swagger
 * /api/v2/account/transfer/external:
 *   post:
 *     summary: Send money to an external bank account
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
 *               - bankName
 *               - accNumber
 *               - accName
 *               - reference
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               bankName:
 *                 type: string
 *                 example: "Access Bank"
 *               accNumber:
 *                 type: string
 *                 example: "1234567890"
 *               accName:
 *                 type: string
 *                 example: "Jane Doe"
 *               reference:
 *                 type: string
 *                 example: "INV-EXT-2025-1234"
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
 *       409:
 *         description: Insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Insufficient funds
 *       500:
 *         description: Internal server error
 */

router.post('/send/external', sendMoneyExternal)
/**
 * @swagger
 * /api/v2/account/transfer/external/data:
 *   post:
 *     summary: Preview transaction details for an external transfer
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
 *               - bankName
 *               - accNumber
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               bankName:
 *                 type: string
 *                 example: "Access Bank"
 *               accNumber:
 *                 type: string
 *                 example: "1234567890"
 *               note:
 *                 type: string
 *                 example: "Payment for services"
 *     responses:
 *       200:
 *         description: Transaction details previewed successfully
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
 *                       example: "Jane Doe"
 *                     date:
 *                       type: string
 *                       example: "May 13, 2025"
 *                     amount:
 *                       type: number
 *                       example: 5000
 *                     bank:
 *                       type: string
 *                       example: "Access Bank"
 *                     reference:
 *                       type: string
 *                       example: "INV-EXT-2025-1234"
 *                     fee:
 *                       type: string
 *                       example: "#50.00"
 *                     total:
 *                       type: string
 *                       example: "#5050.00"
 *       400:
 *         description: Invalid bank details or account not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid bank details
 *       500:
 *         description: Internal server error
 */

router.post('/send/external/data', sendMoneyExternalData)
/**
 * @swagger
 * /api/v2/request/data/{receiverId}:
 *   post:
 *     summary: Preview a money request before sending
 *     tags:
 *       - Request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to request money from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - purpose
 *               - dueDate
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               purpose:
 *                 type: string
 *                 example: "For lunch"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-20"
 *               note:
 *                 type: string
 *                 example: "Optional message to include"
 *     responses:
 *       200:
 *         description: Request preview generated successfully
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
 *                   example: Review Request
 *                 data:
 *                   type: object
 *                   properties:
 *                     to:
 *                       type: string
 *                       example: "John Doe"
 *                     dueDate:
 *                       type: string
 *                       example: "May 20, 2025"
 *                     amount:
 *                       type: string
 *                       example: "#1000.00"
 *                     description:
 *                       type: string
 *                       example: "For lunch"
 *                     refrence:
 *                       type: string
 *                       example: "INV-EXT-2025-1234"
 *       400:
 *         description: Invalid receiver ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid receiver Id
 *       500:
 *         description: Internal server error
 */

router.post('/request/data/:receiverId', requestMoneyData)


export default router
