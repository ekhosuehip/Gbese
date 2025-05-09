// routes/paystackRoutes.ts
import express from 'express';
import { handlePaystackWebhook } from '../controllers/paystackController';

const router = express.Router();
/**
 * @swagger
 * /webhook/paystack:
 *   post:
 *     summary: Handle Paystack payment webhook events
 *     tags:
 *       - Webhook
 *     description: Receives and verifies Paystack webhook events like `charge.success`, and updates debt/account accordingly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Paystack event payload
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *       400:
 *         description: Missing or invalid Paystack signature
 *       401:
 *         description: Unauthorized - Signature mismatch
 *       500:
 *         description: Internal server error
 */

router.post('/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

export default router;
