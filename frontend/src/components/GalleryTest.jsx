import React from 'react';
import PublicGallery from './PublicGallery';
import ImageService from '../services/ImageService';

/**
 * GalleryTest - Test component to verify gallery functionality
 * This can be used for testing and development purposes
 */
const GalleryTest = () => {
  // Test ImageService methods
  const testImageService = () => {
    console.log('=== ImageService Test Results ===');
    
    // Test getting all images
    const allImages = ImageService.getPublicImages();
    console.log('All images:', allImages.length);
    
    // Test category filtering
    const animalImages = ImageService.getPublicImages('animals');
    const farmImages = ImageService.getPublicImages('farm');
    console.log('Animal images:', animalImages.length);
    console.log('Farm images:', farmImages.length);
    
    // Test categorization
    const imagesByCategory = ImageService.getImagesByCategory();
    console.log('Images by category:', imagesByCategory);
    
    // Test featured images
    const featuredImages = ImageService.getFeaturedImages(4);
    console.log('Featured images:', featuredImages);
    
    // Test URL generation
    console.log('Sample image URL:', ImageService.getImageUrl('adonai1.jpg'));
    console.log('Placeholder URL:', ImageService.getPlaceholderUrl());
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Gallery System Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={testImageService}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2d5016',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test ImageService (Check Console)
        </button>
      </div>

      <h2>Full Gallery (All Categories)</h2>
      <PublicGallery />

      <h2 style={{ marginTop: '3rem' }}>Animals Only</h2>
      <PublicGallery category="animals" showCategories={false} />

      <h2 style={{ marginTop: '3rem' }}>Farm Operations Only</h2>
      <PublicGallery category="farm" showCategories={false} />

      <h2 style={{ marginTop: '3rem' }}>Limited Gallery (Max 4 Images)</h2>
      <PublicGallery maxImages={4} />
    </div>
  );
};

export default GalleryTest;