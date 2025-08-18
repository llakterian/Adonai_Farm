import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateMetaTags, generateStructuredData, generateBreadcrumbData } from '../utils/seo.js';

export default function SEOHead({ 
  pageType = "website",
  title,
  description,
  keywords = [],
  image,
  url,
  breadcrumbs = [],
  pageData = {},
  publishedTime,
  modifiedTime,
  author
}) {
  const metaTags = generateMetaTags({
    title,
    description,
    keywords,
    image,
    url,
    type: pageType,
    publishedTime,
    modifiedTime,
    author
  });

  const structuredData = generateStructuredData(pageType, pageData);
  const breadcrumbData = breadcrumbs.length > 0 ? generateBreadcrumbData(breadcrumbs) : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="author" content={metaTags.author} />
      <meta name="robots" content={metaTags.robots} />
      <meta name="language" content={metaTags.language} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={metaTags.canonical} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={metaTags.ogTitle} />
      <meta property="og:description" content={metaTags.ogDescription} />
      <meta property="og:image" content={metaTags.ogImage} />
      <meta property="og:url" content={metaTags.ogUrl} />
      <meta property="og:type" content={metaTags.ogType} />
      <meta property="og:site_name" content={metaTags.ogSiteName} />
      <meta property="og:locale" content="en_KE" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={metaTags.twitterCard} />
      <meta name="twitter:title" content={metaTags.twitterTitle} />
      <meta name="twitter:description" content={metaTags.twitterDescription} />
      <meta name="twitter:image" content={metaTags.twitterImage} />
      {metaTags.twitterSite && <meta name="twitter:site" content={metaTags.twitterSite} />}
      
      {/* Geographic Meta Tags for Local SEO */}
      <meta name="geo.region" content={metaTags.geoRegion} />
      <meta name="geo.placename" content={metaTags.geoPlacename} />
      <meta name="geo.position" content={metaTags.geoPosition} />
      <meta name="ICBM" content={metaTags.geoPosition} />
      
      {/* Article specific meta tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Breadcrumb Structured Data */}
      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#2d5016" />
      <meta name="msapplication-TileColor" content="#2d5016" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Adonai Farm" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Helmet>
  );
}