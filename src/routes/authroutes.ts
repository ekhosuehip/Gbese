import { Router } from 'express';
import { login, signUp, userData, forgotPassword, resetPassword } from '../controllers/authController';
import { validate } from '../middlewares/joi';
import { userSchema } from '../middlewares/joiSchema'

const router = Router();

/**
 * @swagger
 * /api/v2/User:
 *   post:
 *     summary: Save user data to Redis during sign-up
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - fullName
 *               - email
 *               - password
 *               - dateOfBirth
 *               - gender
 *             properties:
 *               key:
 *                 type: string
 *                 example: verify_2348012345678
 *               fullName:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123!
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1995-08-12
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: female
 *     responses:
 *       200:
 *         description: User data saved successfully, continue with registration
 *       400:
 *         description: Invalid Redis key or user already exists
 *       500:
 *         description: Internal server error
 */
router.post('/user', validate(userSchema.signInData), userData)

/**
 * @swagger
 * /api/v2/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - role
 *             properties:
 *               key:
 *                 type: string
 *                 description: Redis key pointing to user signup data
 *                 example: signup_abc123
 *               type:
 *                 type: string
 *                 enum: [benefactor, beneficiary]
 *                 description: User role for account creation
 *                 example: beneficiary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid Redis key or data missing
 *       500:
 *         description: Internal server error
 */
router.post('/signup', signUp);

/**
 * @swagger
 * /api/v2/login:
 *   post:
 *     summary: Login with email and password
 *     tags:
 *       - Auth
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

router.post('/forgetpassword', forgotPassword);

router.post('/resetpassword', resetPassword)


export default router;
