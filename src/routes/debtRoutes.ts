import express from 'express';
import { upload } from '../middlewares/multer';
import { createDebt } from '../controllers/debtcontroller';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/joi';
import { debtSchema } from '../middlewares/joiSchema'

const router = express.Router();

// protect all routes
router.use(protect)

router.post('/debt/upload', upload.single('statementFile'), validate(debtSchema.createDebtData), createDebt);

export default router;
