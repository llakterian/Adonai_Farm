import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { mockAnimals } from '../auth.js';
import { usePermissions, PermissionGate } from '../utils/permissions.jsx';
import SearchComponent from '../components/SearchComponent.jsx';
import AnimalShowcase from '../components/AnimalShowcase.jsx';
import SEOHead from '../components/SEOHead.jsx';

const animalEmojis = {
  'Dairy Cattle': '🐄',
  'Beef Cattle': '🐂',
  'Dairy Goat': '🐐',
  'Beef Goat': '🐐',
  'Sheep': '🐑',
  'Pedigree Sheep': '🐑',
  'Chicken': '🐔',
  'Poultry': '🐔'
};

export default function Animals() {
  const location = useLocation();
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [form, setForm] = useState({ type: 'Dairy Cattle', name: '', dob: '', sex: 'F', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ type: '', name: '', dob: '', sex: '', notes: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canEdit, canDelete, isWorker } = usePermissions();

  // Detect if this is a public route (not dashboard)
  const isPublicRoute = !location.pathname.startsWith('/dashboard');

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // Update filtered animals when animals change
    setFilteredAnimals(animals);
  }, [animals]);

  function load() {
    setLoading(true);
    // Load from localStorage or use mock data
    const savedAnimals = localStorage.getItem('adonai_animals');
    if (savedAnimals) {
      setAnimals(JSON.parse(savedAnimals));
    } else {
      setAnimals([...mockAnimals]);
      localStorage.setItem('adonai_animals', JSON.stringify(mockAnimals));
    }
    setLoading(false);
  }

  const handleSearchResults = (results, query, filters) => {
    if (results === null) {
      // Clear search - show all animals
      setFilteredAnimals(animals);
    } else {
      // Show search results
      setFilteredAnimals(results);
    }
  };

  function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    
    const newAnimal = {
      id: Math.max(...animals.map(a => a.id), 0) + 1,
      ...form
    };
    
    const updatedAnimals = [...animals, newAnimal];
    setAnimals(updatedAnimals);
    localStorage.setItem('adonai_animals', JSON.stringify(updatedAnimals));
    setForm({ type: 'Dairy Cattle', name: '', dob: '', sex: 'F', notes: '' });
  }

  function startEdit(animal) {
    setEditingId(animal.id);
    setEditForm({
      type: animal.type,
      name: animal.name,
      dob: animal.dob,
      sex: animal.sex,
      notes: animal.notes || ''
    });
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    
    const updatedAnimals = animals.map(animal => 
      animal.id === editingId 
        ? { id: editingId, ...editForm }
        : animal
    );
    
    setAnimals(updatedAnimals);
    localStorage.setItem('adonai_animals', JSON.stringify(updatedAnimals));
    setEditingId(null);
    setEditForm({ type: '', name: '', dob: '', sex: '', notes: '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ type: '', name: '', dob: '', sex: '', notes: '' });
  }

  function deleteAnimal(id) {
    const updatedAnimals = animals.filter(animal => animal.id !== id);
    setAnimals(updatedAnimals);
    localStorage.setItem('adonai_animals', JSON.stringify(updatedAnimals));
    setDeleteConfirm(null);
  }

  function exportCSV() {
    // Create CSV content from animals data
    const headers = ['ID', 'Type', 'Name', 'Date of Birth', 'Sex', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...animals.map(animal => [
        animal.id,
        `"${animal.type}"`,
        `"${animal.name}"`,
        animal.dob || '',
        animal.sex,
        `"${animal.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adonai-farm-animals-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  const getAnimalAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` ${months} month${months !== 1 ? 's' : ''}` : ''}`;
    }
  };

  // If this is a public route, show the public animal showcase
  if (isPublicRoute) {
    return (
      <>
        <SEOHead 
          pageType="animals"
          title="Meet Our Animals - Livestock at Adonai Farm"
          description="Meet the wonderful animals at Adonai Farm in Kericho, Kenya. Our diverse livestock includes dairy cattle, beef cattle, goats, sheep, and poultry - all raised with care and modern farming practices."
          keywords={[
            "Adonai Farm animals",
            "livestock Kericho Kenya",
            "farm animals Kenya",
            "dairy cattle Kericho",
            "beef cattle Kenya",
            "goats sheep poultry",
            "pasture raised animals",
            "sustainable livestock farming",
            "animal welfare Kenya",
            "farm animal tours Kericho"
          ]}
          image="/images/adonai1.jpg"
          url="/animals"
          breadcrumbs={[
            { name: "Home", url: "/" },
            { name: "Our Animals", url: "/animals" }
          ]}
          pageData={{
            animals: animals.map(animal => ({
              name: animal.name,
              type: animal.type,
              description: `A wonderful ${animal.type.toLowerCase()} at Adonai Farm`
            }))
          }}
        />
        <AnimalShowcase />
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
      <h1 className="page-title gradient-text">🐄 Livestock Management</h1>
      
      {/* Farm Animals Hero Section */}
      <div className="card" style={{ 
        background: 'var(--gradient-primary)',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>
          🌾 Our Diverse Animal Family
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
          Managing {animals.length} animals across multiple species with care and precision
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '2rem', 
          flexWrap: 'wrap'
        }}>
          <div className="float" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐄</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Dairy & Beef Cattle</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '0.5s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐑</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Sheep & Pedigree</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '1s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐐</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Dairy & Beef Goats</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '1.5s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐔</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Poultry & Chickens</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{animals.length}</div>
          <div className="stat-label">Total Animals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{animals.filter(a => a.sex === 'F').length}</div>
          <div className="stat-label">Female</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{animals.filter(a => a.sex === 'M').length}</div>
          <div className="stat-label">Male</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{new Set(animals.map(a => a.type)).size}</div>
          <div className="stat-label">Animal Types</div>
        </div>
      </div>

      {/* Advanced Search and Filtering */}
      <SearchComponent
        dataType="animals"
        onResults={handleSearchResults}
        placeholder="Search animals by name, species, breed, tag number..."
        showFilters={true}
        showPresets={true}
        className="animals-search"
      />

      {/* Add New Animal Form - Only for Admin and Supervisor */}
      <PermissionGate 
        feature="animals" 
        fallback={
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-light)' }}>👁️ View Only Access</h3>
            <p style={{ color: 'var(--text-light)' }}>
              You have read-only access to animal records. Contact an administrator to add or modify animals.
            </p>
          </div>
        }
      >
        {canEdit('animals') && (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>➕ Add New Animal</h2>
            <form onSubmit={add}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Animal Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option>Dairy Cattle</option>
                    <option>Beef Cattle</option>
                    <option>Dairy Goat</option>
                    <option>Beef Goat</option>
                    <option>Sheep</option>
                    <option>Pedigree Sheep</option>
                    <option>Chicken</option>
                    <option>Poultry</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    placeholder="Enter animal name" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    value={form.dob} 
                    onChange={e => setForm({ ...form, dob: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Sex</label>
                  <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}>
                    <option value="F">Female</option>
                    <option value="M">Male</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea 
                    value={form.notes} 
                    onChange={e => setForm({ ...form, notes: e.target.value })} 
                    placeholder="Additional notes about the animal..."
                    rows="3"
                  />
                </div>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">
                  ➕ Add Animal
                </button>
                <button type="button" className="btn btn-secondary" onClick={exportCSV}>
                  📊 Export CSV
                </button>
              </div>
            </form>
          </div>
        )}
      </PermissionGate>

      {/* Animals Grid */}
      <div className="animals-grid">
        {filteredAnimals.map(animal => (
          <div key={animal.id} className="animal-card">
            {editingId === animal.id ? (
              <form onSubmit={saveEdit} className="edit-form">
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>
                  ✏️ Edit {animal.name}
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      value={editForm.type} 
                      onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    >
                      <option>Dairy Cattle</option>
                      <option>Beef Cattle</option>
                      <option>Dairy Goat</option>
                      <option>Beef Goat</option>
                      <option>Sheep</option>
                      <option>Pedigree Sheep</option>
                      <option>Chicken</option>
                      <option>Poultry</option>
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
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input 
                      type="date" 
                      value={editForm.dob} 
                      onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Sex</label>
                    <select 
                      value={editForm.sex} 
                      onChange={e => setEditForm({ ...editForm, sex: e.target.value })}
                    >
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea 
                      value={editForm.notes} 
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
                      {animalEmojis[animal.type]} {animal.name}
                    </div>
                    <div className="animal-type">{animal.type}</div>
                  </div>
                  <div style={{ fontSize: '2rem' }}>
                    {animal.sex === 'F' ? '♀️' : '♂️'}
                  </div>
                </div>
                
                <div className="animal-details">
                  <div className="animal-detail">
                    <strong>Age:</strong>
                    <span>{getAnimalAge(animal.dob)}</span>
                  </div>
                  <div className="animal-detail">
                    <strong>Born:</strong>
                    <span>{animal.dob || 'Unknown'}</span>
                  </div>
                  <div className="animal-detail">
                    <strong>ID:</strong>
                    <span>#{animal.id}</span>
                  </div>
                </div>

                {animal.notes && (
                  <div className="animal-notes">
                    📝 {animal.notes}
                  </div>
                )}

                <div className="animal-actions">
                  {canEdit('animals') && (
                    <button 
                      className="btn btn-outline btn-small" 
                      onClick={() => startEdit(animal)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {canDelete('animals') && (
                    <button 
                      className="btn btn-danger btn-small"
                      onClick={() => setDeleteConfirm(animal.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                  {!canEdit('animals') && !canDelete('animals') && (
                    <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      👁️ View only
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {animals.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            🐄 No animals yet
          </h3>
          <p style={{ color: 'var(--text-light)' }}>
            Add your first animal using the form above to get started with livestock management.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🗑️ Confirm Delete</h3>
            <p>
              Are you sure you want to delete this animal? This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className="btn-group">
              <button 
                className="btn btn-danger"
                onClick={() => deleteAnimal(deleteConfirm)}
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
