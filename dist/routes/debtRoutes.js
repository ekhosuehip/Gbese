"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../middlewares/multer");
const debtcontroller_1 = require("../controllers/debtcontroller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const joi_1 = require("../middlewares/joi");
const joiSchema_1 = require("../middlewares/joiSchema");
const router = express_1.default.Router();
// protect all routes
router.use(authMiddleware_1.protect);
/**
 * @swagger
 * /debt/upload:
 *   post:
 *     summary: Upload a debt record with a statement file
 *     tags:
 *       - Debt
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - bankCode
 *               - bankName
 *               - accountNumber
 *               - description
 *               - amount
 *               - dueDate
 *               - statementFile
 *             properties:
 *               bankCode:
 *                 type: string
 *                 example: "058"
 *               bankName:
 *                 type: string
 *                 example: "GTBank"
 *               accountNumber:
 *                 type: string
 *                 example: "0123456789"
 *               description:
 *                 type: string
 *                 example: "Loan for equipment"
 *               amount:
 *                 type: number
 *                 example: 150000
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-30"
 *               interestRate:
 *                 type: number
 *                 example: 3.5
 *               incentives:
 *                 type: number
 *                 example: 5
 *               statementFile:
 *                 type: string
 *                 format: file
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Debt created successfully
 *       400:
 *         description: Statement file missing or account not found
 *       500:
 *         description: Internal server error
 */
router.post('/debt/upload', multer_1.upload.single('statementFile'), (0, joi_1.validate)(joiSchema_1.debtSchema.createDebtData), debtcontroller_1.createDebt);
router.get('/debt/marketplace', debtcontroller_1.listedDebt);
router.put('/debt/transfer/:debtId', debtcontroller_1.transferMethod);
exports.default = router;
