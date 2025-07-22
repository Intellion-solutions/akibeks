import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createContactSubmissionSchema } from '../../../shared/schemas';
import { HTTP_STATUS, CONTACT_STATUS } from '../../../shared/constants';
import { DatabaseService } from '../services/database.service.js';
import { SMTPService } from '../services/smtp.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { optionalAuth, requireEmployee } from '../middleware/auth.middleware.js';

const router = Router();

// Submit contact form (public endpoint)
router.post('/', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createContactSubmissionSchema.parse(req.body);
    
    // Create contact submission data
    const contactData = {
      ...validatedData,
      status: CONTACT_STATUS.NEW,
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to database
    const createResult = await DatabaseService.insert('contactSubmissions', contactData);
    
    if (!createResult.success) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to submit contact form'
      });
    }
    
    // Send notification email
    try {
      await SMTPService.sendContactNotification({
        name: validatedData.name,
        email: validatedData.email,
        message: validatedData.message,
        company: validatedData.company,
        phone: validatedData.phoneNumber
      });
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // Don't fail the request if email fails
    }
    
    // Send confirmation email to user
    try {
      await SMTPService.sendEmail({
        to: validatedData.email,
        subject: 'Thank you for contacting AKIBEKS Engineering Solutions',
        message: `
          <h2>Thank you for your inquiry, ${validatedData.name}!</h2>
          <p>We have received your message and will get back to you within 24 hours.</p>
          <p><strong>Your message:</strong></p>
          <p>${validatedData.message}</p>
          <p>Best regards,<br>AKIBEKS Engineering Solutions Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: createResult.data,
      message: 'Contact form submitted successfully'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Contact submission error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to submit contact form'
    });
  }
}));

// Get contact submissions (admin/employee only)
router.get('/', requireEmployee, asyncHandler(async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    const filters = [];
    
    // Filter by status
    if (status && Object.values(CONTACT_STATUS).includes(status as any)) {
      filters.push({
        column: 'status',
        operator: 'eq' as const,
        value: status
      });
    }
    
    // Search functionality (simplified)
    if (search) {
      filters.push({
        column: 'name',
        operator: 'ilike' as const,
        value: search
      });
    }
    
    const result = await DatabaseService.select('contactSubmissions', {
      page,
      limit,
      filters: filters.length > 0 ? filters : undefined,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch contact submissions'
    });
  }
}));

// Get single contact submission (admin/employee only)
router.get('/:id', requireEmployee, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await DatabaseService.findOne('contactSubmissions', { id });
    
    if (!result.success || !result.data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Contact submission not found'
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
    
  } catch (error) {
    console.error('Get contact submission error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch contact submission'
    });
  }
}));

// Update contact submission status (admin/employee only)
router.patch('/:id/status', requireEmployee, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !Object.values(CONTACT_STATUS).includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    // Check if contact submission exists
    const existingResult = await DatabaseService.findOne('contactSubmissions', { id });
    
    if (!existingResult.success || !existingResult.data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Contact submission not found'
      });
    }
    
    // Update status
    const updateResult = await DatabaseService.update('contactSubmissions', id, { 
      status,
      updatedBy: req.user?.id
    });
    
    if (!updateResult.success) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to update contact submission'
      });
    }
    
    // Log activity
    await DatabaseService.logActivity(
      req.user!.id,
      'UPDATE_STATUS',
      'contact_submission',
      id,
      { oldStatus: existingResult.data.status, newStatus: status }
    );
    
    res.json({
      success: true,
      data: updateResult.data,
      message: 'Contact submission status updated successfully'
    });
    
  } catch (error) {
    console.error('Update contact submission status error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to update contact submission status'
    });
  }
}));

// Delete contact submission (admin only)
router.delete('/:id', requireEmployee, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if contact submission exists
    const existingResult = await DatabaseService.findOne('contactSubmissions', { id });
    
    if (!existingResult.success || !existingResult.data) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Contact submission not found'
      });
    }
    
    // Delete contact submission
    const deleteResult = await DatabaseService.delete('contactSubmissions', id);
    
    if (!deleteResult.success) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Failed to delete contact submission'
      });
    }
    
    // Log activity
    await DatabaseService.logActivity(
      req.user!.id,
      'DELETE',
      'contact_submission',
      id,
      existingResult.data
    );
    
    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete contact submission error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to delete contact submission'
    });
  }
}));

// Get contact statistics (admin/employee only)
router.get('/stats/overview', requireEmployee, asyncHandler(async (req: Request, res: Response) => {
  try {
    // This would typically use aggregate queries
    // For now, we'll use simplified logic
    
    const totalResult = await DatabaseService.select('contactSubmissions', { limit: 1000 });
    const total = totalResult.data?.length || 0;
    
    const newResult = await DatabaseService.select('contactSubmissions', {
      filters: [{ column: 'status', operator: 'eq', value: CONTACT_STATUS.NEW }],
      limit: 1000
    });
    const newCount = newResult.data?.length || 0;
    
    const contactedResult = await DatabaseService.select('contactSubmissions', {
      filters: [{ column: 'status', operator: 'eq', value: CONTACT_STATUS.CONTACTED }],
      limit: 1000
    });
    const contactedCount = contactedResult.data?.length || 0;
    
    const convertedResult = await DatabaseService.select('contactSubmissions', {
      filters: [{ column: 'status', operator: 'eq', value: CONTACT_STATUS.CONVERTED }],
      limit: 1000
    });
    const convertedCount = convertedResult.data?.length || 0;
    
    res.json({
      success: true,
      data: {
        total,
        new: newCount,
        contacted: contactedCount,
        converted: convertedCount,
        conversionRate: total > 0 ? ((convertedCount / total) * 100).toFixed(2) : 0
      }
    });
    
  } catch (error) {
    console.error('Get contact statistics error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to fetch contact statistics'
    });
  }
}));

export default router;