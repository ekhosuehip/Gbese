import { Router } from 'express';
import { fetchAllBanks, fetchBank, resolveBankDetails } from "../controllers/banksController";

const router = Router();

/**
 * @swagger
 * /api/v3/banks/all:
 *   get:
 *     summary: Request to get all banks name and code
 *     tags:
 *       - Bank
 *     responses:
 *       200:
 *         description: Banks fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/banks/all', fetchAllBanks);

/**
 * @swagger
 * /api/v3/bank:
 *   get:
 *     summary: Request a specific bank by name
 *     tags:
 *       - Bank
 *     parameters:
 *       - in: query
 *         name: bank
 *         schema:
 *           type: string
 *         required: true
 *         description: Bank name to fetch
 *     responses:
 *       200:
 *         description: Bank fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/bank', fetchBank);

router.post('/bank/resolve', resolveBankDetails)

export default router;
