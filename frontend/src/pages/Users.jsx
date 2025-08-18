import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, USER_ROLES } from '../auth.js';
import { withPermission, usePermissions, getRoleDisplayName } from '../utils/permissions.jsx';

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: USER_ROLES.WORKER
  });
  const [message, setMessage] = useState(null);
  const { canDelete } = usePermissions();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = updateUser(editingUser.id, formData);
        if (updatedUser) {
          setMessage({ type: 'success', text: 'User updated successfully!' });
          loadUsers();
          resetForm();
        } else {
          setMessage({ type: 'error', text: 'Failed to update user.' });
        }
      } else {
        // Create new user
        const existingUser = users.find(u => u.username === formData.username);
        if (existingUser) {
          setMessage({ type: 'error', text: 'Username already exists!' });
          return;
        }
        
        const newUser = createUser(formData);
        setMessage({ type: 'success', text: 'User created successfully!' });
        loadUsers();
        resetForm();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving the user.' });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password for security
      name: user.name,
      email: user.email,
      role: user.role
    });
    setShowForm(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      setMessage({ type: 'success', text: 'User deleted successfully!' });
      loadUsers();
    }
  };

  const handleToggleActive = (user) => {
    const updatedUser = updateUser(user.id, { active: !user.active });
    if (updatedUser) {
      setMessage({ 
        type: 'success', 
        text: `User ${user.active ? 'deactivated' : 'activated'} successfully!` 
      });
      loadUsers();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: USER_ROLES.WORKER
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage farm system users and their access permissions</p>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Cancel' : '➕ Add New User'}
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2>{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>👤 Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={editingUser} // Don't allow username changes
                  placeholder="Enter username"
                />
              </div>
              <div className="form-group">
                <label>🔒 Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>📝 Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>📧 Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="form-group">
              <label>🎭 Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value={USER_ROLES.WORKER}>Worker - Limited access (time tracking, view animals)</option>
                <option value={USER_ROLES.SUPERVISOR}>Supervisor - Operational access (manage animals, workers, reports)</option>
                <option value={USER_ROLES.ADMIN}>Administrator - Full access (all features including user management)</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingUser ? '💾 Update User' : '➕ Create User'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>👥 All Users ({users.length})</h2>
        
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>👤 User</th>
                  <th>📧 Email</th>
                  <th>🎭 Role</th>
                  <th>📅 Created</th>
                  <th>🔄 Status</th>
                  <th>⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={!user.active ? 'inactive-row' : ''}>
                    <td>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <br />
                        <small>@{user.username}</small>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td>{user.created_at}</td>
                    <td>
                      <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-small btn-secondary"
                          onClick={() => handleEdit(user)}
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          className={`btn btn-small ${user.active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleActive(user)}
                          title={user.active ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.active ? '⏸️' : '▶️'}
                        </button>
                        {canDelete('users') && (
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDelete(user.id)}
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Protect the Users component - only admins can access
export default withPermission(Users, 'users');