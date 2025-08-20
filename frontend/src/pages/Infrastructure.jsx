import React, { useEffect, useState } from 'react';
import { withPermission, usePermissions } from '../utils/permissions.jsx';
import SearchComponent from '../components/SearchComponent.jsx';

const infrastructureEmojis = {
  'Tractor': '🚜',
  'Truck': '🚛',
  'Pickup': '🛻',
  'Equipment': '🔧',
  'Barn': '🏚️',
  'Storage': '🏭',
  'Office': '🏢',
  'Processing': '🏭',
  'Tools': '🔨',
  'Machinery': '⚙️',
  'Implements': '🛠️'
};

const mockInfrastructure = [
  // Vehicles
  { id: 1, category: 'vehicle', type: 'Tractor', name: 'John Deere 5075E', model: '5075E', year: 2020, purchase_cost: 45000, current_value: 38000, status: 'Active', usage_hours: 1250, fuel_consumption: 8.5, notes: 'Primary field tractor' },
  { id: 2, category: 'vehicle', type: 'Tractor', name: 'Massey Ferguson 4707', model: '4707', year: 2019, purchase_cost: 52000, current_value: 42000, status: 'Active', usage_hours: 1580, fuel_consumption: 9.2, notes: 'Heavy duty operations' },
  { id: 3, category: 'vehicle', type: 'Truck', name: 'Ford F-350', model: 'F-350 Super Duty', year: 2021, purchase_cost: 65000, current_value: 58000, status: 'Active', usage_hours: 850, fuel_consumption: 12.5, notes: 'Transport and delivery' },
  { id: 4, category: 'vehicle', type: 'Pickup', name: 'Toyota Hilux', model: 'Hilux Double Cab', year: 2022, purchase_cost: 35000, current_value: 32000, status: 'Active', usage_hours: 650, fuel_consumption: 10.2, notes: 'Daily farm operations' },

  // Buildings
  { id: 5, category: 'building', type: 'Barn', name: 'Main Livestock Barn', size_sqft: 2400, construction_date: '2018-03-15', capacity: 50, current_usage: 'Dairy cattle housing', notes: 'Climate controlled with automated feeding' },
  { id: 6, category: 'building', type: 'Storage', name: 'Feed Storage Facility', size_sqft: 1200, construction_date: '2019-08-20', capacity: 200, current_usage: 'Feed and grain storage', notes: 'Moisture controlled environment' },
  { id: 7, category: 'building', type: 'Office', name: 'Farm Administration Office', size_sqft: 800, construction_date: '2017-05-10', capacity: 8, current_usage: 'Administrative operations', notes: 'Includes meeting room and records storage' },

  // Equipment
  { id: 8, category: 'equipment', type: 'Machinery', name: 'Hay Baler', model: 'New Holland BR7070', year: 2020, status: 'Active', usage_hours: 320, notes: 'Round bale production' },
  { id: 9, category: 'equipment', type: 'Implements', name: 'Disc Harrow', model: 'Case IH True-Tandem 345', year: 2019, status: 'Active', usage_hours: 180, notes: 'Field preparation' },
  { id: 10, category: 'equipment', type: 'Tools', name: 'Welding Equipment', model: 'Lincoln Electric', year: 2021, status: 'Active', usage_hours: 0, notes: 'Maintenance and repairs' }
];

