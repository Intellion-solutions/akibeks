import type { SEOConfig, OpenGraphData, TwitterCardData, SEOAudit } from '../types/seo';
export declare const SEO_CONFIG: SEOConfig;
export declare const STRUCTURED_DATA_TEMPLATES: {
    organization: {
        '@context': string;
        '@type': string;
        name: string;
        url: string;
        logo: string;
        description: string;
        address: {
            '@type': string;
            streetAddress: string;
            addressLocality: string;
            addressCountry: string;
            postalCode: string;
        };
        contactPoint: {
            '@type': string;
            telephone: string;
            contactType: string;
            email: string;
            availableLanguage: string[];
        };
        sameAs: string[];
        foundingDate: string;
        numberOfEmployees: string;
        slogan: string;
    };
    service: (service: any) => {
        '@context': string;
        '@type': string;
        name: any;
        description: any;
        provider: {
            '@type': string;
            name: string;
        };
        areaServed: {
            '@type': string;
            name: string;
        };
        serviceType: any;
        offers: {
            '@type': string;
            availability: string;
            priceRange: any;
            priceCurrency: string;
        };
    };
    project: (project: any) => {
        '@context': string;
        '@type': string;
        name: any;
        description: any;
        creator: {
            '@type': string;
            name: string;
        };
        dateCreated: any;
        dateModified: any;
        locationCreated: {
            '@type': string;
            name: any;
        };
        workExample: {
            '@type': string;
            name: any;
            description: any;
        };
    };
    breadcrumb: (items: Array<{
        name: string;
        url: string;
    }>) => {
        '@context': string;
        '@type': string;
        itemListElement: {
            '@type': string;
            position: number;
            name: string;
            item: string;
        }[];
    };
    faq: (faqs: Array<{
        question: string;
        answer: string;
    }>) => {
        '@context': string;
        '@type': string;
        mainEntity: {
            '@type': string;
            name: string;
            acceptedAnswer: {
                '@type': string;
                text: string;
            };
        }[];
    };
    localBusiness: {
        '@context': string;
        '@type': string;
        name: string;
        image: string;
        url: string;
        telephone: string;
        address: {
            '@type': string;
            streetAddress: string;
            addressLocality: string;
            addressRegion: string;
            postalCode: string;
            addressCountry: string;
        };
        geo: {
            '@type': string;
            latitude: number;
            longitude: number;
        };
        openingHoursSpecification: {
            '@type': string;
            dayOfWeek: string[];
            opens: string;
            closes: string;
        }[];
        priceRange: string;
        currenciesAccepted: string;
        paymentAccepted: string;
    };
};
export declare class SEOManager {
    static generateTitle(pageTitle?: string): string;
    static generateDescription(pageDescription?: string): string;
    static generateKeywords(pageKeywords?: string[]): string;
    static generateCanonicalUrl(path: string): string;
    static generateOpenGraph(data: Partial<OpenGraphData>): OpenGraphData;
    static generateTwitterCard(data: Partial<TwitterCardData>): TwitterCardData;
    static generateStructuredData(type: keyof typeof STRUCTURED_DATA_TEMPLATES, data?: any): string;
    static generateRobotsTxt(): string;
    static generateSitemap(pages: Array<{
        url: string;
        lastmod?: string;
        priority?: number;
        changefreq?: string;
    }>): string;
    static generateLLMOptimizedContent(topic: string, keywords: string[]): {
        title: string;
        description: string;
        headings: string[];
        content: string;
    };
    static auditPage(pageData: {
        title?: string;
        description?: string;
        keywords?: string[];
        headings?: string[];
        images?: Array<{
            alt?: string;
            src: string;
        }>;
        links?: Array<{
            href: string;
            text: string;
        }>;
        content?: string;
    }): SEOAudit;
}
declare const _default: {
    config: SEOConfig;
    templates: {
        organization: {
            '@context': string;
            '@type': string;
            name: string;
            url: string;
            logo: string;
            description: string;
            address: {
                '@type': string;
                streetAddress: string;
                addressLocality: string;
                addressCountry: string;
                postalCode: string;
            };
            contactPoint: {
                '@type': string;
                telephone: string;
                contactType: string;
                email: string;
                availableLanguage: string[];
            };
            sameAs: string[];
            foundingDate: string;
            numberOfEmployees: string;
            slogan: string;
        };
        service: (service: any) => {
            '@context': string;
            '@type': string;
            name: any;
            description: any;
            provider: {
                '@type': string;
                name: string;
            };
            areaServed: {
                '@type': string;
                name: string;
            };
            serviceType: any;
            offers: {
                '@type': string;
                availability: string;
                priceRange: any;
                priceCurrency: string;
            };
        };
        project: (project: any) => {
            '@context': string;
            '@type': string;
            name: any;
            description: any;
            creator: {
                '@type': string;
                name: string;
            };
            dateCreated: any;
            dateModified: any;
            locationCreated: {
                '@type': string;
                name: any;
            };
            workExample: {
                '@type': string;
                name: any;
                description: any;
            };
        };
        breadcrumb: (items: Array<{
            name: string;
            url: string;
        }>) => {
            '@context': string;
            '@type': string;
            itemListElement: {
                '@type': string;
                position: number;
                name: string;
                item: string;
            }[];
        };
        faq: (faqs: Array<{
            question: string;
            answer: string;
        }>) => {
            '@context': string;
            '@type': string;
            mainEntity: {
                '@type': string;
                name: string;
                acceptedAnswer: {
                    '@type': string;
                    text: string;
                };
            }[];
        };
        localBusiness: {
            '@context': string;
            '@type': string;
            name: string;
            image: string;
            url: string;
            telephone: string;
            address: {
                '@type': string;
                streetAddress: string;
                addressLocality: string;
                addressRegion: string;
                postalCode: string;
                addressCountry: string;
            };
            geo: {
                '@type': string;
                latitude: number;
                longitude: number;
            };
            openingHoursSpecification: {
                '@type': string;
                dayOfWeek: string[];
                opens: string;
                closes: string;
            }[];
            priceRange: string;
            currenciesAccepted: string;
            paymentAccepted: string;
        };
    };
    manager: typeof SEOManager;
};
export default _default;
//# sourceMappingURL=index.d.ts.map