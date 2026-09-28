import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', NotificationController.getUserNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/', NotificationController.createNotification);

export default router;
