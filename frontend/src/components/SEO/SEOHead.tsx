import React from 'react';
import { Helmet } from 'react-helmet-async';

// Temporary stubs for missing shared modules
const SEOManager = {
  generateMetaTags: () => ({}),
  generateStructuredData: () => ({}),
  generateOpenGraphTags: () => ({}),
  generateTwitterTags: () => ({})
};

interface PageSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

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
  const seoTitle = title || 'AKIBEKS Engineering Solutions';
  const seoDescription = description || 'Leading construction and engineering company in Kenya';
  const seoKeywords = keywords?.join(', ') || 'construction, engineering, Kenya';
  const canonicalUrl = canonical || `https://akibeks.co.ke${url || ''}`;
  
      const openGraph = {
      title: seoTitle,
      description: seoDescription,
      image,
      url: canonicalUrl,
      type: type || 'website',
      siteName: 'AKIBEKS Engineering Solutions',
      locale: 'en_US'
    };
    
    const twitterCard = {
      title: seoTitle,
      description: seoDescription,
      image,
      card: 'summary_large_image',
      site: '@akibekseng',
      creator: '@akibekseng'
    };

  // Generate structured data
  const allStructuredData = [...structuredData];
  
  // Add organization structured data
  allStructuredData.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AKIBEKS Engineering Solutions',
    url: 'https://akibeks.co.ke'
  });
  
  // Add breadcrumbs if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    allStructuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });
  }
  
  // Add FAQs if provided
  if (faqs && faqs.length > 0) {
    allStructuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
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