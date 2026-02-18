import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as notificationController from './notification.controller';

const router = Router();

router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllRead);

export default router;
