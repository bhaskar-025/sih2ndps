import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJwt, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJwt);

// Admin can manage all users; Officer can view users
router.get('/', authorizeRoles('Admin', 'Officer'), UserController.getAllUsers);
router.get('/:id', authorizeRoles('Admin', 'Officer'), UserController.getUserById);
router.put('/:id', authorizeRoles('Admin'), UserController.updateUser);
router.delete('/:id', authorizeRoles('Admin'), UserController.deleteUser);

export default router;
