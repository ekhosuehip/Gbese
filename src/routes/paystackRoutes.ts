// routes/paystackRoutes.ts
import express from 'express';
import { handlePaystackWebhook } from '../controllers/paystackController';

const router = express.Router();
/**
 * @swagger
 * /webhook/paystack:
 *   post:
 *     summary: Handle Paystack webhook events
 *     tags:
 *       - Webhooks
 *     description: Receives Paystack webhook events and updates user accounts accordingly
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook payload from Paystack
 *     responses:
 *       200:
 *         description: Webhook handled successfully
 *       400:
 *         description: Missing Paystack signature in request headers
 *       401:
 *         description: Invalid Paystack signature
 *       500:
 *         description: Internal server error
 */

router.post('/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

export default router;
