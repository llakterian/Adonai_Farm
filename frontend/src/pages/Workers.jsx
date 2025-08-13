import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [timeEntries, setTimeEntries] = useState([]);
  const [form, setForm] = useState({ name: '', employee_id: '', role: 'Farm Worker', hourly_rate: 500, phone: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', employee_id: '', role: '', hourly_rate: 0, phone: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockingWorker, setClockingWorker] = useState(null);
  const [clockNotes, setClockNotes] = useState('');
  const [activeTab, setActiveTab] = useState('workers');

  useEffect(() => {
    loadWorkers();
    loadTimeEntries();
  }, []);

  async function loadWorkers() {
    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      const res = await axios.get(api + '/api/workers', { 
        headers: { Authorization: 'Bearer ' + token } 
      });
      setWorkers(res.data);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeEntries() {
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      const today = new Date().toISOString().split('T')[0];
      const res = await axios.get(api + '/api/time-entries?date_from=' + today, { 
        headers: { Authorization: 'Bearer ' + token } 
      });
      setTimeEntries(res.data);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  }

  async function addWorker(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.employee_id.trim()) return;
    
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      await axios.post(api + '/api/workers', form, { 
        headers: { Authorization: 'Bearer ' + token } 
      });
      setForm({ name: '', employee_id: '', role: 'Farm Worker', hourly_rate: 500, phone: '' });
      loadWorkers();
    } catch (error) {
      console.error('Error adding worker:', error);
      alert(error.response?.data?.error || 'Failed to add worker');
    }
  }

  async function startEdit(worker) {
    setEditingId(worker.id);
    setEditForm({
      name: worker.name,
      employee_id: worker.employee_id,
      role: worker.role,
      hourly_rate: worker.hourly_rate,
      phone: worker.phone || ''
    });
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.employee_id.trim()) return;
    
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      await axios.put(api + '/api/workers/' + editingId, editForm, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setEditingId(null);
      setEditForm({ name: '', employee_id: '', role: '', hourly_rate: 0, phone: '' });
      loadWorkers();
    } catch (error) {
      console.error('Error updating worker:', error);
      alert(error.response?.data?.error || 'Failed to update worker');
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: '', employee_id: '', role: '', hourly_rate: 0, phone: '' });
  }

  async function deleteWorker(id) {
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      await axios.delete(api + '/api/workers/' + id, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setDeleteConfirm(null);
      loadWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
    }
  }

  async function clockIn(workerId) {
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      await axios.post(api + '/api/time-entries/clock-in', {
        worker_id: workerId,
        notes: clockNotes
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setClockingWorker(null);
      setClockNotes('');
      loadTimeEntries();
    } catch (error) {
      console.error('Error clocking in:', error);
      alert(error.response?.data?.error || 'Failed to clock in');
    }
  }

  async function clockOut(workerId) {
    try {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      await axios.post(api + '/api/time-entries/clock-out', {
        worker_id: workerId,
        notes: clockNotes
      }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setClockingWorker(null);
      setClockNotes('');
      loadTimeEntries();
    } catch (error) {
      console.error('Error clocking out:', error);
      alert(error.response?.data?.error || 'Failed to clock out');
    }
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

          {/* Add New Worker Form */}
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

          {/* Workers Grid */}
          <div className="animals-grid">
            {workers.map(worker => (
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
                      <button 
                        className="btn btn-outline btn-small" 
                        onClick={() => startEdit(worker)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => setDeleteConfirm(worker.id)}
                      >
                        🗑️ Delete
                      </button>
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