import { User, IUser } from '../models/User';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { ApiError } from '../utils/apiError';
import { signAccessToken, JwtTokenPayload } from '../utils/jwt';

export interface AuthSuccessResult {
  user: Record<string, any>;
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput): Promise<AuthSuccessResult> {
    const normalizedEmail = data.email.toLowerCase();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const newUser = new User({
      name: data.name,
      email: normalizedEmail,
      password: data.password,
      role: data.role.toLowerCase(),
      phone: data.phone || '',
      organization: data.organization || '',
      department: data.department || '',
      isActive: true,
    });

    await newUser.save();

    const payload: JwtTokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    };

    const token = signAccessToken(payload);
    const userJson = newUser.toJSON();

    return {
      user: userJson,
      token,
    };
  }

  /**
   * Authenticate user credentials and issue 7-day JWT access token
   */
  static async login(data: LoginInput): Promise<AuthSuccessResult> {
    const normalizedEmail = data.email.toLowerCase();

    // Find user with password selected
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Compare bcrypt password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    const payload: JwtTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = signAccessToken(payload);
    const userJson = user.toJSON();

    return {
      user: userJson,
      token,
    };
  }

  /**
   * Retrieve current user profile by ID
   */
  static async getCurrentUser(userId: string): Promise<Record<string, any>> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return user.toJSON();
  }

  /**
   * Refresh Token Structure (Structure only)
   */
  static async refreshToken(_refreshToken?: string): Promise<{ token: string; message: string }> {
    return {
      token: 'REFRESH_TOKEN_STRUCTURE_READY',
      message: 'Refresh token architecture is ready for Redis/rotational token integration',
    };
  }
}

export default AuthService;
