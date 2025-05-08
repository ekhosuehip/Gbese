import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getNotifications, getTransactions} from '../controllers/activityController'

const router = Router()

router.use(protect);

router.get('/notifications', getNotifications);

router.get('/transactions', getTransactions)

