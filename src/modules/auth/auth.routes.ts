import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.put('/change-password', authenticate, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

export default router;
