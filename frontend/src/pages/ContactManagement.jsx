import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../auth.js';

export default function ContactManagement() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      const token = localStorage.getItem('adonai_token');

      const response = await fetch(`${backendUrl}/api/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load contact inquiries');
      }

      const data = await response.json();
      setInquiries(data);
    } catch (err) {
      console.error('Error loading inquiries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      const token = localStorage.getItem('adonai_token');

      const response = await fetch(`${backendUrl}/api/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update inquiry status');
      }

      // Reload inquiries to get updated data
      await loadInquiries();

      // Close modal if it was open
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(null);
      }

    } catch (err) {
      console.error('Error updating inquiry status:', err);
      setError(err.message);
    }
  };

  const getFilteredInquiries = () => {
    if (filter === 'all') return inquiries;
    return inquiries.filter(inquiry => inquiry.status === filter);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'responded': return '#f39c12';
      case 'closed': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getInquiryTypeLabel = (type) => {
    switch (type) {
      case 'visit': return 'Farm Visit/Tour';
      case 'purchase': return 'Product Purchase';
      case 'breeding': return 'Breeding Services';
      case 'general': return 'General Questions';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="contact-management">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading contact inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contact-management">
        <div className="error-state">
          <h2>Error Loading Inquiries</h2>
          <p>{error}</p>
          <button onClick={loadInquiries} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredInquiries = getFilteredInquiries();
  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
    closed: inquiries.filter(i => i.status === 'closed').length
  };

  return (
    <div className="contact-management">
      <div className="contact-header">
        <h1>Contact Inquiries</h1>
        <p>Manage customer inquiries and communications</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Inquiries</div>
        </div>
        <div className="stat-card new">
          <div className="stat-number">{stats.new}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card responded">
          <div className="stat-number">{stats.responded}</div>
          <div className="stat-label">Responded</div>
        </div>
        <div className="stat-card closed">
          <div className="stat-number">{stats.closed}</div>
          <div className="stat-label">Closed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button
          className={filter === 'new' ? 'active' : ''}
          onClick={() => setFilter('new')}
        >
          New ({stats.new})
        </button>
        <button
          className={filter === 'responded' ? 'active' : ''}
          onClick={() => setFilter('responded')}
        >
          Responded ({stats.responded})
        </button>
        <button
          className={filter === 'closed' ? 'active' : ''}
          onClick={() => setFilter('closed')}
        >
          Closed ({stats.closed})
        </button>
      </div>

      {/* Inquiries List */}
      <div className="inquiries-list">
        {filteredInquiries.length === 0 ? (
          <div className="empty-state">
            <h3>No inquiries found</h3>
            <p>
              {filter === 'all'
                ? 'No contact inquiries have been submitted yet.'
                : `No ${filter} inquiries found.`
              }
            </p>
          </div>
        ) : (
          filteredInquiries.map(inquiry => (
            <div key={inquiry.id} className="inquiry-card">
              <div className="inquiry-header">
                <div className="inquiry-info">
                  <h3>{inquiry.name}</h3>
                  <p className="inquiry-email">{inquiry.email}</p>
                  {inquiry.phone && <p className="inquiry-phone">{inquiry.phone}</p>}
                </div>
                <div className="inquiry-meta">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(inquiry.status) }}
                  >
                    {inquiry.status}
                  </span>
                  <span className="inquiry-type">
                    {getInquiryTypeLabel(inquiry.inquiry_type)}
                  </span>
                  <span className="inquiry-date">
                    {formatDate(inquiry.created_at)}
                  </span>
                </div>
              </div>

              <div className="inquiry-content">
                <h4>{inquiry.subject}</h4>
                <p className="inquiry-message">
                  {inquiry.message.length > 150
                    ? `${inquiry.message.substring(0, 150)}...`
                    : inquiry.message
                  }
                </p>
              </div>

              <div className="inquiry-actions">
                <button
                  onClick={() => setSelectedInquiry(inquiry)}
                  className="btn btn-outline"
                >
                  View Details
                </button>
                {inquiry.status === 'new' && (
                  <button
                    onClick={() => updateInquiryStatus(inquiry.id, 'responded')}
                    className="btn btn-primary"
                  >
                    Mark as Responded
                  </button>
                )}
                {inquiry.status === 'responded' && (
                  <button
                    onClick={() => updateInquiryStatus(inquiry.id, 'closed')}
                    className="btn btn-success"
                  >
                    Close Inquiry
                  </button>
                )}
                {inquiry.status === 'closed' && (
                  <button
                    onClick={() => updateInquiryStatus(inquiry.id, 'new')}
                    className="btn btn-secondary"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Inquiry Details</h2>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="inquiry-details">
                <div className="detail-row">
                  <label>Name:</label>
                  <span>{selectedInquiry.name}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{selectedInquiry.email}</span>
                </div>
                {selectedInquiry.phone && (
                  <div className="detail-row">
                    <label>Phone:</label>
                    <span>{selectedInquiry.phone}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>Inquiry Type:</label>
                  <span>{getInquiryTypeLabel(selectedInquiry.inquiry_type)}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedInquiry.status) }}
                  >
                    {selectedInquiry.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Submitted:</label>
                  <span>{formatDate(selectedInquiry.created_at)}</span>
                </div>
                <div className="detail-row">
                  <label>Subject:</label>
                  <span>{selectedInquiry.subject}</span>
                </div>
                <div className="detail-row full-width">
                  <label>Message:</label>
                  <div className="message-content">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedInquiry.status === 'new' && (
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'responded')}
                  className="btn btn-primary"
                >
                  Mark as Responded
                </button>
              )}
              {selectedInquiry.status === 'responded' && (
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'closed')}
                  className="btn btn-success"
                >
                  Close Inquiry
                </button>
              )}
              {selectedInquiry.status === 'closed' && (
                <button
                  onClick={() => updateInquiryStatus(selectedInquiry.id, 'new')}
                  className="btn btn-secondary"
                >
                  Reopen
                </button>
              )}
              <button
                onClick={() => setSelectedInquiry(null)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}