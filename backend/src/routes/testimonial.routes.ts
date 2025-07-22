import express from 'express';
import { DatabaseService } from '../../services/database.service';

const router = express.Router();

// GET /api/testimonials - Get all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await DatabaseService.getTestimonials();
    res.json({ success: true, data: testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials' });
  }
});

// GET /api/testimonials/:id - Get testimonial by ID
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await DatabaseService.getTestimonial(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }
    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch testimonial' });
  }
});

// POST /api/testimonials - Create new testimonial
router.post('/', async (req, res) => {
  try {
    const testimonial = await DatabaseService.createTestimonial(req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to create testimonial' });
  }
});

// PUT /api/testimonials/:id - Update testimonial
router.put('/:id', async (req, res) => {
  try {
    const testimonial = await DatabaseService.updateTestimonial(req.params.id, req.body);
    res.json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to update testimonial' });
  }
});

// DELETE /api/testimonials/:id - Delete testimonial
router.delete('/:id', async (req, res) => {
  try {
    await DatabaseService.deleteTestimonial(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, error: 'Failed to delete testimonial' });
  }
});

export default router;