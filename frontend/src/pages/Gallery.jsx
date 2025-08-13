import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      const res = await axios.get(api + '/api/gallery', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setPhotos(res.data);
      setError(null);
    } catch (e) {
      setError('Failed to load photos: ' + (e?.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    // Reset states
    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      
      const formData = new FormData();
      formData.append('photo', file);

      const res = await axios.post(api + '/api/gallery/upload', formData, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      setSuccess(`Photo "${res.data.filename}" uploaded successfully!`);
      loadPhotos(); // Reload photos to show the new one
      e.target.value = ''; // Clear file input
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError('Upload failed: ' + (e?.response?.data?.error || e.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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
      
      {/* Upload Form */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📤 Upload New Photo
        </h2>
        
        <div className="form-group">
          <label>Select Photo</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ 
              padding: '0.75rem',
              border: '2px dashed var(--light-green)',
              borderRadius: '8px',
              backgroundColor: 'var(--soft-white)',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          />
          <small style={{ color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
            Supported formats: JPG, PNG, GIF. Max size: 10MB
          </small>
        </div>
        
        {uploading && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', color: 'var(--primary-green)', fontWeight: '600' }}>
              📤 Uploading... {uploadProgress}%
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--cream)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: '100%',
                backgroundColor: 'var(--light-green)',
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
              const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
              const imageSrc = api + photo.path;
              
              return (
                <div 
                  key={photo.id} 
                  className="gallery-item"
                  onClick={() => setSelectedPhoto(photo)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={imageSrc}
                    alt={photo.filename}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
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

      {/* Photo Modal */}
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
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${selectedPhoto.path}`}
              alt={selectedPhoto.filename}
              style={{ 
                width: '100%', 
                maxHeight: '70vh', 
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            {selectedPhoto.uploaded_at && (
              <p style={{ marginTop: '1rem', color: 'var(--text-light)', textAlign: 'center' }}>
                Uploaded on {new Date(selectedPhoto.uploaded_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
