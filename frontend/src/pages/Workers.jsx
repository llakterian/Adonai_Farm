import React, { useEffect, useState } from 'react';
import { mockWorkers } from '../auth.js';
import { usePermissions, PermissionGate } from '../utils/permissions.jsx';
import SearchComponent from '../components/SearchComponent.jsx';

const roleEmojis = {
  'Farm Worker': '👷',
  'Milkman': '🥛',
  'Driver': '🚗',
  'Supervisor': '👨‍💼',
  'Manager': '👔',
  'Veterinarian': '👨‍⚕️'
};

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [form, setForm] = useState({ name: '', employee_id: '', role: 'Farm Worker', hourly_rate: 500, phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', employee_id: '', role: '', hourly_rate: 0, phone: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockingWorker, setClockingWorker] = useState(null);
  const [clockNotes, setClockNotes] = useState('');
  const [activeTab, setActiveTab] = useState('workers');
  const { canEdit, canDelete, isWorker, user } = usePermissions();

  useEffect(() => {
    loadWorkers();
    loadTimeEntries();
  }, []);

  useEffect(() => {
    // Update filtered workers when workers change
    setFilteredWorkers(workers);
  }, [workers]);

  const handleSearchResults = (results, query, filters) => {
    if (results === null) {
      // Clear search - show all workers
      setFilteredWorkers(workers);
    } else {
      // Show search results
      setFilteredWorkers(results);
    }
  };

  function loadWorkers() {
    setLoading(true);
    // Load from localStorage or use mock data
    const savedWorkers = localStorage.getItem('adonai_workers');
    if (savedWorkers) {
      setWorkers(JSON.parse(savedWorkers));
    } else {
      setWorkers([...mockWorkers]);
      localStorage.setItem('adonai_workers', JSON.stringify(mockWorkers));
    }
    setLoading(false);
  }

  function loadTimeEntries() {
    // Load time entries from localStorage
    const savedTimeEntries = localStorage.getItem('adonai_time_entries');
    if (savedTimeEntries) {
      const entries = JSON.parse(savedTimeEntries);
      // Filter for today's entries
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = entries.filter(entry => 
        entry.clock_in && entry.clock_in.startsWith(today)
      );
      setTimeEntries(todayEntries);
    } else {
      setTimeEntries([]);
    }
  }

  function addWorker(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.employee_id.trim()) return;
    
    const newWorker = {
      id: Math.max(...workers.map(w => w.id), 0) + 1,
      ...form
    };
    
    const updatedWorkers = [...workers, newWorker];
    setWorkers(updatedWorkers);
    localStorage.setItem('adonai_workers', JSON.stringify(updatedWorkers));
    setForm({ name: '', employee_id: '', role: 'Farm Worker', hourly_rate: 500, phone: '' });
  }

  function startEdit(worker) {
    setEditingId(worker.id);
    setEditForm({
      name: worker.name,
      employee_id: worker.employee_id,
      role: worker.role,
      hourly_rate: worker.hourly_rate,
      phone: worker.phone || ''
    });
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.employee_id.trim()) return;
    
    const updatedWorkers = workers.map(worker => 
      worker.id === editingId 
        ? { id: editingId, ...editForm }
        : worker
    );
    
    setWorkers(updatedWorkers);
    localStorage.setItem('adonai_workers', JSON.stringify(updatedWorkers));
    setEditingId(null);
    setEditForm({ name: '', employee_id: '', role: '', hourly_rate: 0, phone: '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: '', employee_id: '', role: '', hourly_rate: 0, phone: '' });
  }

  function deleteWorker(id) {
    const updatedWorkers = workers.filter(worker => worker.id !== id);
    setWorkers(updatedWorkers);
    localStorage.setItem('adonai_workers', JSON.stringify(updatedWorkers));
    setDeleteConfirm(null);
  }

  function clockIn(workerId) {
    const now = new Date().toISOString();
    const newEntry = {
      id: Date.now(),
      worker_id: workerId,
      clock_in: now,
      clock_out: null,
      notes: clockNotes,
      hours_worked: 0
    };
    
    const savedTimeEntries = localStorage.getItem('adonai_time_entries');
    const allEntries = savedTimeEntries ? JSON.parse(savedTimeEntries) : [];
    const updatedEntries = [...allEntries, newEntry];
    
    localStorage.setItem('adonai_time_entries', JSON.stringify(updatedEntries));
    setClockingWorker(null);
    setClockNotes('');
    loadTimeEntries();
  }

  function clockOut(workerId) {
    const now = new Date().toISOString();
    const savedTimeEntries = localStorage.getItem('adonai_time_entries');
    const allEntries = savedTimeEntries ? JSON.parse(savedTimeEntries) : [];
    
    const updatedEntries = allEntries.map(entry => {
      if (entry.worker_id === workerId && !entry.clock_out) {
        const clockInTime = new Date(entry.clock_in);
        const clockOutTime = new Date(now);
        const hoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);
        
        return {
          ...entry,
          clock_out: now,
          hours_worked: hoursWorked,
          notes: entry.notes + (clockNotes ? ` | ${clockNotes}` : '')
        };
      }
      return entry;
    });
    
    localStorage.setItem('adonai_time_entries', JSON.stringify(updatedEntries));
    setClockingWorker(null);
    setClockNotes('');
    loadTimeEntries();
  }

  const isWorkerClockedIn = (workerId) => {
    return timeEntries.some(entry => entry.worker_id === workerId && !entry.clock_out);
  };

  const getWorkerTodayEntry = (workerId) => {
    return timeEntries.find(entry => entry.worker_id === workerId);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title gradient-text">👷 Worker Management</h1>
      
      {/* Tab Navigation */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('workers')}
          >
            👷 Workers
          </button>
          <button 
            className={`btn ${activeTab === 'timetracking' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('timetracking')}
          >
            ⏰ Time Tracking
          </button>
        </div>
      </div>

      {activeTab === 'workers' && (
        <>
          {/* Advanced Search and Filtering */}
          <SearchComponent
            dataType="workers"
            onResults={handleSearchResults}
            placeholder="Search workers by name, role, employee ID, phone..."
            showFilters={true}
            showPresets={true}
            className="workers-search"
          />

          {/* Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{workers.length}</div>
              <div className="stat-label">Total Workers</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{timeEntries.filter(e => !e.clock_out).length}</div>
              <div className="stat-label">Currently Working</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{new Set(workers.map(w => w.role)).size}</div>
              <div className="stat-label">Job Roles</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">KSh {Math.round(workers.reduce((sum, w) => sum + w.hourly_rate, 0) / workers.length)}</div>
              <div className="stat-label">Avg. Hourly Rate</div>
            </div>
          </div>

          {/* Add New Worker Form - Only for Admin and Supervisor */}
          <PermissionGate 
            feature="workers" 
            fallback={
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--text-light)' }}>👁️ View Only Access</h3>
                <p style={{ color: 'var(--text-light)' }}>
                  You have read-only access to worker records. Contact an administrator to add or modify workers.
                </p>
              </div>
            }
          >
            {canEdit('workers') && (
              <div className="card">
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>➕ Add New Worker</h2>
                <form onSubmit={addWorker}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        placeholder="Enter worker's full name" 
                        value={form.name} 
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Employee ID</label>
                      <input 
                        placeholder="e.g., EMP009" 
                        value={form.employee_id} 
                        onChange={e => setForm({ ...form, employee_id: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option>Farm Worker</option>
                        <option>Milkman</option>
                        <option>Driver</option>
                        <option>Supervisor</option>
                        <option>Manager</option>
                        <option>Veterinarian</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hourly Rate (KSh)</label>
                      <input 
                        type="number" 
                        min="0" 
                        step="50"
                        value={form.hourly_rate} 
                        onChange={e => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel"
                        placeholder="+254712345678" 
                        value={form.phone} 
                        onChange={e => setForm({ ...form, phone: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="btn btn-primary">
                      ➕ Add Worker
                    </button>
                  </div>
                </form>
              </div>
            )}
          </PermissionGate>

          {/* Workers Grid */}
          <div className="animals-grid">
            {filteredWorkers.map(worker => (
              <div key={worker.id} className="animal-card">
                {editingId === worker.id ? (
                  <form onSubmit={saveEdit} className="edit-form">
                    <h3 style={{ marginBottom: '1rem', color: 'var(--primary-green)' }}>
                      ✏️ Edit {worker.name}
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
                        <label>Employee ID</label>
                        <input 
                          value={editForm.employee_id} 
                          onChange={e => setEditForm({ ...editForm, employee_id: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select 
                          value={editForm.role} 
                          onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          <option>Farm Worker</option>
                          <option>Milkman</option>
                          <option>Driver</option>
                          <option>Supervisor</option>
                          <option>Manager</option>
                          <option>Veterinarian</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Hourly Rate (KSh)</label>
                        <input 
                          type="number"
                          min="0"
                          step="50"
                          value={editForm.hourly_rate} 
                          onChange={e => setEditForm({ ...editForm, hourly_rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input 
                          type="tel"
                          value={editForm.phone} 
                          onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
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
                          {roleEmojis[worker.role] || '👷'} {worker.name}
                        </div>
                        <div className="animal-type">{worker.role}</div>
                      </div>
                      <div style={{ fontSize: '1.5rem' }}>
                        {isWorkerClockedIn(worker.id) ? '🟢' : '🔴'}
                      </div>
                    </div>
                    
                    <div className="animal-details">
                      <div className="animal-detail">
                        <strong>Employee ID:</strong>
                        <span>{worker.employee_id}</span>
                      </div>
                      <div className="animal-detail">
                        <strong>Hourly Rate:</strong>
                        <span>KSh {worker.hourly_rate}</span>
                      </div>
                      <div className="animal-detail">
                        <strong>Phone:</strong>
                        <span>{worker.phone || 'Not provided'}</span>
                      </div>
                      <div className="animal-detail">
                        <strong>Status:</strong>
                        <span style={{ color: isWorkerClockedIn(worker.id) ? 'var(--success-color)' : 'var(--error-color)' }}>
                          {isWorkerClockedIn(worker.id) ? 'Working' : 'Off Duty'}
                        </span>
                      </div>
                    </div>

                    <div className="animal-actions">
                      {canEdit('workers') && (
                        <button 
                          className="btn btn-outline btn-small" 
                          onClick={() => startEdit(worker)}
                        >
                          ✏️ Edit
                        </button>
                      )}
                      {canDelete('workers') && (
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => setDeleteConfirm(worker.id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                      {!canEdit('workers') && !canDelete('workers') && (
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
        </>
      )}

      {activeTab === 'timetracking' && (
        <>
          {/* Clock In/Out Section */}
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>⏰ Time Tracking</h2>
            <div className="animals-grid">
              {workers.map(worker => {
                const todayEntry = getWorkerTodayEntry(worker.id);
                const isClockedIn = isWorkerClockedIn(worker.id);
                
                return (
                  <div key={worker.id} className="animal-card">
                    <div className="animal-header">
                      <div>
                        <div className="animal-name">
                          {roleEmojis[worker.role] || '👷'} {worker.name}
                        </div>
                        <div className="animal-type">{worker.employee_id}</div>
                      </div>
                      <div style={{ fontSize: '2rem' }}>
                        {isClockedIn ? '🟢' : '🔴'}
                      </div>
                    </div>
                    
                    {todayEntry && (
                      <div className="animal-details">
                        <div className="animal-detail">
                          <strong>Clock In:</strong>
                          <span>{new Date(todayEntry.clock_in).toLocaleTimeString()}</span>
                        </div>
                        {todayEntry.clock_out && (
                          <>
                            <div className="animal-detail">
                              <strong>Clock Out:</strong>
                              <span>{new Date(todayEntry.clock_out).toLocaleTimeString()}</span>
                            </div>
                            <div className="animal-detail">
                              <strong>Hours Worked:</strong>
                              <span>{todayEntry.hours_worked?.toFixed(2) || 0}h</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="animal-actions">
                      {isClockedIn ? (
                        <button 
                          className="btn btn-danger btn-small"
                          onClick={() => setClockingWorker({ id: worker.id, action: 'out', name: worker.name })}
                        >
                          ⏰ Clock Out
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary btn-small"
                          onClick={() => setClockingWorker({ id: worker.id, action: 'in', name: worker.name })}
                        >
                          ⏰ Clock In
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {workers.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
            👷 No workers yet
          </h3>
          <p style={{ color: 'var(--text-light)' }}>
            Add your first worker using the form above to get started with worker management.
          </p>
        </div>
      )}

      {/* Clock In/Out Modal */}
      {clockingWorker && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⏰ {clockingWorker.action === 'in' ? 'Clock In' : 'Clock Out'}</h3>
            <p>
              {clockingWorker.action === 'in' ? 'Clock in' : 'Clock out'} {clockingWorker.name}?
            </p>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea 
                value={clockNotes}
                onChange={e => setClockNotes(e.target.value)}
                placeholder="Add any notes about this clock in/out..."
                rows="3"
              />
            </div>
            <div className="btn-group">
              <button 
                className={`btn ${clockingWorker.action === 'in' ? 'btn-primary' : 'btn-danger'}`}
                onClick={() => clockingWorker.action === 'in' ? clockIn(clockingWorker.id) : clockOut(clockingWorker.id)}
              >
                ⏰ {clockingWorker.action === 'in' ? 'Clock In' : 'Clock Out'}
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setClockingWorker(null);
                  setClockNotes('');
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🗑️ Confirm Delete</h3>
            <p>
              Are you sure you want to delete this worker? This action cannot be undone and will permanently remove all associated time tracking data.
            </p>
            <div className="btn-group">
              <button 
                className="btn btn-danger"
                onClick={() => deleteWorker(deleteConfirm)}
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