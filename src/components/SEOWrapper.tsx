import React, { useEffect, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { seoManager, SEOConfig } from '@/lib/seo-manager';
import { useLocation } from 'react-router-dom';

interface SEOWrapperProps {
  children: ReactNode;
  config?: Partial<SEOConfig>;
  pageId?: string;
  loadFromDatabase?: boolean;
  saveToDatabase?: boolean;
}

const SEOWrapper: React.FC<SEOWrapperProps> = ({
  children,
  config = {},
  pageId,
  loadFromDatabase = false,
  saveToDatabase = false
}) => {
  const location = useLocation();
  const currentPageId = pageId || location.pathname;

  useEffect(() => {
    const applySEO = async () => {
      let seoConfig: SEOConfig;

      // Try to load from database if requested
      if (loadFromDatabase && currentPageId) {
        const savedConfig = await seoManager.loadSEOConfig(currentPageId);
        if (savedConfig) {
          seoConfig = { ...savedConfig, ...config };
        } else {
          seoConfig = getDefaultSEOConfig(currentPageId, config);
        }
      } else {
        seoConfig = getDefaultSEOConfig(currentPageId, config);
      }

      // Apply SEO configuration
      seoManager.updateSEO(seoConfig);

      // Save to database if requested
      if (saveToDatabase && currentPageId) {
        await seoManager.saveSEOConfig(currentPageId, seoConfig);
      }
    };

    applySEO();
  }, [currentPageId, config, loadFromDatabase, saveToDatabase]);

  const finalConfig = getDefaultSEOConfig(currentPageId, config);

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{finalConfig.title}</title>
        <meta name="description" content={finalConfig.description} />
        <meta name="keywords" content={finalConfig.keywords.join(', ')} />
        
        {/* Canonical URL */}
        {finalConfig.canonicalUrl && (
          <link rel="canonical" href={finalConfig.canonicalUrl} />
        )}
        
        {/* Robots */}
        <meta name="robots" content={finalConfig.robots || 'index, follow'} />
        
        {/* Author */}
        {finalConfig.author && (
          <meta name="author" content={finalConfig.author} />
        )}
        
        {/* Article Meta */}
        {finalConfig.publishDate && (
          <meta property="article:published_time" content={finalConfig.publishDate} />
        )}
        {finalConfig.modifiedDate && (
          <meta property="article:modified_time" content={finalConfig.modifiedDate} />
        )}
        
        {/* Locale */}
        {finalConfig.locale && (
          <meta property="og:locale" content={finalConfig.locale} />
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={finalConfig.title} />
        <meta property="og:description" content={finalConfig.description} />
        <meta property="og:type" content={finalConfig.ogType || 'website'} />
        <meta property="og:url" content={finalConfig.canonicalUrl || window.location.href} />
        <meta property="og:site_name" content="AKIBEKS Engineering Solutions" />
        {finalConfig.ogImage && (
          <>
            <meta property="og:image" content={finalConfig.ogImage} />
            <meta property="og:image:alt" content={finalConfig.title} />
          </>
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content={finalConfig.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={finalConfig.title} />
        <meta name="twitter:description" content={finalConfig.description} />
        {finalConfig.ogImage && (
          <meta name="twitter:image" content={finalConfig.ogImage} />
        )}
        
        {/* Alternate Languages */}
        {finalConfig.alternateLanguages && Object.entries(finalConfig.alternateLanguages).map(([lang, url]) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={url} />
        ))}
        
        {/* JSON-LD Structured Data */}
        {finalConfig.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(finalConfig.structuredData)}
          </script>
        )}
        
        {/* Breadcrumbs Structured Data */}
        {finalConfig.breadcrumbs && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": finalConfig.breadcrumbs.map(crumb => ({
                "@type": "ListItem",
                "position": crumb.position,
                "name": crumb.name,
                "item": crumb.url
              }))
            })}
          </script>
        )}
        
        {/* FAQ Structured Data */}
        {finalConfig.faqData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": finalConfig.faqData.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}
        
        {/* Review Aggregate Structured Data */}
        {finalConfig.reviewData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AggregateRating",
              "ratingValue": finalConfig.reviewData.averageRating,
              "reviewCount": finalConfig.reviewData.reviewCount,
              "bestRating": finalConfig.reviewData.bestRating,
              "worstRating": finalConfig.reviewData.worstRating
            })}
          </script>
        )}
        
        {/* Business Structured Data */}
        {finalConfig.businessData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": finalConfig.businessData.type,
              "name": finalConfig.businessData.name,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": finalConfig.businessData.address.streetAddress,
                "addressLocality": finalConfig.businessData.address.addressLocality,
                "addressRegion": finalConfig.businessData.address.addressRegion,
                "postalCode": finalConfig.businessData.address.postalCode,
                "addressCountry": finalConfig.businessData.address.addressCountry
              },
              "telephone": finalConfig.businessData.telephone,
              "email": finalConfig.businessData.email,
              "url": finalConfig.businessData.url,
              "logo": finalConfig.businessData.logo,
              "image": finalConfig.businessData.image,
              "openingHours": finalConfig.businessData.openingHours,
              "priceRange": finalConfig.businessData.priceRange,
              "areaServed": finalConfig.businessData.areaServed,
              "serviceType": finalConfig.businessData.serviceType,
              "foundingDate": finalConfig.businessData.foundingDate,
              "numberOfEmployees": finalConfig.businessData.numberOfEmployees,
              "slogan": finalConfig.businessData.slogan
            })}
          </script>
        )}
        
        {/* Product Structured Data */}
        {finalConfig.productData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": finalConfig.productData.name,
              "description": finalConfig.productData.description,
              "image": finalConfig.productData.image,
              "brand": {
                "@type": "Brand",
                "name": finalConfig.productData.brand
              },
              "model": finalConfig.productData.model,
              "category": finalConfig.productData.category,
              "sku": finalConfig.productData.sku,
              "gtin": finalConfig.productData.gtin,
              "mpn": finalConfig.productData.mpn,
              "offers": {
                "@type": "Offer",
                "price": finalConfig.productData.offers.price,
                "priceCurrency": finalConfig.productData.offers.currency,
                "availability": `https://schema.org/${finalConfig.productData.offers.availability}`,
                "validFrom": finalConfig.productData.offers.validFrom,
                "validThrough": finalConfig.productData.offers.validThrough
              }
            })}
          </script>
        )}
        
        {/* Article Structured Data */}
        {finalConfig.articleData && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": finalConfig.articleData.headline,
              "description": finalConfig.articleData.description,
              "image": finalConfig.articleData.image,
              "author": {
                "@type": "Person",
                "name": finalConfig.articleData.author.name,
                "url": finalConfig.articleData.author.url
              },
              "publisher": {
                "@type": "Organization",
                "name": finalConfig.articleData.publisher.name,
                "logo": {
                  "@type": "ImageObject",
                  "url": finalConfig.articleData.publisher.logo
                }
              },
              "datePublished": finalConfig.articleData.datePublished,
              "dateModified": finalConfig.articleData.dateModified,
              "wordCount": finalConfig.articleData.wordCount,
              "articleSection": finalConfig.articleData.articleSection,
              "keywords": finalConfig.articleData.tags.join(', ')
            })}
          </script>
        )}
      </Helmet>
      {children}
    </>
  );
};

