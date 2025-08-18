import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mockGalleryImages } from '../auth.js';
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
  const location = useLocation();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detect if this is a public route (not dashboard)
  const isPublicRoute = !location.pathname.startsWith('/dashboard');

  // Image optimization state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [imageMetadata, setImageMetadata] = useState(null);
  const [optimizationStats, setOptimizationStats] = useState(null);
  const [enableOptimization, setEnableOptimization] = useState(true);
  const [batchUploading, setBatchUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  function loadPhotos() {
    setLoading(true);
    // Load from localStorage or use mock data
    const savedPhotos = localStorage.getItem('adonai_gallery');
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    } else {
      setPhotos([...mockGalleryImages]);
      localStorage.setItem('adonai_gallery', JSON.stringify(mockGalleryImages));
    }
    setError(null);
    setLoading(false);
  }

  // Load optimization stats on component mount
  useEffect(() => {
    // Initialize optimization stats
    setOptimizationStats({
      totalImagesOptimized: 0,
      totalSizeSaved: 0,
      averageCompressionRatio: 0
    });
  }, []);

  // Handle single file upload with optimization
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(null);
    setImageMetadata(null);

    // Basic file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, WebP, or GIF images.');
      return;
    }
    
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    try {
      // Get basic image metadata
      const metadata = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type,
            sizeMB: (file.size / 1024 / 1024).toFixed(2),
            sizeKB: (file.size / 1024).toFixed(0),
            megapixels: ((img.width * img.height) / 1000000).toFixed(1),
            aspectRatio: (img.width / img.height).toFixed(2)
          });
        };
        img.src = URL.createObjectURL(file);
      });
      
      setImageMetadata(metadata);

      if (enableOptimization) {
        setOptimizing(true);
        setOptimizationProgress(0);

        // Optimize image using compressImage
        const optimizedBlob = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 0.8
        });

        setOptimizationProgress(100);

        // Convert blob to data URL
        const reader = new FileReader();
        reader.onload = function(event) {
          const optimizedDataUrl = event.target.result;
          const originalSize = file.size;
          const optimizedSize = optimizedBlob.size;
          const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
          
          // Create photo entry with optimized data
          const newPhoto = {
            id: Math.max(...photos.map(p => p.id), 0) + 1,
            filename: file.name,
            path: optimizedDataUrl,
            uploaded_at: new Date().toISOString(),
            size: optimizedBlob.size,
            originalSize: file.size,
            width: metadata.width,
            height: metadata.height,
            compressionRatio: compressionRatio,
            optimized: true
          };

          const updatedPhotos = [...photos, newPhoto];
          setPhotos(updatedPhotos);
          localStorage.setItem('adonai_gallery', JSON.stringify(updatedPhotos));
          
          setSuccess(`Photo optimized and uploaded! Size reduced by ${compressionRatio}%`);
          
          // Update stats
          setOptimizationStats(prev => ({
            totalImagesOptimized: prev.totalImagesOptimized + 1,
            totalSizeSaved: prev.totalSizeSaved + (file.size - optimizedBlob.size),
            averageCompressionRatio: ((prev.averageCompressionRatio * prev.totalImagesOptimized) + parseFloat(compressionRatio)) / (prev.totalImagesOptimized + 1)
          }));
        };
        
        reader.readAsDataURL(optimizedBlob);

        setOptimizing(false);
      } else {
        // Upload without optimization
        setUploading(true);
        setUploadProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);

        // Create a data URL for the image
        const reader = new FileReader();
        reader.onload = function(event) {
          const newPhoto = {
            id: Math.max(...photos.map(p => p.id), 0) + 1,
            filename: file.name,
            path: event.target.result,
            uploaded_at: new Date().toISOString(),
            size: file.size,
            width: metadata.width,
            height: metadata.height,
            optimized: false
          };

          const updatedPhotos = [...photos, newPhoto];
          setPhotos(updatedPhotos);
          localStorage.setItem('adonai_gallery', JSON.stringify(updatedPhotos));
          
          setSuccess(`Photo "${file.name}" uploaded successfully!`);
          setUploading(false);
          setUploadProgress(0);
        };

        reader.readAsDataURL(file);
      }

      e.target.value = ''; // Clear file input
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
        setImageMetadata(null);
      }, 5000);

    } catch (error) {
      setError('Upload failed: ' + error.message);
      setOptimizing(false);
      setUploading(false);
    }
  }

  // Handle batch upload
  async function handleBatchUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setBatchUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Process files one by one for batch upload
      const newPhotos = [];
      let totalOriginalSize = 0;
      let totalOptimizedSize = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setOptimizationProgress((i / files.length) * 100);
        
        // Basic validation
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          continue; // Skip invalid files
        }
        
        try {
          const optimizedBlob = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 800,
            quality: 0.8
          });
          
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(optimizedBlob);
          });
          
          totalOriginalSize += file.size;
          totalOptimizedSize += optimizedBlob.size;
          
          newPhotos.push({
            id: Math.max(...photos.map(p => p.id), 0) + i + 1,
            filename: file.name,
            path: dataUrl,
            uploaded_at: new Date().toISOString(),
            size: optimizedBlob.size,
            originalSize: file.size,
            compressionRatio: ((file.size - optimizedBlob.size) / file.size * 100).toFixed(1),
            optimized: true
          });
        } catch (fileError) {
          console.error(`Failed to process ${file.name}:`, fileError);
        }
      }
      
      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        localStorage.setItem('adonai_gallery', JSON.stringify(updatedPhotos));
        
        const totalCompressionRatio = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
        setSuccess(`Batch upload completed: ${newPhotos.length} photos uploaded. Total size saved: ${totalCompressionRatio}%`);
        
        // Update stats
        setOptimizationStats(prev => ({
          totalImagesOptimized: prev.totalImagesOptimized + newPhotos.length,
          totalSizeSaved: prev.totalSizeSaved + (totalOriginalSize - totalOptimizedSize),
          averageCompressionRatio: ((prev.averageCompressionRatio * prev.totalImagesOptimized) + parseFloat(totalCompressionRatio)) / (prev.totalImagesOptimized + newPhotos.length)
        }));
      } else {
        setError('No valid images were processed');
      }
    } catch (error) {
      setError('Batch upload error: ' + error.message);
    } finally {
      setBatchUploading(false);
      setOptimizationProgress(0);
      e.target.value = ''; // Clear file input
    }
  }

  // If this is a public route, show the public gallery
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

  return (
    <div>
      <h1 className="page-title">📸 Farm Gallery</h1>
      
      {/* Upload Form with Optimization */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📤 Upload New Photo
        </h2>

        {/* Optimization Settings */}
        <div style={{ 
          background: 'var(--soft-white)', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
            ⚙️ Image Optimization Settings
          </h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={enableOptimization}
                onChange={(e) => setEnableOptimization(e.target.checked)}
              />
              <span>Enable automatic image optimization</span>
            </label>
          </div>

          {enableOptimization && (
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
              <p>✅ Images will be automatically compressed and resized</p>
              <p>✅ Thumbnails will be generated for faster loading</p>
              <p>✅ File sizes will be reduced while maintaining quality</p>
            </div>
          )}

          {optimizationStats && (
            <div style={{ 
              background: 'rgba(45, 80, 22, 0.1)', 
              padding: '0.75rem', 
              borderRadius: '6px',
              border: '1px solid var(--primary-green)',
              marginTop: '1rem'
            }}>
              <h5 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                📊 Optimization Statistics
              </h5>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                Images optimized: {optimizationStats.totalImagesOptimized} | 
                Size saved: {(optimizationStats.totalSizeSaved / 1024 / 1024).toFixed(1)}MB | 
                Avg compression: {optimizationStats.averageCompressionRatio.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
        
        {/* Single File Upload */}
        <div className="form-group">
          <label>📁 Select Single Photo</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            disabled={uploading || optimizing || batchUploading}
            style={{ 
              padding: '0.75rem',
              border: '2px dashed var(--light-green)',
              borderRadius: '8px',
              backgroundColor: 'var(--soft-white)',
              cursor: (uploading || optimizing || batchUploading) ? 'not-allowed' : 'pointer'
            }}
          />
        </div>

        {/* Batch Upload */}
        <div className="form-group">
          <label>📁 Select Multiple Photos (Batch Upload)</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            onChange={handleBatchUpload}
            disabled={uploading || optimizing || batchUploading}
            style={{ 
              padding: '0.75rem',
              border: '2px dashed var(--accent-gold)',
              borderRadius: '8px',
              backgroundColor: 'var(--soft-white)',
              cursor: (uploading || optimizing || batchUploading) ? 'not-allowed' : 'pointer'
            }}
          />
          <small style={{ color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
            Supported formats: JPG, PNG, WebP, GIF. Max size per file: 10MB
          </small>
        </div>

        {/* Image Metadata Display */}
        {imageMetadata && (
          <div style={{ 
            background: 'rgba(23, 162, 184, 0.1)', 
            padding: '1rem', 
            borderRadius: '6px',
            border: '1px solid #17a2b8',
            marginTop: '1rem'
          }}>
            <h5 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>
              📋 Image Information
            </h5>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
              <div>📏 Dimensions: {imageMetadata.width} × {imageMetadata.height} pixels ({imageMetadata.megapixels}MP)</div>
              <div>📦 Size: {imageMetadata.sizeMB}MB ({imageMetadata.sizeKB}KB)</div>
              <div>🎨 Format: {imageMetadata.type}</div>
              <div>📐 Aspect Ratio: {imageMetadata.aspectRatio}</div>
              {imageMetadata.optimization.recommended && (
                <div style={{ color: 'var(--accent-gold)', marginTop: '0.5rem' }}>
                  ⚠️ Optimization recommended: {imageMetadata.optimization.reasons.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Upload Progress */}
        {(uploading || optimizing || batchUploading) && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', color: 'var(--primary-green)', fontWeight: '600' }}>
              {optimizing ? '🔧 Optimizing...' : batchUploading ? '📤 Batch Processing...' : '📤 Uploading...'} {optimizationProgress || uploadProgress}%
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--cream)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${optimizationProgress || uploadProgress}%`,
                height: '100%',
                backgroundColor: optimizing ? 'var(--accent-gold)' : 'var(--light-green)',
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        )}
        
        {error && (
          <div className="message message-error">
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div className="message message-success">
            ✅ {success}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-number">{photos.length}</div>
          <div className="stat-label">📸 Total Photos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{photos.filter(p => p.uploaded_at && new Date(p.uploaded_at) > new Date(Date.now() - 7*24*60*60*1000)).length}</div>
          <div className="stat-label">🆕 This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.round(photos.reduce((acc, p) => acc + (p.size || 0), 0) / 1024 / 1024)}</div>
          <div className="stat-label">💾 Total MB</div>
        </div>
      </div>

      {/* Farm Showcase Section */}
      <div className="card" style={{ 
        background: 'var(--gradient-primary)',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', textAlign: 'center' }}>
          🌾 Adonai Farm Showcase
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.9 }}>
          Discover the beauty and diversity of our sustainable farming operations
        </p>
        
        <div className="gallery-grid" style={{ gap: '1.5rem' }}>
          {/* Farm Landscape */}
          <div className="gallery-item float" style={{ position: 'relative' }}>
            <img src="/images/farm-2.jpg" alt="Beautiful Farm Landscape" />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              padding: '1rem 0.75rem 0.75rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              🌾 Farm Landscape
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Our beautiful 90-acre sustainable farm
              </div>
            </div>
          </div>

          {/* Pastoral Views */}
          <div className="gallery-item float" style={{ position: 'relative', animationDelay: '0.5s' }}>
            <img src="/images/farm-3.jpg" alt="Pastoral Farm Views" />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              padding: '1rem 0.75rem 0.75rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              🐄 Pastoral Views
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Cattle grazing in our lush pastures
              </div>
            </div>
          </div>

          {/* Farm Operations */}
          <div className="gallery-item float" style={{ position: 'relative', animationDelay: '1s' }}>
            <img src="/images/farm-4.jpg" alt="Farm Operations" />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              padding: '1rem 0.75rem 0.75rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              🚜 Farm Operations
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Modern farming with traditional values
              </div>
            </div>
          </div>

          {/* Hero Farm View */}
          <div className="gallery-item float" style={{ position: 'relative', animationDelay: '1.5s' }}>
            <img src="/images/hero-farm.jpg" alt="Hero Farm View" />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              padding: '1rem 0.75rem 0.75rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              🌅 Golden Hour
              <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                Sunrise over our tea plantation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Assets Gallery */}
      <div className="card">
        <h2 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', textAlign: 'center' }}>
          🚜 Farm Assets & Infrastructure
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Vehicles Showcase */}
          <div style={{ 
            background: 'var(--gradient-warm)', 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚜</div>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Farm Vehicles</h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>🚜 2 Tractors with Trailers</div>
              <div>🛻 2 Pickup Trucks</div>
              <div>🚛 2 Canter Lorries</div>
            </div>
          </div>

          {/* Crops Showcase */}
          <div style={{ 
            background: 'var(--gradient-primary)', 
            color: 'white', 
            padding: '1.5rem', 
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍃</div>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Crops & Land</h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>🍃 15 Acres Tea Plantation</div>
              <div>🌾 50 Acres Pasture Land</div>
              <div>🌿 25 Acres Grazing Fields</div>
            </div>
          </div>

          {/* Staff Showcase */}
          <div style={{ 
            background: 'var(--gradient-gold)', 
            color: 'var(--primary-green)', 
            padding: '1.5rem', 
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ marginBottom: '1rem' }}>Farm Team</h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>👷 8 Farm Workers</div>
              <div>🚗 3 Drivers</div>
              <div>🥛 4 Milkmen</div>
              <div>👨‍💼 2 Supervisors</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Uploaded Photos */}
      <div className="card">
        <h2 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
          📸 Your Farm Photos
        </h2>
        
        {photos.length === 0 && !error ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
            <h3 style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
              No personal photos yet
            </h3>
            <p style={{ color: 'var(--text-light)' }}>
              Upload your first farm photo using the form above to start building your personal gallery!
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo) => {
              // Use the path directly (for mock data it's already a full path, for uploaded files it's a data URL)
              const imageSrc = photo.path;
              
              return (
                <div 
                  key={photo.id} 
                  className="gallery-item"
                  onClick={() => setSelectedPhoto(photo)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={photo.thumbnail || imageSrc}
                    alt={photo.filename}
                    onError={(e) => {
                      // Try fallback path if available, otherwise use default fallback
                      const img = e.target;
                      if (!img.dataset.fallbackAttempted && photo.fallbackPath) {
                        img.dataset.fallbackAttempted = 'true';
                        img.src = photo.fallbackPath;
                      } else if (!img.dataset.finalFallback) {
                        img.dataset.finalFallback = 'true';
                        img.src = '/images/hero-farm.jpg';
                      }
                    }}
                    style={{
                      transition: 'opacity 0.3s ease',
                      opacity: photo.optimized ? 1 : 0.9
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    padding: '1rem 0.75rem 0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {photo.filename}
                    {photo.uploaded_at && (
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                        {new Date(photo.uploaded_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Photo Modal with Optimization Info */}
      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal" style={{ maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--primary-green)' }}>📸 {selectedPhoto.filename}</h3>
              <button 
                className="btn btn-outline btn-small"
                onClick={() => setSelectedPhoto(null)}
              >
                ❌ Close
              </button>
            </div>
            
            <img 
              src={selectedPhoto.path}
              alt={selectedPhoto.filename}
              style={{ 
                width: '100%', 
                maxHeight: '60vh', 
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
              onError={(e) => {
                // Implement fallback image handling
                const fallbackHandler = createImageWithFallback(selectedPhoto.path);
                fallbackHandler.onError(e.target);
              }}
            />
            
            {/* Photo Information */}
            <div style={{ 
              background: 'var(--soft-white)', 
              padding: '1rem', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong style={{ color: 'var(--primary-green)' }}>📋 File Information</strong>
                  <div style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                    <div>📁 Filename: {selectedPhoto.filename}</div>
                    <div>📦 Size: {((selectedPhoto.size || 0) / 1024 / 1024).toFixed(2)}MB</div>
                    {selectedPhoto.width && selectedPhoto.height && (
                      <div>📏 Dimensions: {selectedPhoto.width} × {selectedPhoto.height}px</div>
                    )}
                    {selectedPhoto.uploaded_at && (
                      <div>📅 Uploaded: {new Date(selectedPhoto.uploaded_at).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                
                {selectedPhoto.optimized && (
                  <div>
                    <strong style={{ color: 'var(--accent-gold)' }}>🔧 Optimization</strong>
                    <div style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                      <div>✅ Image was optimized</div>
                      {selectedPhoto.originalSize && (
                        <div>📉 Original: {((selectedPhoto.originalSize || 0) / 1024 / 1024).toFixed(2)}MB</div>
                      )}
                      {selectedPhoto.compressionRatio && (
                        <div>💾 Saved: {selectedPhoto.compressionRatio}%</div>
                      )}
                      {selectedPhoto.thumbnail && (
                        <div>🖼️ Thumbnail generated</div>
                      )}
                    </div>
                  </div>
                )}
                
                {!selectedPhoto.optimized && selectedPhoto.size > 1024 * 1024 && (
                  <div>
                    <strong style={{ color: 'var(--accent-gold)' }}>⚠️ Recommendation</strong>
                    <div style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                      <div>This image could benefit from optimization</div>
                      <div>Enable optimization for future uploads</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
