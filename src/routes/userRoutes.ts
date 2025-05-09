import express from 'express';
import { getBenefactor } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { getUserAccount } from "../controllers/userController";

const router = express.Router();
/**
 * @swagger
 * /api/v2/protect:
 *   get:
 *     summary: Protect routes requiring authentication
 *     tags:
 *       - Auth
 *     responses:
 *       401:
 *         description: Unauthorized. Token not provided or invalid
 *       500:
 *         description: Internal server error
 */

router.use(protect);
/**
 * @swagger
 * /api/v2/benefactors:
 *   get:
 *     summary: Fetch all users with the role of benefactor
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Benefactors fetched successfully
 *       500:
 *         description: Internal server error
 */

// Route: GET /api/v5
router.get('/benefactor',  getBenefactor);
/**
 * @swagger
 * /api/v2/account:
 *   get:
 *     summary: Get user account details
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User account fetched successfully
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
 *                   example: User account fetched successfully
 *                 data:
 *                   type: object
 *                   description: User account data
 *       404:
 *         description: User account not found
 *       500:
 *         description: Internal server error
 */

router.get('/user/account', getUserAccount);

export default router;
