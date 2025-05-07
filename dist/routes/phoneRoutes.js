"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const phoneController_1 = require("../controllers/phoneController");
const joi_1 = require("../middlewares/joi");
const joiSchema_1 = require("../middlewares/joiSchema");
const router = (0, express_1.Router)();
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
router.post('/phone/register', (0, joi_1.validate)(joiSchema_1.phoneSchema.getOTP), phoneController_1.userIdentity);
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
router.post('/phone/verify', (0, joi_1.validate)(joiSchema_1.phoneSchema.verify), phoneController_1.verifyNumber);
// router.post('/forget', forgetPassword)
exports.default = router;
