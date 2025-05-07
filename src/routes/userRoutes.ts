import express from 'express';
import { getNonBeneficiatorUsers } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Route: GET /api/v5/users/non-beneficiators
router.get('/non-beneficiators', protect, getNonBeneficiatorUsers);

export default router;
