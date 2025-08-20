// SEO utility functions for Adonai Farm website
export const farmBusinessInfo = {
  name: "Adonai Farm",
  description: "Modern livestock farm in Kericho, Kenya specializing in sustainable farming, quality breeding, and premium agricultural products",
  url: "https://adonaifarm.co.ke",
  logo: "/images/logo.png",
  image: "/images/adonaixiii.jpg",

  // Business details
  type: "Farm",
  category: "Agriculture",
  foundingDate: "2020",

  // Location information for local SEO
  address: {
    streetAddress: "Chepsir",
    addressLocality: "Kericho",
    addressRegion: "Kericho County",
    addressCountry: "Kenya",
    postalCode: "20200"
  },

  // Contact information
  contact: {
    telephone: "+254722759217",
    email: "info@adonaifarm.co.ke"
  },

  // Operating hours
  openingHours: [
    "Mo-Fr 07:00-18:00",
    "Sa 08:00-16:00"
  ],

  // Services offered
  services: [
    "Livestock Breeding",
    "Farm Tours",
    "Agricultural Consulting",
    "Premium Meat Products",
    "Dairy Products",
    "Veterinary Support"
  ],

  // Keywords for SEO
  keywords: [
    "livestock farm Kenya",
    "Kericho farm",
    "sustainable farming",
    "livestock breeding",
    "farm tours Kenya",
    "agricultural consulting",
    "premium beef Kenya",
    "dairy products Kericho",
    "modern farming technology",
    "animal welfare farm"
  ]
};

// Generate page-specific meta tags
export const generateMetaTags = (pageData) => {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = "website",
    publishedTime,
    modifiedTime,
    author
  } = pageData;

  const fullTitle = title ? `${title} | ${farmBusinessInfo.name}` : farmBusinessInfo.name;
  const fullDescription = description || farmBusinessInfo.description;
  const fullUrl = url ? `${farmBusinessInfo.url}${url}` : farmBusinessInfo.url;
  const fullImage = image ? `${farmBusinessInfo.url}${image}` : farmBusinessInfo.image;
  const allKeywords = [...farmBusinessInfo.keywords, ...keywords].join(", ");

  return {
    // Basic meta tags
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,

    // Open Graph tags for social media
    ogTitle: fullTitle,
    ogDescription: fullDescription,
    ogImage: fullImage,
    ogUrl: fullUrl,
    ogType: type,
    ogSiteName: farmBusinessInfo.name,

    // Twitter Card tags
    twitterCard: "summary_large_image",
    twitterTitle: fullTitle,
    twitterDescription: fullDescription,
    twitterImage: fullImage,
    twitterSite: "@adonaifarm", // Add if Twitter account exists

    // Additional meta tags
    canonical: fullUrl,
    robots: "index, follow",
    language: "en-KE",
    author: author || farmBusinessInfo.name,
    publishedTime,
    modifiedTime,

    // Local business specific
    geoRegion: "KE-30", // Kericho County code
    geoPlacename: "Kericho, Kenya",
    geoPosition: "-0.3676,35.2833" // Approximate coordinates for Kericho
  };
};

// Generate structured data (JSON-LD) for different page types
export const generateStructuredData = (pageType, pageData = {}) => {
  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": farmBusinessInfo.name,
    "description": farmBusinessInfo.description,
    "url": farmBusinessInfo.url,
    "logo": farmBusinessInfo.logo,
    "image": farmBusinessInfo.image,
    "foundingDate": farmBusinessInfo.foundingDate,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": farmBusinessInfo.address.streetAddress,
      "addressLocality": farmBusinessInfo.address.addressLocality,
      "addressRegion": farmBusinessInfo.address.addressRegion,
      "addressCountry": farmBusinessInfo.address.addressCountry,
      "postalCode": farmBusinessInfo.address.postalCode
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": farmBusinessInfo.contact.telephone,
      "email": farmBusinessInfo.contact.email,
      "contactType": "customer service"
    },
    "openingHoursSpecification": farmBusinessInfo.openingHours.map(hours => ({
      "@type": "OpeningHoursSpecification",
      "opens": hours.split(" ")[1].split("-")[0],
      "closes": hours.split(" ")[1].split("-")[1],
      "dayOfWeek": hours.split(" ")[0]
    })),
    "sameAs": [
      // Add social media URLs when available
      // "https://www.facebook.com/adonaifarm",
      // "https://www.instagram.com/adonaifarm"
    ]
  };

  switch (pageType) {
    case "homepage":
      return {
        ...baseOrganization,
        "@type": ["Organization", "LocalBusiness"],
        "priceRange": "$$",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Farm Services",
          "itemListElement": farmBusinessInfo.services.map((service, index) => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": service
            }
          }))
        }
      };

    case "about":
      return {
        ...baseOrganization,
        "knowsAbout": [
          "Livestock Management",
          "Sustainable Farming",
          "Animal Breeding",
          "Agricultural Technology"
        ]
      };

    case "services":
      return {
        ...baseOrganization,
        "@type": ["Organization", "LocalBusiness"],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Farm Services & Products",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Livestock Breeding",
                "description": "Professional breeding services with genetic optimization"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Farm Tours",
                "description": "Educational farm visits and tours",
                "offers": {
                  "@type": "Offer",
                  "price": "500",
                  "priceCurrency": "KES"
                }
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Premium Livestock Products",
                "description": "High-quality meat and dairy products"
              }
            }
          ]
        }
      };

    case "contact":
      return {
        ...baseOrganization,
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": farmBusinessInfo.contact.telephone,
            "email": farmBusinessInfo.contact.email,
            "contactType": "customer service",
            "availableLanguage": ["English", "Swahili"]
          }
        ]
      };

    case "animals":
      return {
        ...baseOrganization,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Livestock",
          "itemListElement": pageData.animals?.map(animal => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": animal.name,
              "description": animal.description,
              "category": "Livestock"
            }
          })) || []
        }
      };

    case "gallery":
      return {
        ...baseOrganization,
        "photo": pageData.images?.map(image => ({
          "@type": "ImageObject",
          "url": `${farmBusinessInfo.url}${image.url}`,
          "caption": image.caption || `${farmBusinessInfo.name} - ${image.category}`
        })) || []
      };

    default:
      return baseOrganization;
  }
};

// SEO-friendly URL slug generator
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Generate breadcrumb structured data
export const generateBreadcrumbData = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${farmBusinessInfo.url}${crumb.url}`
    }))
  };
};