import { Router } from 'express';
import { userNumber, verifyNumber } from '../controllers/phoneController';
import {validate} from '../middlewares/joi';
import {phoneSchema} from '../middlewares/joiSchema';

const router = Router()

/**
 * @swagger
 * /api/v1/phone/register:
 *   post:
 *     summary: Request OTP for phone number
 *     tags:
 *       - Phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "2348012345678"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid phone number
 */
router.post('/phone/register', validate(phoneSchema.getOTP), userNumber);

/**
 * @swagger
 * /api/v1/phone/verify:
 *   post:
 *     summary: Verify OTP
 *     tags:
 *       - Phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: "8e6jjrspxc"
 *               otp:
 *                 type: string
 *                 example: "12345"
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

router.post('/phone/verify', validate(phoneSchema.verify), verifyNumber);

export default router