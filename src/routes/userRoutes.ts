import express from 'express';
import { getBenefactor } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { getUserAccount , allUser, getUserStats, getStats} from "../controllers/userController";

const router = express.Router();

router.use(protect);
/**
 * @swagger
 * /api/v5/benefactors:
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
 * /api/v5/account:
 *   get:
 *     summary: Get user account details
 *     tags:
 *       - User
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
/**
 * @swagger
 * /api/v2/user/all:
 *   get:
 *     summary: Get all users
 *     description: Fetches all user accounts. Requires authentication and is typically restricted to admin users.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all user accounts retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "663dadaf89ae1b40b79e9df6"
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *                       phone:
 *                         type: string
 *                         example: "2348012345678"
 *                       role:
 *                         type: string
 *                         example: "user"
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Server error while fetching users
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

router.get('/all/account', allUser);
/**
 * @swagger
 * /user/stats:
 *   get:
 *     summary: Get user statistics
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *       500:
 *         description: Internal server error
 */

router.get('/user/stat',  getUserStats);
/**
 * @swagger
 * /user/stats/{id}:
 *   get:
 *     summary: Get statistics for a specific user by ID
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *       500:
 *         description: Internal server error
 */

router.get('/user/stat/:id',  getStats);

export default router;
