import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { loginSchema, registerSchema } from '../../../shared/schemas';
import { HTTP_STATUS, USER_ROLES } from '../../../shared/constants';
import { DatabaseService } from '../services/database.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// Register new user
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await DatabaseService.findOne('users', { 
      email: validatedData.email 
    });
    
    if (existingUser.success && existingUser.data) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: 'User already exists with this email'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
    
    // Create user data
    const userData = {
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
      role: USER_ROLES.USER,
      isActive: true,
      isEmailVerified: false,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Create user in database
    const createResult = await DatabaseService.insert('users', userData);
    
    if (!createResult.success) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to create user'
      });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = createResult.data;
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Server configuration error'
      });
    }
    
    const token = jwt.sign(
      { 
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User registered successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Registration error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Registration failed'
    });
  }
}));

// Login user
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by email
    const userResult = await DatabaseService.findOne('users', { 
      email: validatedData.email 
    });
    
    if (!userResult.success || !userResult.data) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const user = userResult.data;
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
    
    if (!isValidPassword) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Server configuration error'
      });
    }
    
    const token = jwt.sign(
      { 
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Update last login
    await DatabaseService.update('users', user.id, {
      lastLoginAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Login failed'
    });
  }
}));

// Get current user
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Not authenticated'
    });
  }
  
  // Fetch fresh user data from database
  const userResult = await DatabaseService.findOne('users', { 
    id: req.user.id 
  });
  
  if (!userResult.success || !userResult.data) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'User not found'
    });
  }
  
  // Remove password from response
  const { password, ...userWithoutPassword } = userResult.data;
  
  res.json({
    success: true,
    data: userWithoutPassword
  });
}));

// Logout user
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  // In a more complete implementation, you would invalidate the token
  // For now, we'll just return a success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Token is required'
    });
  }
  
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Server configuration error'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
    
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Invalid token'
    });
  }
}));

export default router;