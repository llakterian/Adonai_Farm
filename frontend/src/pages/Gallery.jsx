import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ImageService from '../services/ImageService.js';
import {
  compressImage,
  generateResponsiveImages,
  createOptimizedImage,
  handleImageError,
  preloadImages,
  defaultLazyLoader
} from '../utils/imageOptimization.js';
import PublicGallery from '../components/PublicGallery.jsx';
import SEOHead from '../components/SEOHead.jsx';



export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isPublicRoute = !location.pathname.startsWith('/admin');

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        if (isPublicRoute) {
          const imageList = await ImageService.getPublicImagesAsync();
          setPhotos(imageList);
        } else {
          // For admin route, load all images directly
          const allImages = ImageService.getPublicImages('all');
          setPhotos(allImages);
        }
      } catch (error) {
        console.error("Failed to load gallery images:", error);
        // Fallback to direct image service call
        const fallbackImages = ImageService.getPublicImages('all');
        setPhotos(fallbackImages);
      }
      setLoading(false);
    };

    loadImages();
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return (
      <>
        <SEOHead
          pageType="gallery"
          title="Farm Photo Gallery - Adonai Farm Images"
          description="Explore our beautiful farm photo gallery showcasing Adonai Farm's operations, animals, facilities, and daily life in Kericho, Kenya. See our sustainable farming practices in action."
          keywords={[
            "Adonai Farm gallery",
            "farm photos Kericho Kenya",
            "livestock farm images",
            "sustainable farming photos",
            "farm operations gallery",
            "agricultural photography Kenya",
            "farm animals photos",
            "Kericho farm pictures",
            "pastoral farming images",
            "farm life photography"
          ]}
          image="/images/hero-farm.jpg"
          url="/gallery"
          breadcrumbs={[
            { name: "Home", url: "/" },
            { name: "Gallery", url: "/gallery" }
          ]}
          pageData={{
            images: photos.map(photo => ({
              url: photo.path,
              caption: photo.filename,
              category: 'farm'
            }))
          }}
        />
        <PublicGallery />
      </>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Admin Gallery Implementation
  return (
    <div className="admin-container">
      <div className="card">
        <div className="card-header">
          <h2>📸 Farm Photo Gallery Management</h2>
          <p>Manage and view all farm photos from the image collection</p>
        </div>

        {/* Gallery Stats */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-number">{photos.length}</div>
            <div className="stat-label">📷 Total Photos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{photos.filter(p => p.category === 'animals').length}</div>
            <div className="stat-label">🐄 Animal Photos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{photos.filter(p => p.category === 'farm').length}</div>
            <div className="stat-label">🌾 Farm Photos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{Math.round(photos.length / 10) * 10}</div>
            <div className="stat-label">📁 Collections</div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="admin-gallery-grid">
          {photos.map((photo, index) => (
            <div key={photo.id || index} className="admin-gallery-item">
              <div className="gallery-image-container">
                <img
                  src={`/images/${photo.filename}`}
                  alt={photo.caption || photo.filename}
                  className="gallery-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-error-placeholder" style={{ display: 'none' }}>
                  <span>📷</span>
                  <p>Image not found</p>
                </div>
              </div>
              <div className="gallery-item-info">
                <h4>{photo.filename}</h4>
                <p className="gallery-caption">{photo.caption}</p>
                <div className="gallery-meta">
                  <span className={`category-badge category-${photo.category}`}>
                    {photo.category === 'animals' ? '🐄' : '🌾'} {photo.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <h3>No Photos Found</h3>
            <p>The gallery appears to be empty. Photos should be loaded from the /images folder.</p>
          </div>
        )}
      </div>
    </div>
  );
}