function Infrastructure() {
  const [infrastructure, setInfrastructure] = useState([]);
  const [filteredInfrastructure, setFilteredInfrastructure] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const { canEdit, canDelete, isAdmin } = usePermissions();
  const [form, setForm] = useState({
    category: 'vehicle',
    type: 'Tractor',
    name: '',
    model: '',
    year: new Date().getFullYear(),
    purchase_cost: 0,
    current_value: 0,
    status: 'Active',
    usage_hours: 0,
    fuel_consumption: 0,
    size_sqft: 0,
    construction_date: '',
    capacity: 0,
    current_usage: '',
    value: 0,
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfrastructure();
  }, []);

  useEffect(() => {
    // Update filtered infrastructure when infrastructure changes
    setFilteredInfrastructure(infrastructure);
  }, [infrastructure]);

  const handleSearchResults = (results, query, filters) => {
    if (results === null) {
      // Clear search - show all infrastructure
      setFilteredInfrastructure(infrastructure);
    } else {
      // Show search results
      setFilteredInfrastructure(results);
    }
  };

  function loadInfrastructure() {
    setLoading(true);
    const savedInfrastructure = localStorage.getItem('adonai_infrastructure');
    if (savedInfrastructure) {
      setInfrastructure(JSON.parse(savedInfrastructure));
    } else {
      setInfrastructure([...mockInfrastructure]);
      localStorage.setItem('adonai_infrastructure', JSON.stringify(mockInfrastructure));
    }
    setLoading(false);
  }

  function addInfrastructure(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newItem = {
      id: Math.max(...infrastructure.map(i => i.id), 0) + 1,
      ...form
    };

    const updatedInfrastructure = [...infrastructure, newItem];
    setInfrastructure(updatedInfrastructure);
    localStorage.setItem('adonai_infrastructure', JSON.stringify(updatedInfrastructure));

    // Reset form
    setForm({
      category: activeTab === 'vehicles' ? 'vehicle' : activeTab === 'buildings' ? 'building' : 'equipment',
      type: activeTab === 'vehicles' ? 'Tractor' : activeTab === 'buildings' ? 'Barn' : 'Tools',
      name: '',
      model: '',
      year: new Date().getFullYear(),
      purchase_cost: 0,
      current_value: 0,
      status: 'Active',
      usage_hours: 0,
      fuel_consumption: 0,
      size_sqft: 0,
      construction_date: '',
      capacity: 0,
      current_usage: '',
      value: 0,
      notes: ''
    });
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({ ...item });
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim()) return;

    const updatedInfrastructure = infrastructure.map(item =>
      item.id === editingId ? { ...editForm } : item
    );

    setInfrastructure(updatedInfrastructure);
    localStorage.setItem('adonai_infrastructure', JSON.stringify(updatedInfrastructure));
    setEditingId(null);
    setEditForm({});
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function deleteInfrastructure(id) {
    const updatedInfrastructure = infrastructure.filter(item => item.id !== id);
    setInfrastructure(updatedInfrastructure);
    localStorage.setItem('adonai_infrastructure', JSON.stringify(updatedInfrastructure));
    setDeleteConfirm(null);
  }

  function exportCSV() {
    const headers = ['ID', 'Category', 'Type', 'Name', 'Model', 'Year', 'Purchase Cost', 'Current Value', 'Status', 'Usage Hours', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...infrastructure.map(item => [
        item.id,
        item.category,
        `"${item.type}"`,
        `"${item.name}"`,
        `"${item.model || ''}"`,
        item.year || '',
        item.purchase_cost || item.value || 0,
        item.current_value || item.value || 0,
        item.status || 'Active',
        item.usage_hours || 0,
        `"${item.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adonai-farm-infrastructure-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  const getFilteredInfrastructure = () => {
    return infrastructure.filter(item => {
      if (activeTab === 'vehicles') return item.category === 'vehicle';
      if (activeTab === 'buildings') return item.category === 'building';
      if (activeTab === 'equipment') return item.category === 'equipment';
      return true;
    });
  };

  const filteredItems = getFilteredInfrastructure();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title gradient-text">🚜 Farm Infrastructure</h1>

      {/* Infrastructure Hero Section */}
      <div className="card" style={{
        background: 'var(--gradient-primary)',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>
          🏗️ Complete Farm Infrastructure Management
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
          Managing {infrastructure.length} assets across vehicles, buildings, and equipment
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div className="float" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚜</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Vehicles & Transport</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '0.5s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏚️</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Buildings & Facilities</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '1s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚙️</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Equipment & Tools</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            className={`btn ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('vehicles')}
          >
            🚜 Vehicles ({infrastructure.filter(i => i.category === 'vehicle').length})
          </button>
          <button
            className={`btn ${activeTab === 'buildings' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('buildings')}
          >
            🏚️ Buildings ({infrastructure.filter(i => i.category === 'building').length})
          </button>
          <button
            className={`btn ${activeTab === 'equipment' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('equipment')}
          >
            ⚙️ Equipment ({infrastructure.filter(i => i.category === 'equipment').length})
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{filteredItems.length}</div>
          <div className="stat-label">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredItems.filter(i => i.status === 'Active').length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">${Math.round(filteredItems.reduce((sum, i) => sum + (i.current_value || i.value || 0), 0)).toLocaleString()}</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Math.round(filteredItems.reduce((sum, i) => sum + (i.usage_hours || 0), 0))}</div>
          <div className="stat-label">Total Hours</div>
        </div>
      </div>

      {/* Advanced Search and Filtering */}
      <SearchComponent
        dataType="infrastructure"
        onResults={handleSearchResults}
        placeholder="Search infrastructure by name, type, model, category..."
        showFilters={true}
        showPresets={true}
        className="infrastructure-search"
      />

      {/* Add New Infrastructure Form */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          ➕ Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </h2>
        <form onSubmit={addInfrastructure}>
          <div className="form-grid">
            {/* Common Fields */}
            <div className="form-group">
              <label>Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
              >
                {activeTab === 'vehicles' && (
                  <>
                    <option>Tractor</option>
                    <option>Truck</option>
                    <option>Pickup</option>
                    <option>Equipment</option>
                  </>
                )}
                {activeTab === 'buildings' && (
                  <>
                    <option>Barn</option>
                    <option>Storage</option>
                    <option>Office</option>
                    <option>Processing</option>
                  </>
                )}
                {activeTab === 'equipment' && (
                  <>
                    <option>Tools</option>
                    <option>Machinery</option>
                    <option>Implements</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                placeholder="Enter name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {activeTab !== 'buildings' && (
              <div className="form-group">
                <label>Model</label>
                <input
                  placeholder="Enter model"
                  value={form.model}
                  onChange={e => setForm({ ...form, model: e.target.value })}
                />
              </div>
            )}

            {activeTab !== 'buildings' && (
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={e => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>
            )}

            {activeTab === 'buildings' && (
              <>
                <div className="form-group">
                  <label>Size (sq ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.size_sqft}
                    onChange={e => setForm({ ...form, size_sqft: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Construction Date</label>
                  <input
                    type="date"
                    value={form.construction_date}
                    onChange={e => setForm({ ...form, construction_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Current Usage</label>
                  <input
                    placeholder="What is this building used for?"
                    value={form.current_usage}
                    onChange={e => setForm({ ...form, current_usage: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>{activeTab === 'buildings' ? 'Value' : 'Purchase Cost'} ($)</label>
              <input
                type="number"
                min="0"
                value={activeTab === 'buildings' ? form.value : form.purchase_cost}
                onChange={e => setForm({
                  ...form,
                  [activeTab === 'buildings' ? 'value' : 'purchase_cost']: parseFloat(e.target.value) || 0
                })}
              />
            </div>

            {activeTab !== 'buildings' && (
              <div className="form-group">
                <label>Current Value ($)</label>
                <input
                  type="number"
                  min="0"
                  value={form.current_value}
                  onChange={e => setForm({ ...form, current_value: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}

            {activeTab !== 'buildings' && (
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Maintenance</option>
                  <option>Retired</option>
                </select>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <>
                <div className="form-group">
                  <label>Usage Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usage_hours}
                    onChange={e => setForm({ ...form, usage_hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Fuel Consumption (L/hr)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.fuel_consumption}
                    onChange={e => setForm({ ...form, fuel_consumption: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </>
            )}

            {activeTab === 'equipment' && (
              <div className="form-group">
                <label>Usage Hours</label>
                <input
                  type="number"
                  min="0"
                  value={form.usage_hours}
                  onChange={e => setForm({ ...form, usage_hours: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
                rows="3"
              />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">
              ➕ Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
            </button>
            <button type="button" className="btn btn-secondary" onClick={exportCSV}>
              📊 Export CSV
            </button>
          </div>
        </form>
      </div>

      {/* Infrastructure Grid */}
      <div className="animals-grid">
        {(filteredInfrastructure.length > 0 ? filteredInfrastructure : filteredItems).map(item => (
          <div key={item.id} className="animal-card">
            {editingId === item.id ? (
              <form onSubmit={saveEdit} className="edit-form">
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>
                  ✏️ Edit {item.name}
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={editForm.type}
                      onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    >
                      {item.category === 'vehicle' && (
                        <>
                          <option>Tractor</option>
                          <option>Truck</option>
                          <option>Pickup</option>
                          <option>Equipment</option>
                        </>
                      )}
                      {item.category === 'building' && (
                        <>
                          <option>Barn</option>
                          <option>Storage</option>
                          <option>Office</option>
                          <option>Processing</option>
                        </>
                      )}
                      {item.category === 'equipment' && (
                        <>
                          <option>Tools</option>
                          <option>Machinery</option>
                          <option>Implements</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Name</label>
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>

                  {item.category !== 'building' && (
                    <div className="form-group">
                      <label>Model</label>
                      <input
                        value={editForm.model || ''}
                        onChange={e => setEditForm({ ...editForm, model: e.target.value })}
                      />
                    </div>
                  )}

                  {item.category !== 'building' && (
                    <div className="form-group">
                      <label>Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={editForm.year || new Date().getFullYear()}
                        onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                      />
                    </div>
                  )}

                  {item.category === 'building' && (
                    <>
                      <div className="form-group">
                        <label>Size (sq ft)</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.size_sqft || 0}
                          onChange={e => setEditForm({ ...editForm, size_sqft: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Construction Date</label>
                        <input
                          type="date"
                          value={editForm.construction_date || ''}
                          onChange={e => setEditForm({ ...editForm, construction_date: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.capacity || 0}
                          onChange={e => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Current Usage</label>
                        <input
                          value={editForm.current_usage || ''}
                          onChange={e => setEditForm({ ...editForm, current_usage: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label>{item.category === 'building' ? 'Value' : 'Purchase Cost'} ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.category === 'building' ? (editForm.value || 0) : (editForm.purchase_cost || 0)}
                      onChange={e => setEditForm({
                        ...editForm,
                        [item.category === 'building' ? 'value' : 'purchase_cost']: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>

                  {item.category !== 'building' && (
                    <div className="form-group">
                      <label>Current Value ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.current_value || 0}
                        onChange={e => setEditForm({ ...editForm, current_value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  {item.category !== 'building' && (
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={editForm.status || 'Active'}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option>Active</option>
                        <option>Maintenance</option>
                        <option>Retired</option>
                      </select>
                    </div>
                  )}

                  {item.category === 'vehicle' && (
                    <>
                      <div className="form-group">
                        <label>Usage Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.usage_hours || 0}
                          onChange={e => setEditForm({ ...editForm, usage_hours: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fuel Consumption (L/hr)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={editForm.fuel_consumption || 0}
                          onChange={e => setEditForm({ ...editForm, fuel_consumption: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </>
                  )}

                  {item.category === 'equipment' && (
                    <div className="form-group">
                      <label>Usage Hours</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.usage_hours || 0}
                        onChange={e => setEditForm({ ...editForm, usage_hours: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={editForm.notes || ''}
                      onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      rows="3"
                    />
                  </div>
                </div>
                <div className="btn-group">
                  <button type="submit" className="btn btn-primary btn-small">
                    💾 Save Changes
                  </button>
                  <button type="button" className="btn btn-outline btn-small" onClick={cancelEdit}>
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="animal-header">
                  <div>
                    <div className="animal-name">
                      {infrastructureEmojis[item.type] || '🔧'} {item.name}
                    </div>
                    <div className="animal-type">{item.type} • {item.model}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>
                    {item.status === 'Active' ? '🟢' : item.status === 'Maintenance' ? '🟡' : '🔴'}
                  </div>
                </div>

                <div className="animal-details">
                  <div className="animal-detail">
                    <strong>Status:</strong>
                    <span>{item.status}</span>
                  </div>
                  <div className="animal-detail">
                    <strong>Value:</strong>
                    <span>${(item.current_value || item.value || 0).toLocaleString()}</span>
                  </div>
                  {item.usage_hours !== undefined && (
                    <div className="animal-detail">
                      <strong>Usage:</strong>
                      <span>{item.usage_hours} hours</span>
                    </div>
                  )}
                  {item.year && (
                    <div className="animal-detail">
                      <strong>Year:</strong>
                      <span>{item.year}</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div className="animal-notes">
                    📝 {item.notes}
                  </div>
                )}

                <div className="animal-actions">
                  <button
                    className="btn btn-outline btn-small"
                    onClick={() => startEdit(item)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => setDeleteConfirm(item.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            {activeTab === 'vehicles' ? '🚜' : activeTab === 'buildings' ? '🏚️' : '⚙️'} No {activeTab} yet
          </h3>
          <p style={{ color: 'var(--text-light)' }}>
            Add your first {activeTab.slice(0, -1)} to start tracking your farm infrastructure.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🗑️ Confirm Delete</h3>
            <p>
              Are you sure you want to delete this infrastructure item? This action cannot be undone.
            </p>
            <div className="btn-group">
              <button
                className="btn btn-danger"
                onClick={() => deleteInfrastructure(deleteConfirm)}
              >
                🗑️ Delete Permanently
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setDeleteConfirm(null)}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Protect the Infrastructure component - only admins can access
export default withPermission(Infrastructure, 'infrastructure');