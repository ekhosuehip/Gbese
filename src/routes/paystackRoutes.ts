// routes/paystackRoutes.ts
import express from 'express';
import { handlePaystackWebhook } from '../controllers/paystackController';

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

export default router;
