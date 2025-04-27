import { Router } from 'express';
import { login, signUp } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
/**
 * @swagger
 * /api/v2/login:
 *   post:
 *     summary: Login with email and password
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "strongpassword123"
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);


export default router;
