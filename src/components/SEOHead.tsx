
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: Record<string, any>[];
  noIndex?: boolean;
  noFollow?: boolean;
  pageType?: 'home' | 'service' | 'project' | 'contact' | 'about' | 'generic';
  breadcrumbs?: Array<{ name: string; url: string }>;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  // Kenya-specific props
  location?: string;
  county?: string;
  serviceArea?: string[];
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'AKIBEKS Engineering Solutions - Expert Construction Services in Kenya',
  description = 'Leading construction and engineering company in Kenya providing quality building, renovation, and infrastructure services across all 47 counties.',
  keywords = ['construction Kenya', 'engineering services', 'building contractors Nairobi', 'renovation Kenya', 'infrastructure development'],
  canonical,
  ogTitle,
  ogDescription,
  ogImage = '/images/akibeks-og-image.jpg',
  ogType = 'website',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData = [],
  noIndex = false,
  noFollow = false,
  pageType = 'generic',
  breadcrumbs = [],
  author = 'AKIBEKS Engineering Solutions',
  publishedDate,
  modifiedDate,
  location,
  county,
  serviceArea = ['Kenya']
}) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://akibeks.co.ke';
  const currentUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl);
  
  // Ensure title includes Kenya for local SEO
  const optimizedTitle = title.toLowerCase().includes('kenya') 
    ? title 
    : `${title} | Kenya Construction Services`;

  // Enhanced description with Kenya keywords
  const optimizedDescription = description.toLowerCase().includes('kenya')
    ? description
    : `${description} Located in Kenya, serving all 47 counties with professional construction and engineering services.`;

  // Enhanced keywords with Kenya-specific terms
  const optimizedKeywords = [
    ...keywords,
    'Kenya construction',
    'Nairobi contractors',
    'building services Kenya',
    'engineering Kenya',
    ...(county ? [`${county} construction`, `${county} contractors`] : []),
    ...(location ? [`${location} building services`] : [])
  ];

  // Robots meta
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow'
  ].join(',');

  // Generate default structured data
  const defaultStructuredData = generateDefaultStructuredData(pageType, {
    title: optimizedTitle,
    description: optimizedDescription,
    url: currentUrl,
    breadcrumbs,
    location,
    county,
    serviceArea
  });

  // Combine default and custom structured data
  const allStructuredData = [...defaultStructuredData, ...structuredData];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{optimizedTitle}</title>
      <meta name="description" content={optimizedDescription} />
      <meta name="keywords" content={optimizedKeywords.join(', ')} />
      <meta name="robots" content={robotsContent} />
      <meta name="author" content={author} />
      
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Dates */}
      {publishedDate && <meta name="article:published_time" content={publishedDate} />}
      {modifiedDate && <meta name="article:modified_time" content={modifiedDate} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={ogTitle || optimizedTitle} />
      <meta property="og:description" content={ogDescription || optimizedDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="AKIBEKS Engineering Solutions" />
      <meta property="og:locale" content="en_KE" />
      {ogImage && <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`} />}
      {ogImage && <meta property="og:image:alt" content={`${optimizedTitle} - AKIBEKS Engineering Solutions`} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@akibekseng" />
      <meta name="twitter:creator" content="@akibekseng" />
      <meta name="twitter:title" content={twitterTitle || ogTitle || optimizedTitle} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || optimizedDescription} />
      {(twitterImage || ogImage) && (
        <meta name="twitter:image" content={(twitterImage || ogImage)?.startsWith('http') 
          ? (twitterImage || ogImage) 
          : `${baseUrl}${twitterImage || ogImage}`} />
      )}

      {/* Geographic Meta Tags */}
      <meta name="geo.region" content="KE" />
      <meta name="geo.placename" content={location || county || 'Kenya'} />
      <meta name="geo.position" content="-1.286389;36.817223" /> {/* Nairobi coordinates */}
      <meta name="ICBM" content="-1.286389, 36.817223" />

      {/* Language and Locale */}
      <meta name="language" content="en-KE" />
      <meta name="content-language" content="en-KE" />
      
      {/* Publisher Information */}
      <meta name="publisher" content="AKIBEKS Engineering Solutions" />
      <meta name="copyright" content="© 2024 AKIBEKS Engineering Solutions. All rights reserved." />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=+254700000000" />
      
      {/* Theme Colors */}
      <meta name="theme-color" content="#1a365d" />
      <meta name="msapplication-TileColor" content="#1a365d" />

      {/* Structured Data */}
      {allStructuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />

      {/* DNS Prefetch for Kenya-specific domains */}
      <link rel="dns-prefetch" href="//safaricom.co.ke" />
      <link rel="dns-prefetch" href="//airtel.co.ke" />
      <link rel="dns-prefetch" href="//mpesa.vodafone.com" />
    </Helmet>
  );
};

// Helper function to generate default structured data
function generateDefaultStructuredData(
  pageType: string,
  data: {
    title: string;
    description: string;
    url: string;
    breadcrumbs: Array<{ name: string; url: string }>;
    location?: string;
    county?: string;
    serviceArea: string[];
  }
): Record<string, any>[] {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://akibeks.co.ke';
  const schemas: Record<string, any>[] = [];

  // Organization Schema (always included)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'AKIBEKS Engineering Solutions',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description: 'Leading construction and engineering company in Kenya',
    telephone: '+254-700-000-000',
    email: 'info@akibeks.co.ke',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nairobi CBD',
      addressLocality: data.location || 'Nairobi',
      addressRegion: data.county || 'Nairobi County',
      postalCode: '00100',
      addressCountry: 'KE'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.286389,
      longitude: 36.817223
    },
    areaServed: data.serviceArea.map(area => ({
      '@type': 'Country',
      name: area
    })),
    sameAs: [
      'https://www.facebook.com/akibeksengineering',
      'https://twitter.com/akibekseng',
      'https://www.linkedin.com/company/akibeks',
      'https://www.instagram.com/akibekseng'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+254-700-000-000',
        contactType: 'customer service',
        areaServed: 'KE',
        availableLanguage: ['en', 'sw']
      },
      {
        '@type': 'ContactPoint',
        email: 'info@akibeks.co.ke',
        contactType: 'customer service',
        areaServed: 'KE'
      }
    ]
  });

  // LocalBusiness Schema for home page
  if (pageType === 'home') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${baseUrl}/#localbusiness`,
      name: 'AKIBEKS Engineering Solutions',
      description: data.description,
      url: data.url,
      telephone: '+254-700-000-000',
      email: 'info@akibeks.co.ke',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Nairobi CBD',
        addressLocality: data.location || 'Nairobi',
        addressRegion: data.county || 'Nairobi County',
        postalCode: '00100',
        addressCountry: 'KE'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -1.286389,
        longitude: 36.817223
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '13:00'
        }
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Kenya'
      }
    });
  }

  // WebSite Schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'AKIBEKS Engineering Solutions',
    description: 'Professional construction and engineering services in Kenya',
    publisher: {
      '@id': `${baseUrl}/#organization`
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'en-KE'
  });

  // Breadcrumb Schema
  if (data.breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data.breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url.startsWith('http') ? breadcrumb.url : `${baseUrl}${breadcrumb.url}`
      }))
    });
  }

  // Page-specific schemas
  switch (pageType) {
    case 'service':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: data.title,
        description: data.description,
        url: data.url,
        provider: {
          '@id': `${baseUrl}/#organization`
        },
        areaServed: {
          '@type': 'Country',
          name: 'Kenya'
        },
        serviceType: 'Construction Service'
      });
      break;

    case 'contact':
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact AKIBEKS Engineering Solutions',
        description: data.description,
        url: data.url,
        mainEntity: {
          '@id': `${baseUrl}/#organization`
        }
      });
      break;
  }

  return schemas;
}

export default SEOHead;