function getDefaultSEOConfig(pageId: string, overrides: Partial<SEOConfig> = {}): SEOConfig {
  const baseConfig = getPageSpecificSEO(pageId);
  
  return {
    ...baseConfig,
    ...overrides,
    keywords: [...(baseConfig.keywords || []), ...(overrides.keywords || [])],
    canonicalUrl: overrides.canonicalUrl || `https://akibeks.co.ke${pageId}`,
    locale: overrides.locale || 'en_US',
    ogType: overrides.ogType || getPageType(pageId),
    robots: overrides.robots || 'index, follow'
  };
}

function getPageSpecificSEO(pageId: string): Partial<SEOConfig> {
  const seoMap: Record<string, Partial<SEOConfig>> = {
    '/': {
      title: 'AKIBEKS Engineering Solutions - Premier Construction Company in Kenya',
      description: 'Leading construction and engineering company in Kenya. We deliver exceptional residential, commercial, and civil engineering projects with over 15 years of experience.',
      keywords: ['construction company kenya', 'engineering solutions', 'building construction', 'civil engineering', 'residential construction', 'commercial projects', 'akibeks'],
      businessData: {
        name: 'AKIBEKS Engineering Solutions',
        type: 'ConstructionCompany',
        address: {
          streetAddress: 'Nairobi',
          addressLocality: 'Nairobi',
          addressRegion: 'Nairobi',
          postalCode: '00100',
          addressCountry: 'Kenya'
        },
        telephone: '+254-710-245-118',
        email: 'info@akibeks.co.ke',
        url: 'https://akibeks.co.ke',
        logo: 'https://akibeks.co.ke/logo.png',
        image: ['https://akibeks.co.ke/hero-image.jpg'],
        openingHours: ['Mo-Fr 08:00-18:00', 'Sa 08:00-16:00'],
        priceRange: '$$',
        areaServed: ['Kenya', 'East Africa'],
        serviceType: ['Construction', 'Engineering', 'Project Management'],
        foundingDate: '2008',
        numberOfEmployees: '50-100',
        slogan: 'Building Excellence, Engineering the Future'
      },
      reviewData: {
        reviewCount: 150,
        averageRating: 4.8,
        bestRating: 5,
        worstRating: 1
      }
    },
    '/about': {
      title: 'About AKIBEKS Engineering Solutions - Our Story & Mission',
      description: 'Learn about AKIBEKS Engineering Solutions, our 15-year journey in construction excellence, our mission to deliver quality projects, and our commitment to innovation.',
      keywords: ['about akibeks', 'construction company history', 'engineering team', 'company mission', 'construction expertise'],
      ogType: 'website'
    },
    '/services': {
      title: 'Construction & Engineering Services - AKIBEKS Solutions',
      description: 'Comprehensive construction and engineering services including residential construction, commercial projects, civil engineering, and project management in Kenya.',
      keywords: ['construction services', 'engineering services', 'residential construction', 'commercial construction', 'civil engineering', 'project management'],
      ogType: 'website'
    },
    '/projects': {
      title: 'Our Construction Projects Portfolio - AKIBEKS Engineering',
      description: 'Explore our impressive portfolio of completed construction and engineering projects across Kenya. From residential complexes to commercial buildings.',
      keywords: ['construction projects', 'engineering projects', 'project portfolio', 'completed projects', 'construction gallery'],
      ogType: 'website'
    },
    '/contact': {
      title: 'Contact AKIBEKS Engineering Solutions - Get Your Quote Today',
      description: 'Get in touch with AKIBEKS Engineering Solutions for your construction and engineering needs. Request a free quote or schedule a consultation.',
      keywords: ['contact akibeks', 'construction quote', 'engineering consultation', 'contact construction company'],
      ogType: 'website'
    },
    '/blog': {
      title: 'Construction & Engineering Blog - AKIBEKS Insights',
      description: 'Stay updated with the latest construction trends, engineering innovations, and industry insights from AKIBEKS Engineering Solutions.',
      keywords: ['construction blog', 'engineering insights', 'construction trends', 'building tips', 'industry news'],
      ogType: 'blog'
    },
    '/careers': {
      title: 'Careers at AKIBEKS Engineering Solutions - Join Our Team',
      description: 'Explore career opportunities at AKIBEKS Engineering Solutions. Join our team of skilled professionals in construction and engineering.',
      keywords: ['construction jobs', 'engineering careers', 'akibeks careers', 'construction employment', 'engineering jobs kenya'],
      ogType: 'website'
    },
    '/testimonials': {
      title: 'Client Testimonials - AKIBEKS Engineering Solutions Reviews',
      description: 'Read what our clients say about AKIBEKS Engineering Solutions. Discover why we are Kenya\'s trusted construction and engineering partner.',
      keywords: ['client testimonials', 'construction reviews', 'customer feedback', 'akibeks reviews'],
      ogType: 'website'
    },
    '/quote': {
      title: 'Request Construction Quote - AKIBEKS Engineering Solutions',
      description: 'Get a free, detailed quote for your construction or engineering project. Our experts will provide competitive pricing and timeline estimates.',
      keywords: ['construction quote', 'engineering estimate', 'project cost', 'building estimate', 'free quote'],
      ogType: 'website'
    }
  };

  return seoMap[pageId] || {
    title: 'AKIBEKS Engineering Solutions - Quality Construction & Engineering',
    description: 'Professional construction and engineering services by AKIBEKS Solutions. Quality workmanship, timely delivery, competitive pricing.',
    keywords: ['construction', 'engineering', 'building', 'akibeks']
  };
}

function getPageType(pageId: string): string {
  const typeMap: Record<string, string> = {
    '/': 'website',
    '/about': 'website',
    '/services': 'website',
    '/projects': 'website',
    '/contact': 'website',
    '/blog': 'blog',
    '/news': 'article',
    '/careers': 'website',
    '/testimonials': 'website'
  };

  if (pageId.startsWith('/blog/')) return 'article';
  if (pageId.startsWith('/news/')) return 'article';
  if (pageId.startsWith('/services/')) return 'service';
  if (pageId.startsWith('/projects/')) return 'website';

  return typeMap[pageId] || 'website';
}

export default SEOWrapper;