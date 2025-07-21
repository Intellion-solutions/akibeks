import { sitemapGenerator } from '@/lib/sitemap-generator';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const type = searchParams.get('type') || 'main';
    
    // Check if cached version exists
    const cachedSitemap = await sitemapGenerator.loadSitemapFromDatabase(type);
    if (cachedSitemap) {
      return new Response(cachedSitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'X-Sitemap-Generated': new Date().toISOString(),
          'X-Sitemap-Type': type
        }
      });
    }
    
    // Generate new sitemap
    let sitemap: string;
    
    switch (type) {
      case 'main':
        sitemap = await sitemapGenerator.generateMainSitemap();
        break;
      case 'blog':
        sitemap = await sitemapGenerator.generateBlogSitemap();
        break;
      case 'services':
        sitemap = await sitemapGenerator.generateServicesSitemap();
        break;
      case 'projects':
        sitemap = await sitemapGenerator.generateProjectsSitemap();
        break;
      case 'news':
        sitemap = await sitemapGenerator.generateNewsSitemap();
        break;
      case 'index':
        sitemap = await sitemapGenerator.generateSitemapIndex();
        break;
      default:
        throw new Error(`Unknown sitemap type: ${type}`);
    }
    
    // Save to database for caching
    await sitemapGenerator.saveSitemapToDatabase(type, sitemap);
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Sitemap-Generated': new Date().toISOString(),
        'X-Sitemap-Type': type,
        'X-Sitemap-Fresh': 'true'
      }
    });
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://akibeks.co.ke/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`, {
      status: 500,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

// For static generation during build
export async function generateStaticParams() {
  return [
    { type: 'main' },
    { type: 'blog' },
    { type: 'services' },
    { type: 'projects' },
    { type: 'news' },
    { type: 'index' }
  ];
}