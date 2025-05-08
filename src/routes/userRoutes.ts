import express from 'express';
import { getBenefactor } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

// Route: GET /api/v5/users/Benefactor
router.get('/benefactor',  getBenefactor);

export default router;
