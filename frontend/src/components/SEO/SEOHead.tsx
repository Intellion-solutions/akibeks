import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOManager } from '@shared/seo';
import type { PageSEO, BreadcrumbItem, FAQItem } from '@shared/types/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  structuredData?: any[];
  alternateUrls?: Record<string, string>;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  canonical,
  breadcrumbs,
  faqs,
  structuredData = [],
  alternateUrls
}) => {
  const seoTitle = SEOManager.generateTitle(title);
  const seoDescription = SEOManager.generateDescription(description);
  const seoKeywords = SEOManager.generateKeywords(keywords);
  const canonicalUrl = canonical || SEOManager.generateCanonicalUrl(url || '');
  
  const openGraph = SEOManager.generateOpenGraph({
    title: seoTitle,
    description: seoDescription,
    image,
    url: canonicalUrl,
    type
  });
  
  const twitterCard = SEOManager.generateTwitterCard({
    title: seoTitle,
    description: seoDescription,
    image
  });

  // Generate structured data
  const allStructuredData = [...structuredData];
  
  // Add organization structured data
  allStructuredData.push(JSON.parse(SEOManager.generateStructuredData('organization')));
  
  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    allStructuredData.push(JSON.parse(SEOManager.generateStructuredData('breadcrumb', breadcrumbs)));
  }
  
  // Add FAQs if provided
  if (faqs && faqs.length > 0) {
    allStructuredData.push(JSON.parse(SEOManager.generateStructuredData('faq', faqs)));
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta name="robots" content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={openGraph.title} />
      <meta property="og:description" content={openGraph.description} />
      <meta property="og:image" content={openGraph.image} />
      <meta property="og:url" content={openGraph.url} />
      <meta property="og:type" content={openGraph.type} />
      <meta property="og:site_name" content={openGraph.siteName} />
      <meta property="og:locale" content={openGraph.locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard.card} />
      <meta name="twitter:site" content={twitterCard.site} />
      <meta name="twitter:creator" content={twitterCard.creator} />
      <meta name="twitter:title" content={twitterCard.title} />
      <meta name="twitter:description" content={twitterCard.description} />
      <meta name="twitter:image" content={twitterCard.image} />
      
      {/* Alternate URLs */}
      {alternateUrls && Object.entries(alternateUrls).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      
      {/* Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Theme and Viewport */}
      <meta name="theme-color" content="#2563EB" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Language and Locale */}
      <html lang="en-KE" />
    </Helmet>
  );
};

export default SEOHead;