// routes/paystackRoutes.ts
import express from 'express';
import { handlePaystackWebhook } from '../controllers/paystackController';

const router = express.Router();
/**
 * @swagger
 * /api/v2/webhook/paystack:
 *   post:
 *     summary: Paystack webhook handler for processing payment events
 *     description: Handles Paystack webhook events for account funding and debt payments. Validates the Paystack signature before processing the event.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: charge.success
 *               data:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                     example: 500000
 *                   metadata:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: fund_account
 *                       accId:
 *                         type: string
 *                         example: 663dadb189ae1b40b79e9df6
 *     responses:
 *       200:
 *         description: Webhook processed successfully or ignored
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: ok
 *       400:
 *         description: Missing Paystack signature
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
 *                   example: Missing Paystack signature in the request headers
 *       401:
 *         description: Invalid Paystack signature
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
 *                   example: Unauthorized: Invalid signature
 *       500:
 *         description: Server error while processing webhook
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
 *                   example: Internal server error
 */

router.post('/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

export default router;
