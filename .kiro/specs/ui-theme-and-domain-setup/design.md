# Design Document

## Overview

This design addresses two main components:
1. **UI Theme Overhaul**: Implementing a cohesive, accessible agricultural theme that eliminates white background visibility issues
2. **Custom Domain & SSL Setup**: Configuring https://adonaifarm.co.ke with automatic SSL through Railway

The solution focuses on creating a professional, farm-inspired design system with excellent accessibility while establishing a secure custom domain presence.

## Architecture

### Theme System Architecture
- **Unified CSS Variables**: Single source of truth for colors, typography, and spacing
- **Component-Based Styling**: Modular CSS that can be easily maintained and updated
- **Accessibility-First Design**: WCAG AA compliant color contrasts and interactive elements
- **Responsive Design**: Mobile-first approach with progressive enhancement

### Domain & SSL Architecture
- **Railway Custom Domain**: Native Railway domain management with automatic SSL
- **DNS Configuration**: Proper CNAME/A record setup for domain routing
- **SSL Certificate**: Let's Encrypt automatic certificate management
- **Redirect Strategy**: HTTP to HTTPS redirects and www handling

## Components and Interfaces

### Theme System Components

#### 1. Color Palette (`unified-theme.css`)
**Purpose**: Establish a cohesive agricultural color system
**Key Colors**:
- **Primary Green**: `#2d5016` (Forest Green) - Main brand color
- **Secondary Green**: `#4a7c59` (Sage Green) - Supporting elements
- **Accent Gold**: `#d4af37` (Harvest Gold) - Highlights and CTAs
- **Earth Brown**: `#8b4513` - Warm accents
- **Cream White**: `#f8f6f0` - Background alternative to pure white
- **Text Charcoal**: `#2f2f2f` - Primary text color

#### 2. Admin Interface Theme (`admin-theme-fix.css`)
**Purpose**: Fix white background issues and improve visibility
**Key Features**:
- High contrast button states
- Visible tab navigation with clear active states
- Card backgrounds with subtle tinting
- Form elements with proper focus states
- Mobile-responsive navigation

#### 3. Typography System
**Purpose**: Consistent, readable fonts across all interfaces
**Fonts**:
- **Primary**: Inter (clean, modern sans-serif)
- **Display**: Poppins (friendly, approachable headings)
- **Weights**: 400 (normal), 600 (semibold), 700 (bold)

#### 4. Component Library
**Purpose**: Reusable UI components with consistent styling
**Components**:
- Buttons (primary, secondary, outline, danger)
- Cards (standard, stat, animal/worker)
- Forms (inputs, selects, textareas)
- Navigation (tabs, mobile menu)
- Modals and overlays

### Domain & SSL Components

#### 1. Railway Domain Configuration
**Purpose**: Connect custom domain to Railway deployment
**Configuration**:
- Custom domain: `adonaifarm.co.ke`
- SSL: Automatic Let's Encrypt certificate
- Redirect: HTTP to HTTPS enforcement

#### 2. DNS Configuration
**Purpose**: Route domain traffic to Railway
**Records Needed**:
- A record: `@` pointing to Railway IP
- CNAME record: `www` pointing to Railway domain
- Optional: MX records for email (future)

#### 3. Application Configuration
**Purpose**: Handle custom domain in application
**Updates**:
- FRONTEND_URL environment variable
- CORS configuration for custom domain
- Asset serving over HTTPS

## Data Models

No database changes required. The theme system uses CSS custom properties and the domain setup is infrastructure-level configuration.

## Error Handling

### Theme System Error Handling
- **Fallback Colors**: CSS fallbacks for unsupported custom properties
- **Progressive Enhancement**: Basic styling works without advanced CSS features
- **Print Styles**: Proper styling for printed documents
- **High Contrast Mode**: Support for accessibility preferences

### Domain & SSL Error Handling
- **DNS Propagation**: Clear instructions for DNS setup and propagation timing
- **SSL Certificate Issues**: Automatic retry mechanisms and troubleshooting steps
- **Mixed Content**: Ensure all assets are served over HTTPS
- **Fallback Domain**: Railway default domain remains accessible during setup

## Testing Strategy

### Theme Testing
1. **Visual Testing**: Screenshot comparison across different pages
2. **Accessibility Testing**: WCAG AA compliance verification
3. **Cross-Browser Testing**: Chrome, Firefox, Safari, Edge compatibility
4. **Mobile Testing**: Responsive design on various screen sizes
5. **Color Contrast Testing**: Automated contrast ratio verification

### Domain & SSL Testing
1. **DNS Resolution**: Verify domain resolves to correct IP
2. **SSL Certificate**: Validate certificate installation and chain
3. **Redirect Testing**: Confirm HTTP to HTTPS redirects work
4. **Functionality Testing**: Ensure all app features work on custom domain
5. **Email Testing**: Verify email functionality with custom domain

## Implementation Approach

### Phase 1: Theme System Implementation
1. Create unified CSS variable system
2. Fix admin panel white background issues
3. Implement consistent button and navigation styling
4. Add accessibility improvements
5. Test across all pages and devices

### Phase 2: Domain & SSL Setup
1. Configure custom domain in Railway dashboard
2. Set up DNS records with domain registrar
3. Update application environment variables
4. Test SSL certificate installation
5. Verify all functionality works with custom domain

### Phase 3: Integration & Testing
1. Comprehensive testing of theme system
2. Domain functionality verification
3. Performance optimization
4. Documentation and handover

## Security Considerations

### Theme Security
- **CSS Injection Prevention**: Sanitized CSS custom properties
- **XSS Protection**: No inline styles or JavaScript in CSS
- **Content Security Policy**: Compatible with CSP headers

### Domain Security
- **SSL/TLS**: Strong encryption with modern cipher suites
- **HSTS**: HTTP Strict Transport Security headers
- **Certificate Transparency**: Automatic CT log submission
- **Domain Validation**: Proper domain ownership verification

## Performance Considerations

### Theme Performance
- **CSS Optimization**: Minified and compressed stylesheets
- **Critical CSS**: Above-the-fold styling prioritization
- **Caching**: Proper cache headers for static assets
- **Bundle Size**: Optimized CSS delivery

### Domain Performance
- **CDN Integration**: Railway's built-in CDN for static assets
- **Compression**: Gzip/Brotli compression for all assets
- **Caching Strategy**: Proper cache headers for optimal performance
- **DNS Performance**: Fast DNS resolution with Railway's infrastructure

## Accessibility Features

### Visual Accessibility
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Indicators**: Clear focus states for keyboard navigation
- **Color Independence**: Information not conveyed by color alone
- **Text Scaling**: Support for 200% zoom without horizontal scrolling

### Interactive Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Motion Preferences**: Respect prefers-reduced-motion settings

## Maintenance Strategy

### Theme Maintenance
- **CSS Variables**: Centralized color and spacing management
- **Component Documentation**: Clear documentation for each component
- **Version Control**: Proper CSS versioning and change tracking
- **Regular Audits**: Periodic accessibility and performance audits

### Domain Maintenance
- **SSL Renewal**: Automatic certificate renewal monitoring
- **DNS Monitoring**: Regular DNS resolution checks
- **Performance Monitoring**: Domain-specific performance tracking
- **Security Updates**: Regular security assessment and updates