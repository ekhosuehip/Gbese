import express from 'express';
import { upload } from '../middlewares/multer';
import { createDebt, transferMethod, listedDebt } from '../controllers/debtcontroller';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/joi';
import { debtSchema } from '../middlewares/joiSchema'

const router = express.Router();

// protect all routes
router.use(protect)
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
router.post('/debt/upload', upload.single('statementFile'), validate(debtSchema.createDebtData), createDebt);

router.get('/debt/marketplace', listedDebt)

router.put('/debt/transfer/:debtId', transferMethod);


export default router;
