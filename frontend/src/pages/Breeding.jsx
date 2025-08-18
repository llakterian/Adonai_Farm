import React, { useState, useEffect } from 'react';
import { usePermissions } from '../utils/permissions.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { 
  GeneticProfilesTab, 
  PerformanceAnalyticsTab, 
  BreedingRecordModal, 
  BreedingScheduleModal
} from '../components/BreedingComponents.jsx';

export default function Breeding() {
  const [breedingRecords, setBreedingRecords] = useState([]);
  const [breedingSchedule, setBreedingSchedule] = useState([]);
  const [geneticProfiles, setGeneticProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { canEdit, canDelete, isAdmin, isSupervisor } = usePermissions();

  useEffect(() => {
    loadBreedingData();
  }, []);

  const loadBreedingData = () => {
    // Load breeding records
    const savedRecords = localStorage.getItem('adonai_breeding_records');
    if (savedRecords) {
      setBreedingRecords(JSON.parse(savedRecords));
    } else {
      initializeBreedingData();
    }

    // Load breeding schedule
    const savedSchedule = localStorage.getItem('adonai_breeding_schedule');
    if (savedSchedule) {
      setBreedingSchedule(JSON.parse(savedSchedule));
    }

    // Load genetic profiles
    const savedProfiles = localStorage.getItem('adonai_genetic_profiles');
    if (savedProfiles) {
      setGeneticProfiles(JSON.parse(savedProfiles));
    }
  };

  const initializeBreedingData = () => {
    const initialRecords = [
      {
        id: 1,
        sireId: 'BULL001',
        sireName: 'Thunder',
        damId: 'COW001',
        damName: 'Bessie',
        breedingDate: '2024-01-15',
        expectedDueDate: '2024-10-22',
        actualBirthDate: null,
        status: 'pregnant',
        method: 'natural',
        veterinarian: 'Dr. Smith',
        notes: 'First breeding for Bessie',
        offspring: null,
        success: null
      },
      {
        id: 2,
        sireId: 'BULL002',
        sireName: 'Champion',
        damId: 'COW002',
        damName: 'Daisy',
        breedingDate: '2023-11-20',
        expectedDueDate: '2024-08-27',
        actualBirthDate: '2024-08-25',
        status: 'completed',
        method: 'AI',
        veterinarian: 'Dr. Johnson',
        notes: 'Successful AI breeding',
        offspring: 'CALF001',
        success: true
      }
    ];

    const initialSchedule = [
      {
        id: 1,
        animalId: 'COW003',
        animalName: 'Luna',
        plannedDate: '2024-09-15',
        sireId: 'BULL001',
        sireName: 'Thunder',
        method: 'natural',
        status: 'scheduled',
        notes: 'Heat cycle monitoring required',
        priority: 'high'
      },
      {
        id: 2,
        animalId: 'COW004',
        animalName: 'Stella',
        plannedDate: '2024-09-20',
        sireId: 'BULL002',
        sireName: 'Champion',
        method: 'AI',
        status: 'scheduled',
        notes: 'AI appointment booked',
        priority: 'medium'
      }
    ];

    const initialProfiles = [
      {
        id: 1,
        animalId: 'BULL001',
        animalName: 'Thunder',
        breed: 'Angus',
        bloodline: 'Champion Line A',
        geneticTraits: {
          milkProduction: 'High',
          meatQuality: 'Excellent',
          diseaseResistance: 'High',
          fertility: 'Excellent',
          temperament: 'Calm'
        },
        parentage: {
          sire: 'BULL_PARENT_001',
          dam: 'COW_PARENT_001'
        },
        offspring: ['CALF001', 'CALF002'],
        breedingValue: 95,
        certifications: ['Registered Angus', 'AI Certified']
      }
    ];

    setBreedingRecords(initialRecords);
    setBreedingSchedule(initialSchedule);
    setGeneticProfiles(initialProfiles);
    
    localStorage.setItem('adonai_breeding_records', JSON.stringify(initialRecords));
    localStorage.setItem('adonai_breeding_schedule', JSON.stringify(initialSchedule));
    localStorage.setItem('adonai_genetic_profiles', JSON.stringify(initialProfiles));
  };

  const saveBreedingData = (records, schedule, profiles) => {
    if (records) {
      localStorage.setItem('adonai_breeding_records', JSON.stringify(records));
      setBreedingRecords(records);
    }
    if (schedule) {
      localStorage.setItem('adonai_breeding_schedule', JSON.stringify(schedule));
      setBreedingSchedule(schedule);
    }
    if (profiles) {
      localStorage.setItem('adonai_genetic_profiles', JSON.stringify(profiles));
      setGeneticProfiles(profiles);
    }
  };

  const handleAddRecord = (formData) => {
    const newRecord = {
      id: Math.max(...breedingRecords.map(r => r.id), 0) + 1,
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    const updatedRecords = [...breedingRecords, newRecord];
    saveBreedingData(updatedRecords, null, null);
    setShowModal(false);
    setEditingItem(null);
  };

  const handleEditRecord = (record) => {
    setEditingItem(record);
    setModalType('record');
    setShowModal(true);
  };

  const handleUpdateRecord = (formData) => {
    const updatedRecords = breedingRecords.map(record =>
      record.id === editingItem.id ? { ...record, ...formData } : record
    );
    
    saveBreedingData(updatedRecords, null, null);
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this breeding record?')) {
      const updatedRecords = breedingRecords.filter(record => record.id !== id);
      saveBreedingData(updatedRecords, null, null);
    }
  };

  // Calculate breeding analytics
  const getBreedingAnalytics = () => {
    const totalBreedings = breedingRecords.length;
    const successfulBreedings = breedingRecords.filter(r => r.success === true).length;
    const pregnantAnimals = breedingRecords.filter(r => r.status === 'pregnant').length;
    const scheduledBreedings = breedingSchedule.filter(s => s.status === 'scheduled').length;
    
    const successRate = totalBreedings > 0 ? ((successfulBreedings / totalBreedings) * 100).toFixed(1) : 0;
    
    const breedingsByMonth = breedingRecords.reduce((acc, record) => {
      const month = new Date(record.breedingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyData = Object.entries(breedingsByMonth).map(([month, count]) => ({
      month,
      breedings: count
    }));

    const methodDistribution = breedingRecords.reduce((acc, record) => {
      acc[record.method] = (acc[record.method] || 0) + 1;
      return acc;
    }, {});

    const methodData = Object.entries(methodDistribution).map(([method, count]) => ({
      name: method === 'AI' ? 'Artificial Insemination' : 'Natural Breeding',
      value: count
    }));

    return {
      totalBreedings,
      successfulBreedings,
      pregnantAnimals,
      scheduledBreedings,
      successRate,
      monthlyData,
      methodData
    };
  };

  const analytics = getBreedingAnalytics();

  const filteredRecords = breedingRecords.filter(record => {
    const matchesSearch = record.sireName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.damName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="page">
      <div className="page-header">
        <h1>🧬 Breeding Management</h1>
        <p>Track breeding records, schedules, genetics, and performance analytics</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{analytics.totalBreedings}</div>
            <div className="stat-label">Total Breedings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{analytics.successRate}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤱</div>
          <div className="stat-content">
            <div className="stat-number">{analytics.pregnantAnimals}</div>
            <div className="stat-label">Pregnant Animals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{analytics.scheduledBreedings}</div>
            <div className="stat-label">Scheduled Breedings</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Breeding Activity by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="breedings" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <h3>Breeding Methods Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.methodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Breeding Records
        </button>
        <button 
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Breeding Calendar
        </button>
        <button 
          className={`tab-button ${activeTab === 'genetics' ? 'active' : ''}`}
          onClick={() => setActiveTab('genetics')}
        >
          🧬 Genetic Profiles
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Performance Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'records' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Breeding Records</h2>
            {canEdit('breeding') && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('record');
                  setEditingItem(null);
                  setShowModal(true);
                }}
              >
                ➕ Add Breeding Record
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="filters">
            <input
              type="text"
              placeholder="Search by sire, dam, or veterinarian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="bred">Bred</option>
              <option value="pregnant">Pregnant</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Records Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sire</th>
                  <th>Dam</th>
                  <th>Breeding Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Veterinarian</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.sireName}</strong>
                      <br />
                      <small>{record.sireId}</small>
                    </td>
                    <td>
                      <strong>{record.damName}</strong>
                      <br />
                      <small>{record.damId}</small>
                    </td>
                    <td>{new Date(record.breedingDate).toLocaleDateString()}</td>
                    <td>{record.expectedDueDate ? new Date(record.expectedDueDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.method === 'AI' ? 'Artificial Insemination' : 'Natural'}</td>
                    <td>{record.veterinarian}</td>
                    <td>
                      <div className="action-buttons">
                        {canEdit('breeding') && (
                          <button
                            className="btn btn-small btn-outline"
                            onClick={() => handleEditRecord(record)}
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete('breeding') && (
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteRecord(record.id)}
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
        </div>
      )}

      {/* Breeding Schedule Tab */}
      {activeTab === 'schedule' && (
        <BreedingScheduleTab 
          schedule={breedingSchedule}
          onUpdate={(newSchedule) => saveBreedingData(null, newSchedule, null)}
          canEdit={canEdit('breeding')}
          canDelete={canDelete('breeding')}
        />
      )}

      {/* Genetic Profiles Tab */}
      {activeTab === 'genetics' && (
        <GeneticProfilesTab 
          profiles={geneticProfiles}
          onUpdate={(newProfiles) => saveBreedingData(null, null, newProfiles)}
          canEdit={canEdit('breeding')}
          canDelete={canDelete('breeding')}
        />
      )}

      {/* Performance Analytics Tab */}
      {activeTab === 'analytics' && (
        <PerformanceAnalyticsTab 
          records={breedingRecords}
          profiles={geneticProfiles}
        />
      )}

      {/* Modal for Adding/Editing Records */}
      {showModal && modalType === 'record' && (
        <BreedingRecordModal
          record={editingItem}
          onSave={editingItem ? handleUpdateRecord : handleAddRecord}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// Breeding Schedule Tab Component
function BreedingScheduleTab({ schedule, onUpdate, canEdit, canDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleAdd = (formData) => {
    const newItem = {
      id: Math.max(...schedule.map(s => s.id), 0) + 1,
      ...formData,
      createdAt: new Date().toISOString()
    };
    onUpdate([...schedule, newItem]);
    setShowModal(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleUpdate = (formData) => {
    const updated = schedule.map(item =>
      item.id === editingItem.id ? { ...item, ...formData } : item
    );
    onUpdate(updated);
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled breeding?')) {
      onUpdate(schedule.filter(item => item.id !== id));
    }
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>Breeding Calendar</h2>
        {canEdit && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
          >
            ➕ Schedule Breeding
          </button>
        )}
      </div>

      <div className="calendar-view">
        {schedule.map(item => (
          <div key={item.id} className={`calendar-item priority-${item.priority}`}>
            <div className="calendar-date">
              {new Date(item.plannedDate).toLocaleDateString()}
            </div>
            <div className="calendar-content">
              <h4>{item.animalName} × {item.sireName}</h4>
              <p>Method: {item.method === 'AI' ? 'Artificial Insemination' : 'Natural'}</p>
              <p>Status: <span className={`status-badge status-${item.status}`}>{item.status}</span></p>
              {item.notes && <p className="notes">{item.notes}</p>}
            </div>
            {(canEdit || canDelete) && (
              <div className="calendar-actions">
                {canEdit && (
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => handleEdit(item)}
                  >
                    ✏️
                  </button>
                )}
                {canDelete && (
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(item.id)}
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <BreedingScheduleModal
          item={editingItem}
          onSave={editingItem ? handleUpdate : handleAdd}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}