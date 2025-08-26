import React, { useEffect, useState } from 'react';
import { usePermissions, PermissionGate } from '../utils/permissions.jsx';
import SearchComponent from '../components/SearchComponent.jsx';

const inventoryEmojis = {
  'Feed': '🌾',
  'Medication': '💊',
  'Equipment': '🔧',
  'Supplies': '📦',
  'Seeds': '🌱',
  'Fertilizer': '🧪'
};

const mockInventory = [
  { id: 1, name: 'Cattle Feed - Premium', category: 'Feed', quantity: 500, unit: 'kg', cost_per_unit: 45, supplier: 'AgriSupply Co', expiry_date: '2024-12-15', location: 'Feed Store A', notes: 'High protein feed for dairy cattle' },
  { id: 2, name: 'Antibiotics - Penicillin', category: 'Medication', quantity: 20, unit: 'vials', cost_per_unit: 25, supplier: 'VetMed Ltd', expiry_date: '2024-10-30', location: 'Medicine Cabinet', notes: 'For bacterial infections' },
  { id: 3, name: 'Hay Bales', category: 'Feed', quantity: 150, unit: 'bales', cost_per_unit: 12, supplier: 'Local Farm', expiry_date: '2024-08-30', location: 'Hay Storage', notes: 'Premium quality hay' },
  { id: 4, name: 'Milking Equipment Cleaner', category: 'Supplies', quantity: 10, unit: 'bottles', cost_per_unit: 18, supplier: 'DairyClean Inc', expiry_date: '2025-06-15', location: 'Milking Parlor', notes: 'Food-safe sanitizer' }
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: 'Feed',
    quantity: 0,
    unit: 'kg',
    cost_per_unit: 0,
    supplier: '',
    expiry_date: '',
    location: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const { canEdit, canDelete } = usePermissions();

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    setFilteredInventory(inventory);
  }, [inventory]);

  function loadInventory() {
    setLoading(true);
    const savedInventory = localStorage.getItem('adonai_inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      setInventory([...mockInventory]);
      localStorage.setItem('adonai_inventory', JSON.stringify(mockInventory));
    }
    setLoading(false);
  }

  const handleSearchResults = (results, query, filters) => {
    if (results === null) {
      setFilteredInventory(inventory);
    } else {
      setFilteredInventory(results);
    }
  };

  function addInventoryItem(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const newItem = {
      id: Math.max(...inventory.map(i => i.id), 0) + 1,
      ...form,
      total_value: form.quantity * form.cost_per_unit
    };

    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    localStorage.setItem('adonai_inventory', JSON.stringify(updatedInventory));

    setForm({
      name: '',
      category: 'Feed',
      quantity: 0,
      unit: 'kg',
      cost_per_unit: 0,
      supplier: '',
      expiry_date: '',
      location: '',
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

    const updatedInventory = inventory.map(item =>
      item.id === editingId ? { ...editForm, total_value: editForm.quantity * editForm.cost_per_unit } : item
    );

    setInventory(updatedInventory);
    localStorage.setItem('adonai_inventory', JSON.stringify(updatedInventory));
    setEditingId(null);
    setEditForm({});
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function deleteItem(id) {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    localStorage.setItem('adonai_inventory', JSON.stringify(updatedInventory));
    setDeleteConfirm(null);
  }

  const getExpiringItems = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return inventory.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= thirtyDaysFromNow;
    });
  };

  const getLowStockItems = () => {
    return inventory.filter(item => {
      const minStock = item.category === 'Medication' ? 5 :
        item.category === 'Feed' ? 100 : 10;
      return item.quantity <= minStock;
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const expiringItems = getExpiringItems();
  const lowStockItems = getLowStockItems();
  const totalValue = inventory.reduce((sum, item) => sum + (item.total_value || item.quantity * item.cost_per_unit), 0);

  return (
    <div>
      <h1 className="page-title gradient-text">📦 Inventory Management</h1>

      {/* Inventory Hero Section */}
      <div className="card" style={{
        background: 'var(--gradient-primary)',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>
          🏪 Farm Inventory & Supplies
        </h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
          Managing {inventory.length} items worth Ksh {totalValue.toLocaleString()}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap'
        }}>
          <div className="float" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌾</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Feed & Nutrition</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '0.5s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💊</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Medications</div>
          </div>
          <div className="float" style={{ textAlign: 'center', animationDelay: '1s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📦</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Supplies</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(expiringItems.length > 0 || lowStockItems.length > 0) && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>⚠️ Inventory Alerts</h3>
          {expiringItems.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Expiring Soon ({expiringItems.length} items):</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {expiringItems.slice(0, 3).map(item => (
                  <li key={item.id}>{item.name} - expires {item.expiry_date}</li>
                ))}
              </ul>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div>
              <strong>Low Stock ({lowStockItems.length} items):</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {lowStockItems.slice(0, 3).map(item => (
                  <li key={item.id}>{item.name} - only {item.quantity} {item.unit} left</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{inventory.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Ksh {totalValue.toLocaleString()}</div>
          <div className="stat-label">Total Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{expiringItems.length}</div>
          <div className="stat-label">Expiring Soon</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{lowStockItems.length}</div>
          <div className="stat-label">Low Stock</div>
        </div>
      </div>

      {/* Search Component */}
      <SearchComponent
        dataType="inventory"
        onResults={handleSearchResults}
        placeholder="Search inventory by name, category, supplier..."
        showFilters={true}
        showPresets={true}
        className="inventory-search"
      />

      {/* Add New Item Form */}
      <PermissionGate feature="inventory">
        {canEdit('inventory') && (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>➕ Add New Inventory Item</h2>
            <form onSubmit={addInventoryItem}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name</label>
                  <input
                    placeholder="Enter item name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Feed</option>
                    <option>Medication</option>
                    <option>Equipment</option>
                    <option>Supplies</option>
                    <option>Seeds</option>
                    <option>Fertilizer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option>kg</option>
                    <option>lbs</option>
                    <option>bags</option>
                    <option>bales</option>
                    <option>bottles</option>
                    <option>vials</option>
                    <option>pieces</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost per Unit (Ksh)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_per_unit}
                    onChange={e => setForm({ ...form, cost_per_unit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    placeholder="Supplier name"
                    value={form.supplier}
                    onChange={e => setForm({ ...form, supplier: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    placeholder="Storage location"
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                </div>
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
                  ➕ Add Item
                </button>
              </div>
            </form>
          </div>
        )}
      </PermissionGate>

      {/* Inventory Grid */}
      <div className="animals-grid">
        {filteredInventory.map(item => (
          <div key={item.id} className="animal-card">
            {editingId === item.id ? (
              <form onSubmit={saveEdit} className="edit-form">
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>
                  ✏️ Edit {item.name}
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option>Feed</option>
                      <option>Medication</option>
                      <option>Equipment</option>
                      <option>Supplies</option>
                      <option>Seeds</option>
                      <option>Fertilizer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.quantity}
                      onChange={e => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cost per Unit</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.cost_per_unit}
                      onChange={e => setEditForm({ ...editForm, cost_per_unit: parseFloat(e.target.value) || 0 })}
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
                      {inventoryEmojis[item.category] || '📦'} {item.name}
                    </div>
                    <div className="animal-type">{item.category}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>
                    {item.quantity <= (item.category === 'Medication' ? 5 : 10) ? '🔴' : '🟢'}
                  </div>
                </div>

                <div className="animal-details">
                  <div className="animal-detail">
                    <strong>Quantity:</strong>
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                  <div className="animal-detail">
                    <strong>Unit Cost:</strong>
                    <span>Ksh {item.cost_per_unit}</span>
                  </div>
                  <div className="animal-detail">
                    <strong>Total Value:</strong>
                    <span>Ksh {(item.quantity * item.cost_per_unit).toLocaleString()}</span>
                  </div>
                  <div className="animal-detail">
                    <strong>Supplier:</strong>
                    <span>{item.supplier}</span>
                  </div>
                  {item.expiry_date && (
                    <div className="animal-detail">
                      <strong>Expires:</strong>
                      <span>{item.expiry_date}</span>
                    </div>
                  )}
                  <div className="animal-detail">
                    <strong>Location:</strong>
                    <span>{item.location}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="animal-notes">
                    📝 {item.notes}
                  </div>
                )}

                <div className="animal-actions">
                  {canEdit('inventory') && (
                    <button
                      className="btn btn-outline btn-small"
                      onClick={() => startEdit(item)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {canDelete('inventory') && (
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => setDeleteConfirm(item.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🗑️ Confirm Delete</h3>
            <p>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </p>
            <div className="btn-group">
              <button
                className="btn btn-danger"
                onClick={() => deleteItem(deleteConfirm)}
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