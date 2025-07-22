// API routes for SEO-related functionality
// This file would be used in a backend implementation (Express.js/Node.js)

import { Request, Response } from 'express';
import { seoService } from '../core/seo-service';
import { getSecurityHeaders } from '../core/security';

// Generate and serve sitemap.xml
export const sitemapMainHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const sitemap = await seoService.generateSitemap('main');
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
      ...getSecurityHeaders()
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
};

// Generate and serve services sitemap
export const sitemapServicesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const sitemap = await seoService.generateSitemap('services');
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      ...getSecurityHeaders()
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating services sitemap:', error);
    res.status(500).json({ error: 'Failed to generate services sitemap' });
  }
};

// Generate and serve projects sitemap
export const sitemapProjectsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const sitemap = await seoService.generateSitemap('projects');
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      ...getSecurityHeaders()
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating projects sitemap:', error);
    res.status(500).json({ error: 'Failed to generate projects sitemap' });
  }
};

// Generate and serve images sitemap
export const sitemapImagesHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const sitemap = await seoService.generateSitemap('images');
    
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      ...getSecurityHeaders()
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating images sitemap:', error);
    res.status(500).json({ error: 'Failed to generate images sitemap' });
  }
};

// Generate and serve robots.txt
export const robotsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const robotsTxt = await seoService.generateRobotsTxt();
    
    res.set({
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      ...getSecurityHeaders()
    });
    
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).json({ error: 'Failed to generate robots.txt' });
  }
};

// Get meta tags for a specific page
export const metaTagsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageType, pageId } = req.params;
    const overrides = req.body || {};
    
    const metaTags = await seoService.generateMetaTags(pageType, pageId, overrides);
    
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1 hour
      ...getSecurityHeaders()
    });
    
    res.json({
      success: true,
      data: metaTags
    });
  } catch (error) {
    console.error('Error generating meta tags:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate meta tags' 
    });
  }
};

// Get structured data for a specific page
export const structuredDataHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageType, pageId } = req.params;
    const data = req.body || {};
    
    const structuredData = await seoService.generateStructuredData(pageType, pageId, data);
    
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ...getSecurityHeaders()
    });
    
    res.json({
      success: true,
      data: structuredData
    });
  } catch (error) {
    console.error('Error generating structured data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate structured data' 
    });
  }
};

// Analyze page SEO
export const seoAnalysisHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, content } = req.body;
    
    if (!url || !content) {
      res.status(400).json({
        success: false,
        error: 'URL and content are required'
      });
      return;
    }
    
    const analysis = await seoService.analyzePage(url, content);
    
    res.set({
      'Content-Type': 'application/json',
      ...getSecurityHeaders()
    });
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing page SEO:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze page SEO' 
    });
  }
};

// Get SEO configuration for a page
export const getSEOConfigHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pageType, pageId } = req.params;
    
    const config = await seoService.getSEOConfiguration(pageType, pageId);
    
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ...getSecurityHeaders()
    });
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting SEO configuration:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get SEO configuration' 
    });
  }
};

// Update SEO configuration for a page
export const updateSEOConfigHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const config = await seoService.updateSEOConfiguration(id, updateData);
    
    res.set({
      'Content-Type': 'application/json',
      ...getSecurityHeaders()
    });
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error updating SEO configuration:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update SEO configuration' 
    });
  }
};

// Create new SEO configuration
export const createSEOConfigHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const configData = req.body;
    
    const config = await seoService.createSEOConfiguration(configData);
    
    res.set({
      'Content-Type': 'application/json',
      ...getSecurityHeaders()
    });
    
    res.status(201).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error creating SEO configuration:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create SEO configuration' 
    });
  }
};

// Kenya-specific SEO endpoint - generates location-based meta tags
export const kenyaSEOHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county, city, serviceType } = req.query;
    
    // Kenya-specific meta tag generation
    const kenyaMetaTags = {
      title: `${serviceType || 'Construction Services'} in ${city || county || 'Kenya'} - AKIBEKS Engineering Solutions`,
      description: `Professional ${serviceType || 'construction and engineering'} services in ${city || county || 'Kenya'}. Licensed contractors serving ${county || 'all Kenyan counties'} with quality building solutions.`,
      keywords: [
        `${serviceType || 'construction'} ${city || county || 'Kenya'}`,
        `contractors ${city || county || 'Kenya'}`,
        `building services ${city || county || 'Kenya'}`,
        `engineering ${city || county || 'Kenya'}`,
        'NCA licensed contractors',
        'Kenya construction company'
      ],
      structuredData: [{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: `AKIBEKS Engineering Solutions - ${city || county || 'Kenya'}`,
        description: `Professional construction services in ${city || county || 'Kenya'}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city || 'Nairobi',
          addressRegion: county || 'Nairobi County',
          addressCountry: 'KE'
        },
        areaServed: {
          '@type': 'State',
          name: county || 'Kenya'
        },
        serviceType: serviceType || 'Construction Services'
      }]
    };
    
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ...getSecurityHeaders()
    });
    
    res.json({
      success: true,
      data: kenyaMetaTags
    });
  } catch (error) {
    console.error('Error generating Kenya SEO data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate Kenya SEO data' 
    });
  }
};

// Express.js route setup (example)
export const setupSEORoutes = (app: any): void => {
  // Public SEO files
  app.get('/sitemap.xml', sitemapMainHandler);
  app.get('/sitemap-services.xml', sitemapServicesHandler);
  app.get('/sitemap-projects.xml', sitemapProjectsHandler);
  app.get('/sitemap-images.xml', sitemapImagesHandler);
  app.get('/robots.txt', robotsHandler);
  
  // API endpoints
  app.get('/api/seo/meta/:pageType/:pageId?', metaTagsHandler);
  app.post('/api/seo/meta/:pageType/:pageId?', metaTagsHandler);
  app.get('/api/seo/structured-data/:pageType/:pageId?', structuredDataHandler);
  app.post('/api/seo/structured-data/:pageType/:pageId?', structuredDataHandler);
  app.post('/api/seo/analyze', seoAnalysisHandler);
  
  // Configuration management
  app.get('/api/seo/config/:pageType/:pageId?', getSEOConfigHandler);
  app.put('/api/seo/config/:id', updateSEOConfigHandler);
  app.post('/api/seo/config', createSEOConfigHandler);
  
  // Kenya-specific SEO
  app.get('/api/seo/kenya', kenyaSEOHandler);
};

export default {
  sitemapMainHandler,
  sitemapServicesHandler,
  sitemapProjectsHandler,
  sitemapImagesHandler,
  robotsHandler,
  metaTagsHandler,
  structuredDataHandler,
  seoAnalysisHandler,
  getSEOConfigHandler,
  updateSEOConfigHandler,
  createSEOConfigHandler,
  kenyaSEOHandler,
  setupSEORoutes
};