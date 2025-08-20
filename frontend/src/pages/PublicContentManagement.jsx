import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, mockAnimals } from '../auth.js';
import { realGalleryImages } from '../mockData.js';
import PublicContentService from '../services/PublicContentService.js';
import ContentManagementTest from '../components/ContentManagementTest.jsx';

export default function PublicContentManagement() {
  const [animals, setAnimals] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [publicSettings, setPublicSettings] = useState({});
  const [farmContent, setFarmContent] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('animals');
  const [saveStatus, setSaveStatus] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);

    try {
      // Load data using PublicContentService
      setAnimals(PublicContentService.getAllAnimals());
      setGalleryImages(PublicContentService.getAllGalleryImages());
      setPublicSettings(PublicContentService.getPublicSettings());
      setFarmContent(PublicContentService.getFarmContent());
      setInquiries(PublicContentService.getContactInquiries());

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const savePublicSettings = () => {
    try {
      // Validate settings before saving
      const errors = PublicContentService.validateSettings(publicSettings);
      setValidationErrors(errors);

      if (errors.length > 0) {
        setSaveStatus('error');
        return;
      }

      // Save settings using service
      PublicContentService.savePublicSettings(publicSettings);
      setSaveStatus('success');

      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const saveFarmContent = () => {
    try {
      PublicContentService.saveFarmContent(farmContent);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving farm content:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const toggleAnimalVisibility = (animalId) => {
    const animal = animals.find(a => a.id === animalId);
    const newVisibility = !animal.isPublicVisible;

    PublicContentService.updateAnimalVisibility(animalId, newVisibility);

    const updatedAnimals = animals.map(animal =>
      animal.id === animalId
        ? { ...animal, isPublicVisible: newVisibility }
        : animal
    );
    setAnimals(updatedAnimals);
  };

  const toggleImageVisibility = (imageId) => {
    const image = galleryImages.find(img => img.id === imageId);
    const newVisibility = !image.isPublic;

    PublicContentService.updateImageVisibility(imageId, newVisibility);

    const updatedImages = galleryImages.map(image =>
      image.id === imageId
        ? { ...image, isPublic: newVisibility }
        : image
    );
    setGalleryImages(updatedImages);
  };

  const toggleFeaturedAnimal = (animalId) => {
    const newFeaturedStatus = PublicContentService.toggleFeaturedAnimal(animalId);

    // Update local state
    const updatedSettings = PublicContentService.getPublicSettings();
    setPublicSettings(updatedSettings);
  };

  const handleAnimalTypeVisibility = (type, visible) => {
    const updatedTypes = visible
      ? [...publicSettings.visibleAnimalTypes, type]
      : publicSettings.visibleAnimalTypes.filter(t => t !== type);

    setPublicSettings({
      ...publicSettings,
      visibleAnimalTypes: updatedTypes
    });
  };

  const getPublicAnimals = () => {
    return animals.filter(animal =>
      animal.isPublicVisible !== false &&
      publicSettings.visibleAnimalTypes.includes(animal.type)
    );
  };

  const getPublicImages = () => {
    return galleryImages.filter(image => image.isPublic !== false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading public content settings...</p>
      </div>
    );
  }

  const publicAnimals = getPublicAnimals();
  const publicImages = getPublicImages();
  const animalTypes = [...new Set(animals.map(a => a.type))];

  return (
    <div className="public-content-management">
      <div className="page-header">
        <h1>Public Content Management</h1>
        <p>Control what content is visible on the public farm website</p>
        <div className="header-actions">
          <Link to="/" target="_blank" className="btn btn-outline">
            Preview Public Site
          </Link>
          <button onClick={savePublicSettings} className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{publicAnimals.length}</div>
          <div className="stat-label">Public Animals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{publicImages.length}</div>
          <div className="stat-label">Public Images</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{publicSettings.featuredAnimals.length}</div>
          <div className="stat-label">Featured Animals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{publicSettings.visibleAnimalTypes.length}</div>
          <div className="stat-label">Visible Types</div>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`alert ${saveStatus === 'success' ? 'alert-success' : 'alert-error'}`}>
          {saveStatus === 'success' ? '✅ Settings saved successfully!' : '❌ Error saving settings'}
          {validationErrors.length > 0 && (
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={activeTab === 'animals' ? 'active' : ''}
          onClick={() => setActiveTab('animals')}
        >
          🐄 Animal Visibility
        </button>
        <button
          className={activeTab === 'gallery' ? 'active' : ''}
          onClick={() => setActiveTab('gallery')}
        >
          📸 Gallery Images
        </button>
        <button
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          📝 Farm Content
        </button>
        <button
          className={activeTab === 'inquiries' ? 'active' : ''}
          onClick={() => setActiveTab('inquiries')}
        >
          📧 Inquiries ({inquiries.filter(i => !i.isRead).length})
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ General Settings
        </button>
        <button
          className={activeTab === 'test' ? 'active' : ''}
          onClick={() => setActiveTab('test')}
        >
          🧪 Integration Test
        </button>
      </div>

      {/* Animal Visibility Tab */}
      {activeTab === 'animals' && (
        <div className="tab-content">
          <div className="card">
            <h3>Animal Type Visibility</h3>
            <p>Control which animal types are shown on the public website</p>
            <div className="animal-types-grid">
              {animalTypes.map(type => (
                <div key={type} className="animal-type-card">
                  <div className="animal-type-info">
                    <span className="animal-emoji">
                      {type.includes('Cattle') ? '🐄' :
                        type.includes('Goat') ? '🐐' :
                          type.includes('Sheep') ? '🐑' : '🐔'}
                    </span>
                    <span className="animal-type-name">{type}</span>
                    <span className="animal-count">
                      ({animals.filter(a => a.type === type).length} animals)
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={publicSettings.visibleAnimalTypes.includes(type)}
                      onChange={(e) => handleAnimalTypeVisibility(type, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Individual Animal Visibility</h3>
            <p>Control which specific animals are visible on the public website</p>
            <div className="animals-grid">
              {animals.map(animal => (
                <div key={animal.id} className="animal-visibility-card">
                  <div className="animal-info">
                    <div className="animal-header">
                      <span className="animal-emoji">
                        {animal.type.includes('Cattle') ? '🐄' :
                          animal.type.includes('Goat') ? '🐐' :
                            animal.type.includes('Sheep') ? '🐑' : '🐔'}
                      </span>
                      <div>
                        <h4>{animal.name}</h4>
                        <p>{animal.type} • {animal.sex === 'M' ? 'Male' : 'Female'}</p>
                      </div>
                    </div>
                    <div className="animal-controls">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={animal.isPublicVisible !== false}
                          onChange={() => toggleAnimalVisibility(animal.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      <button
                        className={`btn btn-sm ${publicSettings.featuredAnimals.includes(animal.id) ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleFeaturedAnimal(animal.id)}
                        disabled={animal.isPublicVisible === false}
                      >
                        ⭐ {publicSettings.featuredAnimals.includes(animal.id) ? 'Featured' : 'Feature'}
                      </button>
                    </div>
                  </div>
                  {animal.notes && (
                    <p className="animal-notes">{animal.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Images Tab */}
      {activeTab === 'gallery' && (
        <div className="tab-content">
          <div className="card">
            <h3>Gallery Image Visibility</h3>
            <p>Control which images are shown in the public gallery</p>
            <div className="images-grid">
              {galleryImages.map(image => (
                <div key={image.id} className="image-visibility-card">
                  <div className="image-preview">
                    <img
                      src={image.fallbackPath || '/images/hero-farm.jpg'}
                      alt={image.caption || image.filename}
                      onError={(e) => {
                        e.target.src = '/images/hero-farm.jpg';
                      }}
                    />
                    <div className="image-overlay">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={image.isPublic !== false}
                          onChange={() => toggleImageVisibility(image.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  <div className="image-info">
                    <h4>{image.filename}</h4>
                    <p className="image-category">{image.category}</p>
                    {image.caption && <p className="image-caption">{image.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Farm Content Tab */}
      {activeTab === 'content' && (
        <div className="tab-content">
          <div className="card">
            <h3>Farm Information</h3>
            <p>Edit the basic information displayed on your public website</p>
            <div className="form-grid">
              <div className="form-group">
                <label>Farm Name</label>
                <input
                  type="text"
                  value={farmContent.name || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    name: e.target.value
                  })}
                  placeholder="Enter farm name"
                />
              </div>
              <div className="form-group">
                <label>Tagline</label>
                <input
                  type="text"
                  value={farmContent.tagline || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    tagline: e.target.value
                  })}
                  placeholder="Enter farm tagline"
                />
              </div>
              <div className="form-group full-width">
                <label>Mission Statement</label>
                <textarea
                  value={farmContent.mission || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    mission: e.target.value
                  })}
                  placeholder="Enter farm mission statement"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Established Year</label>
                <input
                  type="number"
                  value={farmContent.established || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    established: e.target.value
                  })}
                  placeholder="Year established"
                />
              </div>
            </div>

            <h4>Contact Information</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={farmContent.contact?.phone || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    contact: {
                      ...farmContent.contact,
                      phone: e.target.value
                    }
                  })}
                  placeholder="Phone number"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={farmContent.contact?.email || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    contact: {
                      ...farmContent.contact,
                      email: e.target.value
                    }
                  })}
                  placeholder="Email address"
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={farmContent.contact?.website || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    contact: {
                      ...farmContent.contact,
                      website: e.target.value
                    }
                  })}
                  placeholder="Website URL"
                />
              </div>
            </div>

            <h4>Location</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={farmContent.location?.address || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    location: {
                      ...farmContent.location,
                      address: e.target.value
                    }
                  })}
                  placeholder="Street address"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={farmContent.location?.city || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    location: {
                      ...farmContent.location,
                      city: e.target.value
                    }
                  })}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label>State/County</label>
                <input
                  type="text"
                  value={farmContent.location?.state || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    location: {
                      ...farmContent.location,
                      state: e.target.value
                    }
                  })}
                  placeholder="State or County"
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={farmContent.location?.country || ''}
                  onChange={(e) => setFarmContent({
                    ...farmContent,
                    location: {
                      ...farmContent.location,
                      country: e.target.value
                    }
                  })}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="btn-group">
              <button onClick={saveFarmContent} className="btn btn-primary">
                💾 Save Farm Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div className="tab-content">
          <div className="card">
            <h3>Contact Inquiries</h3>
            <p>Manage inquiries received through the public website contact forms</p>

            {inquiries.length === 0 ? (
              <div className="empty-state">
                <h4>No inquiries yet</h4>
                <p>When visitors submit contact forms, they will appear here.</p>
              </div>
            ) : (
              <div className="inquiries-list">
                {inquiries.map(inquiry => (
                  <div key={inquiry.id} className={`inquiry-card ${!inquiry.isRead ? 'unread' : ''}`}>
                    <div className="inquiry-header">
                      <div className="inquiry-info">
                        <h4>{inquiry.name}</h4>
                        <p className="inquiry-meta">
                          {inquiry.email} • {inquiry.phone} •
                          {new Date(inquiry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="inquiry-status">
                        <span className={`status-badge ${inquiry.status}`}>
                          {inquiry.status === 'new' ? '🆕 New' :
                            inquiry.status === 'responded' ? '✅ Responded' :
                              '📁 Closed'}
                        </span>
                      </div>
                    </div>

                    <div className="inquiry-content">
                      <div className="inquiry-subject">
                        <strong>Subject:</strong> {inquiry.subject}
                      </div>
                      <div className="inquiry-type">
                        <strong>Type:</strong> {inquiry.inquiryType || 'General'}
                      </div>
                      <div className="inquiry-message">
                        <strong>Message:</strong>
                        <p>{inquiry.message}</p>
                      </div>
                    </div>

                    <div className="inquiry-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          PublicContentService.updateInquiryStatus(inquiry.id, 'responded');
                          loadData();
                        }}
                        disabled={inquiry.status === 'responded'}
                      >
                        ✅ Mark Responded
                      </button>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          PublicContentService.updateInquiryStatus(inquiry.id, 'closed');
                          loadData();
                        }}
                        disabled={inquiry.status === 'closed'}
                      >
                        📁 Close
                      </button>
                      <a
                        href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}
                        className="btn btn-sm btn-primary"
                      >
                        📧 Reply
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'settings' && (
        <div className="tab-content">
          <div className="card">
            <h3>Public Website Settings</h3>
            <p>Configure general settings for the public farm website</p>

            <div className="settings-grid">
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={publicSettings.showFarmInfo}
                    onChange={(e) => setPublicSettings({
                      ...publicSettings,
                      showFarmInfo: e.target.checked
                    })}
                  />
                  Show Farm Information
                </label>
                <p className="setting-description">Display farm mission, history, and general information</p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={publicSettings.showContactInfo}
                    onChange={(e) => setPublicSettings({
                      ...publicSettings,
                      showContactInfo: e.target.checked
                    })}
                  />
                  Show Contact Information
                </label>
                <p className="setting-description">Display phone, email, and location details</p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={publicSettings.showServices}
                    onChange={(e) => setPublicSettings({
                      ...publicSettings,
                      showServices: e.target.checked
                    })}
                  />
                  Show Services Page
                </label>
                <p className="setting-description">Display available services and products</p>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={publicSettings.allowInquiries}
                    onChange={(e) => setPublicSettings({
                      ...publicSettings,
                      allowInquiries: e.target.checked
                    })}
                  />
                  Allow Contact Inquiries
                </label>
                <p className="setting-description">Enable contact forms and inquiry submissions</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Preview Public Website</h3>
            <p>Preview how your public website will look with current settings</p>
            <div className="preview-actions">
              <Link to="/" target="_blank" className="btn btn-primary">
                🌐 Open Public Website
              </Link>
              <Link to="/animals" target="_blank" className="btn btn-outline">
                🐄 Preview Animals Page
              </Link>
              <Link to="/gallery" target="_blank" className="btn btn-outline">
                📸 Preview Gallery
              </Link>
              <Link to="/contact" target="_blank" className="btn btn-outline">
                📧 Preview Contact Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Integration Test Tab */}
      {activeTab === 'test' && (
        <div className="tab-content">
          <ContentManagementTest />
        </div>
      )}
    </div>
  );
}