import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

// Genetic Profiles Tab Component
export function GeneticProfilesTab({ profiles, onUpdate, canEdit, canDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleAdd = (formData) => {
    const newProfile = {
      id: Math.max(...profiles.map(p => p.id), 0) + 1,
      ...formData,
      createdAt: new Date().toISOString()
    };
    onUpdate([...profiles, newProfile]);
    setShowModal(false);
  };

  const handleEdit = (profile) => {
    setEditingItem(profile);
    setShowModal(true);
  };

  const handleUpdate = (formData) => {
    const updated = profiles.map(profile =>
      profile.id === editingItem.id ? { ...profile, ...formData } : profile
    );
    onUpdate(updated);
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this genetic profile?')) {
      onUpdate(profiles.filter(profile => profile.id !== id));
    }
  };

  const viewLineage = (profile) => {
    setSelectedProfile(profile);
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Genetic Profiles</h2>
        {canEdit && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
          >
            ➕ Add Genetic Profile
          </button>
        )}
      </div>

      <div className="genetic-profiles-grid">
        {profiles.map(profile => (
          <div key={profile.id} className="genetic-profile-card">
            <div className="profile-header">
              <h3>{profile.animalName}</h3>
              <span className="animal-id">{profile.animalId}</span>
              <div className="breeding-value">
                BV: {profile.breedingValue}
              </div>
            </div>
            
            <div className="profile-content">
              <div className="breed-info">
                <strong>Breed:</strong> {profile.breed}
                <br />
                <strong>Bloodline:</strong> {profile.bloodline}
              </div>
              
              <div className="genetic-traits">
                <h4>Genetic Traits</h4>
                {Object.entries(profile.geneticTraits).map(([trait, value]) => (
                  <div key={trait} className="trait-item">
                    <span className="trait-name">{trait.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className={`trait-value trait-${value.toLowerCase()}`}>{value}</span>
                  </div>
                ))}
              </div>
              
              <div className="offspring-info">
                <strong>Offspring:</strong> {profile.offspring?.length || 0} recorded
              </div>
              
              <div className="certifications">
                {profile.certifications?.map(cert => (
                  <span key={cert} className="certification-badge">{cert}</span>
                ))}
              </div>
            </div>
            
            <div className="profile-actions">
              <button
                className="btn btn-small btn-outline"
                onClick={() => viewLineage(profile)}
              >
                🌳 View Lineage
              </button>
              {canEdit && (
                <button
                  className="btn btn-small btn-outline"
                  onClick={() => handleEdit(profile)}
                >
                  ✏️ Edit
                </button>
              )}
              {canDelete && (
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(profile.id)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <GeneticProfileModal
          profile={editingItem}
          onSave={editingItem ? handleUpdate : handleAdd}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}

      {selectedProfile && (
        <LineageModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

// Performance Analytics Tab Component
export function PerformanceAnalyticsTab({ records, profiles }) {
  const [selectedMetric, setSelectedMetric] = useState('success_rate');
  const [timeRange, setTimeRange] = useState('12months');

  const getAnalyticsData = () => {
    const now = new Date();
    const monthsBack = timeRange === '6months' ? 6 : timeRange === '12months' ? 12 : 24;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    
    const filteredRecords = records.filter(record => 
      new Date(record.breedingDate) >= startDate
    );

    // Success rate by month
    const monthlySuccess = {};
    filteredRecords.forEach(record => {
      const month = new Date(record.breedingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlySuccess[month]) {
        monthlySuccess[month] = { total: 0, successful: 0 };
      }
      monthlySuccess[month].total++;
      if (record.success === true) {
        monthlySuccess[month].successful++;
      }
    });

    const successRateData = Object.entries(monthlySuccess).map(([month, data]) => ({
      month,
      successRate: data.total > 0 ? ((data.successful / data.total) * 100).toFixed(1) : 0,
      total: data.total
    }));

    // Breeding performance by sire
    const sirePerformance = {};
    filteredRecords.forEach(record => {
      if (!sirePerformance[record.sireName]) {
        sirePerformance[record.sireName] = { total: 0, successful: 0 };
      }
      sirePerformance[record.sireName].total++;
      if (record.success === true) {
        sirePerformance[record.sireName].successful++;
      }
    });

    const sireData = Object.entries(sirePerformance).map(([sire, data]) => ({
      sire,
      successRate: data.total > 0 ? ((data.successful / data.total) * 100).toFixed(1) : 0,
      totalBreedings: data.total
    }));

    // Genetic trait analysis
    const traitAnalysis = profiles.reduce((acc, profile) => {
      Object.entries(profile.geneticTraits).forEach(([trait, value]) => {
        if (!acc[trait]) acc[trait] = {};
        if (!acc[trait][value]) acc[trait][value] = 0;
        acc[trait][value]++;
      });
      return acc;
    }, {});

    return {
      successRateData,
      sireData,
      traitAnalysis,
      totalRecords: filteredRecords.length,
      avgSuccessRate: filteredRecords.length > 0 ? 
        ((filteredRecords.filter(r => r.success === true).length / filteredRecords.length) * 100).toFixed(1) : 0
    };
  };

  const analytics = getAnalyticsData();

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Performance Analytics</h2>
        <div className="analytics-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="24months">Last 24 Months</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="filter-select"
          >
            <option value="success_rate">Success Rate</option>
            <option value="sire_performance">Sire Performance</option>
            <option value="genetic_traits">Genetic Traits</option>
          </select>
        </div>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Overall Performance</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Breedings:</span>
              <span className="stat-value">{analytics.totalRecords}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Success Rate:</span>
              <span className="stat-value">{analytics.avgSuccessRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {selectedMetric === 'success_rate' && (
        <div className="chart-container">
          <h3>Success Rate Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.successRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Success Rate']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedMetric === 'sire_performance' && (
        <div className="chart-container">
          <h3>Sire Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.sireData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sire" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'successRate' ? `${value}%` : value,
                  name === 'successRate' ? 'Success Rate' : 'Total Breedings'
                ]}
              />
              <Legend />
              <Bar dataKey="successRate" fill="#8884d8" name="Success Rate (%)" />
              <Bar dataKey="totalBreedings" fill="#82ca9d" name="Total Breedings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedMetric === 'genetic_traits' && (
        <div className="genetic-analysis">
          <h3>Genetic Trait Distribution</h3>
          <div className="traits-grid">
            {Object.entries(analytics.traitAnalysis).map(([trait, values]) => (
              <div key={trait} className="trait-analysis-card">
                <h4>{trait.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <div className="trait-distribution">
                  {Object.entries(values).map(([value, count]) => (
                    <div key={value} className="trait-bar">
                      <span className="trait-label">{value}</span>
                      <div className="trait-bar-container">
                        <div 
                          className="trait-bar-fill"
                          style={{ 
                            width: `${(count / Math.max(...Object.values(values))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="trait-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Modal Components
export function BreedingRecordModal({ record, onSave, onClose }) {
  const [formData, setFormData] = useState({
    sireId: record?.sireId || '',
    sireName: record?.sireName || '',
    damId: record?.damId || '',
    damName: record?.damName || '',
    breedingDate: record?.breedingDate || '',
    expectedDueDate: record?.expectedDueDate || '',
    actualBirthDate: record?.actualBirthDate || '',
    status: record?.status || 'scheduled',
    method: record?.method || 'natural',
    veterinarian: record?.veterinarian || '',
    notes: record?.notes || '',
    offspring: record?.offspring || '',
    success: record?.success || null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{record ? 'Edit Breeding Record' : 'Add Breeding Record'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Sire ID</label>
              <input
                type="text"
                name="sireId"
                value={formData.sireId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Sire Name</label>
              <input
                type="text"
                name="sireName"
                value={formData.sireName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Dam ID</label>
              <input
                type="text"
                name="damId"
                value={formData.damId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Dam Name</label>
              <input
                type="text"
                name="damName"
                value={formData.damName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Breeding Date</label>
              <input
                type="date"
                name="breedingDate"
                value={formData.breedingDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Expected Due Date</label>
              <input
                type="date"
                name="expectedDueDate"
                value={formData.expectedDueDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="bred">Bred</option>
                <option value="pregnant">Pregnant</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Method</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                required
              >
                <option value="natural">Natural Breeding</option>
                <option value="AI">Artificial Insemination</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Veterinarian</label>
              <input
                type="text"
                name="veterinarian"
                value={formData.veterinarian}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Actual Birth Date</label>
              <input
                type="date"
                name="actualBirthDate"
                value={formData.actualBirthDate}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Offspring ID</label>
              <input
                type="text"
                name="offspring"
                value={formData.offspring}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Success</label>
              <select
                name="success"
                value={formData.success === null ? '' : formData.success}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  success: e.target.value === '' ? null : e.target.value === 'true'
                }))}
              >
                <option value="">Not determined</option>
                <option value="true">Successful</option>
                <option value="false">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="btn-group">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {record ? 'Update' : 'Add'} Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BreedingScheduleModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    animalId: item?.animalId || '',
    animalName: item?.animalName || '',
    plannedDate: item?.plannedDate || '',
    sireId: item?.sireId || '',
    sireName: item?.sireName || '',
    method: item?.method || 'natural',
    status: item?.status || 'scheduled',
    notes: item?.notes || '',
    priority: item?.priority || 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{item ? 'Edit Scheduled Breeding' : 'Schedule New Breeding'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Animal ID</label>
              <input
                type="text"
                name="animalId"
                value={formData.animalId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Animal Name</label>
              <input
                type="text"
                name="animalName"
                value={formData.animalName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Planned Date</label>
              <input
                type="date"
                name="plannedDate"
                value={formData.plannedDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Sire ID</label>
              <input
                type="text"
                name="sireId"
                value={formData.sireId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Sire Name</label>
              <input
                type="text"
                name="sireName"
                value={formData.sireName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Method</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                required
              >
                <option value="natural">Natural Breeding</option>
                <option value="AI">Artificial Insemination</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="btn-group">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {item ? 'Update' : 'Schedule'} Breeding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GeneticProfileModal({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState({
    animalId: profile?.animalId || '',
    animalName: profile?.animalName || '',
    breed: profile?.breed || '',
    bloodline: profile?.bloodline || '',
    geneticTraits: profile?.geneticTraits || {
      milkProduction: 'Medium',
      meatQuality: 'Good',
      diseaseResistance: 'Medium',
      fertility: 'Good',
      temperament: 'Calm'
    },
    parentage: profile?.parentage || {
      sire: '',
      dam: ''
    },
    breedingValue: profile?.breedingValue || 50,
    certifications: profile?.certifications || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTraitChange = (trait, value) => {
    setFormData(prev => ({
      ...prev,
      geneticTraits: {
        ...prev.geneticTraits,
        [trait]: value
      }
    }));
  };

  const handleParentageChange = (parent, value) => {
    setFormData(prev => ({
      ...prev,
      parentage: {
        ...prev.parentage,
        [parent]: value
      }
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <h2>{profile ? 'Edit Genetic Profile' : 'Add Genetic Profile'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Animal ID</label>
              <input
                type="text"
                name="animalId"
                value={formData.animalId}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Animal Name</label>
              <input
                type="text"
                name="animalName"
                value={formData.animalName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Bloodline</label>
              <input
                type="text"
                name="bloodline"
                value={formData.bloodline}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>Breeding Value (0-100)</label>
              <input
                type="number"
                name="breedingValue"
                value={formData.breedingValue}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Genetic Traits</h3>
            <div className="traits-grid">
              {Object.entries(formData.geneticTraits).map(([trait, value]) => (
                <div key={trait} className="form-group">
                  <label>{trait.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <select
                    value={value}
                    onChange={(e) => handleTraitChange(trait, e.target.value)}
                  >
                    <option value="Poor">Poor</option>
                    <option value="Fair">Fair</option>
                    <option value="Good">Good</option>
                    <option value="High">High</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Parentage</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Sire</label>
                <input
                  type="text"
                  value={formData.parentage.sire}
                  onChange={(e) => handleParentageChange('sire', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Dam</label>
                <input
                  type="text"
                  value={formData.parentage.dam}
                  onChange={(e) => handleParentageChange('dam', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="btn-group">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {profile ? 'Update' : 'Add'} Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function LineageModal({ profile, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <h2>🌳 Genetic Lineage - {profile.animalName}</h2>
        
        <div className="lineage-tree">
          <div className="lineage-level">
            <div className="lineage-animal current">
              <h3>{profile.animalName}</h3>
              <p>{profile.animalId}</p>
              <p>BV: {profile.breedingValue}</p>
            </div>
          </div>
          
          <div className="lineage-level">
            <div className="lineage-animal parent">
              <h4>Sire</h4>
              <p>{profile.parentage?.sire || 'Unknown'}</p>
            </div>
            <div className="lineage-animal parent">
              <h4>Dam</h4>
              <p>{profile.parentage?.dam || 'Unknown'}</p>
            </div>
          </div>
          
          {profile.offspring && profile.offspring.length > 0 && (
            <div className="lineage-level">
              <h4>Offspring</h4>
              <div className="offspring-grid">
                {profile.offspring.map(offspring => (
                  <div key={offspring} className="lineage-animal offspring">
                    <p>{offspring}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="genetic-summary">
          <h3>Genetic Summary</h3>
          <div className="traits-summary">
            {Object.entries(profile.geneticTraits).map(([trait, value]) => (
              <div key={trait} className="trait-summary">
                <span className="trait-name">{trait.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className={`trait-value trait-${value.toLowerCase()}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="btn-group">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}