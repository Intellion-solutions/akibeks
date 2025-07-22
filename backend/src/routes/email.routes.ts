import express from 'express';
import { SMTPService } from '../../services/smtp.service';

const router = express.Router();

// POST /api/email/send - Send email
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and text or html' 
      });
    }

    const result = await SMTPService.sendEmail({
      to,
      subject,
      message: html || text
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// POST /api/email/contact - Send contact form email
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, subject, message' 
      });
    }

    const result = await SMTPService.sendContactEmail({
      name,
      email,
      phone,
      subject,
      message
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ success: false, error: 'Failed to send contact email' });
  }
});

// POST /api/email/quote - Send quote request email
router.post('/quote', async (req, res) => {
  try {
    const { name, email, phone, service, budget, timeline, description } = req.body;
    
    if (!name || !email || !service || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, service, description' 
      });
    }

    const result = await SMTPService.sendQuoteEmail({
      name,
      email,
      phone,
      service,
      budget,
      timeline,
      description
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error sending quote email:', error);
    res.status(500).json({ success: false, error: 'Failed to send quote email' });
  }
});

export default router;