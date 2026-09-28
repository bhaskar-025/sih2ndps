import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user credentials & issue 7-day JWT access token
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), AuthController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current user session
 * @access  Private (Authenticated)
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token (Structure only)
 * @access  Public
 */
router.post('/refresh-token', validateRequest(refreshTokenSchema), AuthController.refreshToken);

export default router;
