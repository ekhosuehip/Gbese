import { Router } from 'express';
import { userNumber, verifyNumber } from '../controllers/phoneController';
import {validate} from '../middlewares/joi';
import {phoneSchema} from '../middlewares/joiSchema';

const router = Router()

router.post('/phone/register', validate(phoneSchema.getOTP), userNumber);
router.post('/phone/verify', validate(phoneSchema.verify), verifyNumber);

export default router