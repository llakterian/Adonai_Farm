// Sitemap generation utility for Adonai Farm website
import { farmBusinessInfo } from './seo.js';

// Define all public pages with their metadata
export const sitePages = [
  {
    url: '/',
    title: 'Home - Modern Livestock Farm in Kericho, Kenya',
    description: 'Adonai Farm - Leading livestock farm in Kericho, Kenya specializing in sustainable farming, quality breeding, farm tours, and premium agricultural products.',
    priority: 1.0,
    changefreq: 'weekly',
    lastmod: '2025-01-15'
  },
  {
    url: '/about',
    title: 'About Adonai Farm - Our Story & Mission',
    description: 'Learn about Adonai Farm\'s journey from humble beginnings to becoming a leading livestock farm in Kericho, Kenya.',
    priority: 0.8,
    changefreq: 'monthly',
    lastmod: '2025-01-15'
  },
  {
    url: '/animals',
    title: 'Meet Our Animals - Livestock at Adonai Farm',
    description: 'Meet the wonderful animals at Adonai Farm in Kericho, Kenya. Our diverse livestock includes dairy cattle, beef cattle, goats, sheep, and poultry.',
    priority: 0.9,
    changefreq: 'weekly',
    lastmod: '2025-01-15'
  },
  {
    url: '/gallery',
    title: 'Farm Photo Gallery - Adonai Farm Images',
    description: 'Explore our beautiful farm photo gallery showcasing Adonai Farm\'s operations, animals, facilities, and daily life in Kericho, Kenya.',
    priority: 0.7,
    changefreq: 'weekly',
    lastmod: '2025-01-15'
  },
  {
    url: '/services',
    title: 'Farm Services - Livestock Breeding, Tours & Agricultural Consulting',
    description: 'Comprehensive livestock services at Adonai Farm: professional breeding, educational farm tours, premium meat & dairy products, and agricultural consulting.',
    priority: 0.9,
    changefreq: 'monthly',
    lastmod: '2025-01-15'
  },
  {
    url: '/contact',
    title: 'Contact Adonai Farm - Visit, Inquire & Connect',
    description: 'Contact Adonai Farm in Chepsir, Kericho for farm visits, product inquiries, and breeding services. Call +254 722 759 217 or email info@adonaifarm.co.ke.',
    priority: 0.8,
    changefreq: 'monthly',
    lastmod: '2025-01-15'
  }
];

// Generate XML sitemap
export const generateSitemap = () => {
  const baseUrl = farmBusinessInfo.url;
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitePages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
};

// Generate JSON-LD sitemap for structured data
export const generateStructuredSitemap = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": farmBusinessInfo.name,
    "description": farmBusinessInfo.description,
    "url": farmBusinessInfo.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${farmBusinessInfo.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": sitePages.map(page => ({
      "@type": "WebPage",
      "name": page.title,
      "description": page.description,
      "url": `${farmBusinessInfo.url}${page.url}`,
      "dateModified": page.lastmod,
      "inLanguage": "en-KE"
    }))
  };
};

// Generate breadcrumb navigation for any page
export const generateBreadcrumbs = (currentPath) => {
  const breadcrumbs = [{ name: "Home", url: "/" }];
  
  // Find current page
  const currentPage = sitePages.find(page => page.url === currentPath);
  
  if (currentPage && currentPath !== '/') {
    breadcrumbs.push({
      name: currentPage.title.split(' - ')[0], // Get first part of title
      url: currentPath
    });
  }
  
  return breadcrumbs;
};

// Get page metadata by URL
export const getPageMetadata = (url) => {
  return sitePages.find(page => page.url === url) || sitePages[0]; // Default to home page
};

// Generate canonical URL
export const getCanonicalUrl = (path) => {
  return `${farmBusinessInfo.url}${path}`;
};

// Generate social media sharing URLs
export const getSocialSharingUrls = (url, title, description) => {
  const fullUrl = encodeURIComponent(`${farmBusinessInfo.url}${url}`);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${fullUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${fullUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${fullUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${fullUrl}`
  };
};

// Check if URL is valid public page
export const isValidPublicPage = (url) => {
  return sitePages.some(page => page.url === url);
};

// Get related pages based on current page
export const getRelatedPages = (currentUrl, limit = 3) => {
  const currentPage = sitePages.find(page => page.url === currentUrl);
  if (!currentPage) return [];
  
  // Simple related pages logic - exclude current page and return others
  return sitePages
    .filter(page => page.url !== currentUrl)
    .sort((a, b) => b.priority - a.priority) // Sort by priority
    .slice(0, limit);
};