import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, CartesianGrid, Legend } from 'recharts';
import { mockAnimals, getAllUsers } from '../auth.js';
import { withPermission, usePermissions } from '../utils/permissions.jsx';
import { 
  exportAnimalsCSV, 
  exportWorkersCSV, 
  exportInfrastructureCSV, 
  exportUsersCSV, 
  exportTimeEntriesCSV,
  importAnimalsCSV,
  importWorkersCSV,
  validateCSVFile
} from '../utils/csvUtils.js';

const COLORS = ['#2d5016', '#4a7c59', '#d4af37', '#8b4513', '#6b8e23', '#556b2f'];

function Reports() {
  const [animals, setAnimals] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('animals');
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);
  const [error, setError] = useState(null);
  const { canEdit, isAdmin } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    setError(null);
    
    // Load animals from localStorage or use mock data
    const savedAnimals = localStorage.getItem('adonai_animals');
    if (savedAnimals) {
      setAnimals(JSON.parse(savedAnimals));
    } else {
      setAnimals([...mockAnimals]);
      localStorage.setItem('adonai_animals', JSON.stringify(mockAnimals));
    }

    // Load infrastructure data
    const savedInfrastructure = localStorage.getItem('adonai_infrastructure');
    if (savedInfrastructure) {
      setInfrastructure(JSON.parse(savedInfrastructure));
    } else {
      setInfrastructure([]);
    }

    // Load workers data
    const savedWorkers = localStorage.getItem('adonai_workers');
    if (savedWorkers) {
      setWorkers(JSON.parse(savedWorkers));
    } else {
      setWorkers([]);
    }

    // Load time entries data
    const savedTimeEntries = localStorage.getItem('adonai_time_entries');
    if (savedTimeEntries) {
      setTimeEntries(JSON.parse(savedTimeEntries));
    } else {
      setTimeEntries([]);
    }

    // Load users data (admin only)
    if (isAdmin) {
      const allUsers = getAllUsers();
      setUsers(allUsers);
    }
    
    setLoading(false);
  }

  const getFilteredAnimals = () => {
    if (dateFilter === 'all') return animals;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (dateFilter) {
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return animals;
    }
    
    return animals.filter(animal => {
      if (!animal.dob) return false;
      const animalDate = new Date(animal.dob);
      return animalDate >= filterDate;
    });
  };

  const generateReports = () => {
    const filteredAnimals = getFilteredAnimals();
    
    // Animals by type with placeholder data for better visualization
    const typeData = filteredAnimals.reduce((acc, animal) => {
      acc[animal.type] = (acc[animal.type] || 0) + 1;
      return acc;
    }, {});

    // Add placeholder data if no animals exist
    const placeholderTypes = {
      'Dairy Cattle': 0,
      'Beef Cattle': 0,
      'Sheep': 0,
      'Goats': 0,
      'Poultry': 0
    };

    const mergedTypeData = { ...placeholderTypes, ...typeData };
    const typeChartData = Object.keys(mergedTypeData).map(type => ({
      name: type,
      count: mergedTypeData[type]
    }));

    // Animals by sex
    const sexData = filteredAnimals.reduce((acc, animal) => {
      acc[animal.sex] = (acc[animal.sex] || 0) + 1;
      return acc;
    }, {});

    const sexChartData = [
      { name: 'Female', value: sexData.F || 0 },
      { name: 'Male', value: sexData.M || 0 }
    ];

    // Age distribution
    const ageGroups = {
      'Young (0-1 year)': 0,
      'Adult (1-5 years)': 0,
      'Mature (5+ years)': 0,
      'Unknown': 0
    };

    filteredAnimals.forEach(animal => {
      if (!animal.dob) {
        ageGroups['Unknown']++;
        return;
      }
      
      const birthDate = new Date(animal.dob);
      const today = new Date();
      const ageInYears = (today - birthDate) / (1000 * 60 * 60 * 24 * 365);
      
      if (ageInYears < 1) {
        ageGroups['Young (0-1 year)']++;
      } else if (ageInYears < 5) {
        ageGroups['Adult (1-5 years)']++;
      } else {
        ageGroups['Mature (5+ years)']++;
      }
    });

    const ageChartData = Object.keys(ageGroups).map(group => ({
      name: group,
      count: ageGroups[group]
    }));

    // Infrastructure analytics
    const infrastructureByCategory = infrastructure.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const infrastructureByStatus = infrastructure.reduce((acc, item) => {
      const status = item.status || 'Active';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const infrastructureChartData = Object.keys(infrastructureByCategory).map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count: infrastructureByCategory[category]
    }));

    const infrastructureStatusData = Object.keys(infrastructureByStatus).map(status => ({
      name: status,
      value: infrastructureByStatus[status]
    }));

    const totalInfrastructureValue = infrastructure.reduce((sum, item) => 
      sum + (item.current_value || item.value || 0), 0
    );

    // Farm assets data (now using real infrastructure data)
    const farmAssets = {
      vehicles: infrastructure.filter(i => i.category === 'vehicle').reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      buildings: infrastructure.filter(i => i.category === 'building').reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      equipment: infrastructure.filter(i => i.category === 'equipment').reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}),
      // Add placeholder crops data for display
      crops: {
        'Tea Plantation': '1 Area',
        'Maize Fields': '2 Areas',
        'Vegetable Garden': '1 Area'
      }
    };

    return { 
      typeChartData, 
      sexChartData, 
      ageChartData, 
      typeData: mergedTypeData, 
      sexData, 
      filteredAnimals, 
      farmAssets,
      infrastructureChartData,
      infrastructureStatusData,
      totalInfrastructureValue
    };
  };

  // CSV Export Functions
  const handleExport = (type) => {
    switch (type) {
      case 'animals':
        exportAnimalsCSV(animals);
        break;
      case 'workers':
        exportWorkersCSV(workers);
        break;
      case 'infrastructure':
        exportInfrastructureCSV(infrastructure);
        break;
      case 'users':
        if (isAdmin) {
          exportUsersCSV(users);
        }
        break;
      case 'timeEntries':
        exportTimeEntriesCSV(timeEntries, workers);
        break;
      default:
        exportAnimalsCSV(animals);
    }
  };

  // CSV Import Functions
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    setImportFile(file);
    setImportError(null);
    setImportSuccess(null);
  };

  const processImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }

    try {
      const csvContent = await validateCSVFile(importFile);
      let importedData = [];
      let updatedData = [];

      switch (importType) {
        case 'animals':
          importedData = importAnimalsCSV(csvContent, animals);
          updatedData = [...animals, ...importedData];
          setAnimals(updatedData);
          localStorage.setItem('adonai_animals', JSON.stringify(updatedData));
          break;
        case 'workers':
          importedData = importWorkersCSV(csvContent, workers);
          updatedData = [...workers, ...importedData];
          setWorkers(updatedData);
          localStorage.setItem('adonai_workers', JSON.stringify(updatedData));
          break;
        default:
          throw new Error('Import type not supported');
      }

      setImportSuccess(`Successfully imported ${importedData.length} ${importType} records`);
      setShowImportModal(false);
      setImportFile(null);
      loadData(); // Reload all data
    } catch (error) {
      setImportError(error.message);
    }
  };

  // Generate trend analysis data
  const generateTrendData = () => {
    const monthlyData = {};
    const currentDate = new Date();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        animals: 0,
        workers: 0,
        infrastructure: 0
      };
    }

    // Count animals by month
    animals.forEach(animal => {
      if (animal.created_at || animal.dob) {
        const date = animal.created_at || animal.dob;
        const monthKey = date.slice(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].animals++;
        }
      }
    });

    // Count workers by month (assuming they have a created_at field)
    workers.forEach(worker => {
      if (worker.created_at) {
        const monthKey = worker.created_at.slice(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].workers++;
        }
      }
    });

    // Count infrastructure by month
    infrastructure.forEach(item => {
      if (item.purchase_date) {
        const monthKey = item.purchase_date.slice(0, 7);
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].infrastructure++;
        }
      }
    });

    return Object.values(monthlyData);
  };

  const renderChart = (data, dataKey, title) => {
    const ChartComponent = chartType === 'line' ? LineChart : 
                          chartType === 'area' ? AreaChart : 
                          chartType === 'scatter' ? ScatterChart : BarChart;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
          <Legend />
          {chartType === 'line' && <Line type="monotone" dataKey={dataKey} stroke="var(--primary-green)" strokeWidth={3} dot={{ fill: 'var(--primary-green)', strokeWidth: 2, r: 4 }} />}
          {chartType === 'area' && <Area type="monotone" dataKey={dataKey} stroke="var(--primary-green)" fill="var(--primary-green)" fillOpacity={0.6} />}
          {chartType === 'scatter' && <Scatter dataKey={dataKey} fill="var(--primary-green)" />}
          {chartType === 'bar' && <Bar dataKey={dataKey} fill="var(--primary-green)" radius={[4, 4, 0, 0]} />}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>Loading farm data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Reports</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          🔄 Retry
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1 className="page-title">📊 Farm Reports & Analytics</h1>
        <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
          ⚠️ {error}
        </div>
        <button className="btn btn-primary" onClick={loadData}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  const { 
    typeChartData, 
    sexChartData, 
    ageChartData, 
    typeData, 
    sexData, 
    filteredAnimals, 
    farmAssets,
    infrastructureChartData,
    infrastructureStatusData,
    totalInfrastructureValue
  } = generateReports();
  const hasData = animals.length > 0;
  const hasFilteredData = filteredAnimals.length > 0;

  return (
    <div>
      <h1 className="page-title">📊 Farm Reports & Analytics</h1>

      {/* Date Filter */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📅 Date Filter
        </h2>
        <div className="btn-group">
          <button 
            className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDateFilter('all')}
          >
            All Time
          </button>
          <button 
            className={`btn ${dateFilter === '1year' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDateFilter('1year')}
          >
            Last Year
          </button>
          <button 
            className={`btn ${dateFilter === '6months' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDateFilter('6months')}
          >
            Last 6 Months
          </button>
          <button 
            className={`btn ${dateFilter === '30days' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDateFilter('30days')}
          >
            Last 30 Days
          </button>
        </div>
        {dateFilter !== 'all' && (
          <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
            Showing {filteredAnimals.length} of {animals.length} animals born in the selected period
          </p>
        )}
      </div>

      {!hasData ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>No Data Available</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
            You haven't added any animals to your farm yet. Add some animals to see detailed reports and analytics.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/animals'}>
            ➕ Add Your First Animal
          </button>
        </div>
      ) : !hasFilteredData ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>No Data for Selected Period</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
            No animals were born in the selected time period. Try selecting a different date range or add animals with birth dates in this period.
          </p>
          <button className="btn btn-secondary" onClick={() => setDateFilter('all')}>
            📊 Show All Data
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{animals.length}</div>
          <div className="stat-label">🐄 Total Animals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{Object.keys(typeData).length}</div>
          <div className="stat-label">🏷️ Animal Types</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{sexData.F || 0}</div>
          <div className="stat-label">♀️ Female</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{sexData.M || 0}</div>
          <div className="stat-label">♂️ Male</div>
        </div>
      </div>

      {/* Advanced Analytics Controls */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📊 Chart Type & Analytics
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Chart Type:</label>
            <select 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--cream)' }}
            >
              <option value="bar">📊 Bar Chart</option>
              <option value="line">📈 Line Chart</option>
              <option value="area">📈 Area Chart</option>
              <option value="scatter">⚫ Scatter Plot</option>
            </select>
          </div>
        </div>
      </div>

      {/* CSV Import/Export Section */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📤📥 Data Import/Export
        </h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
          Import and export your farm data in CSV format for external analysis, backup, or bulk data entry.
        </p>
        
        {/* Export Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>📤 Export Data</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => handleExport('animals')}>
              🐄 Export Animals
            </button>
            <button className="btn btn-primary" onClick={() => handleExport('workers')}>
              👷 Export Workers
            </button>
            <button className="btn btn-primary" onClick={() => handleExport('infrastructure')}>
              🚜 Export Infrastructure
            </button>
            <button className="btn btn-primary" onClick={() => handleExport('timeEntries')}>
              ⏰ Export Time Entries
            </button>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => handleExport('users')}>
                👥 Export Users
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => window.print()}>
              🖨️ Print Report
            </button>
          </div>
        </div>

        {/* Import Section */}
        {canEdit && (
          <div>
            <h3 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>📥 Import Data</h3>
            <button 
              className="btn btn-outline" 
              onClick={() => setShowImportModal(true)}
            >
              📥 Import CSV Data
            </button>
          </div>
        )}
      </div>

      {/* Trend Analysis */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📈 Trend Analysis (Last 12 Months)
        </h2>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={generateTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="animals" stroke="var(--primary-green)" strokeWidth={2} name="Animals Added" />
              <Line type="monotone" dataKey="workers" stroke="var(--accent-gold)" strokeWidth={2} name="Workers Added" />
              <Line type="monotone" dataKey="infrastructure" stroke="#8b4513" strokeWidth={2} name="Infrastructure Added" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Animals by Type */}
        <div className="card">
          <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
            🐄 Animals by Type
          </h3>
          <div style={{ height: '300px' }}>
            {renderChart(typeChartData, 'count', 'Animals by Type')}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="card">
          <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
            ⚧️ Gender Distribution
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sexChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sexChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
            📅 Age Distribution
          </h3>
          <div style={{ height: '300px' }}>
            {renderChart(ageChartData, 'count', 'Age Distribution')}
          </div>
        </div>
      </div>

      {/* Infrastructure Analytics Section */}
      {infrastructure.length > 0 && (
        <>
          <div className="card" style={{ 
            background: 'var(--gradient-primary)',
            color: 'white',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              🚜 Infrastructure Analytics
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' }}>
              Comprehensive analysis of {infrastructure.length} infrastructure assets worth ${totalInfrastructureValue.toLocaleString()}
            </p>
          </div>

          {/* Infrastructure Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{infrastructure.length}</div>
              <div className="stat-label">🏗️ Total Assets</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{infrastructure.filter(i => i.category === 'vehicle').length}</div>
              <div className="stat-label">🚜 Vehicles</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{infrastructure.filter(i => i.category === 'building').length}</div>
              <div className="stat-label">🏚️ Buildings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">${totalInfrastructureValue.toLocaleString()}</div>
              <div className="stat-label">💰 Total Value</div>
            </div>
          </div>

          {/* Infrastructure Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Infrastructure by Category */}
            <div className="card">
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
                🏗️ Infrastructure by Category
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={infrastructureChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent-gold)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Infrastructure Status */}
            <div className="card">
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
                🔧 Infrastructure Status
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={infrastructureStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {infrastructureStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detailed Breakdown */}
      <div className="card">
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
          📋 Detailed Breakdown
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Type Breakdown */}
          <div>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              🐄 By Animal Type
            </h4>
            <div style={{ background: 'var(--soft-white)', padding: '1rem', borderRadius: '8px' }}>
              {Object.entries(typeData).map(([type, count]) => (
                <div key={type} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--cream)'
                }}>
                  <span>{type}</span>
                  <strong style={{ color: 'var(--primary-green)' }}>{count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Breakdown */}
          <div>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              ⚧️ By Gender
            </h4>
            <div style={{ background: 'var(--soft-white)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--cream)'
              }}>
                <span>♀️ Female</span>
                <strong style={{ color: 'var(--primary-green)' }}>{sexData.F || 0}</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between'
              }}>
                <span>♂️ Male</span>
                <strong style={{ color: 'var(--primary-green)' }}>{sexData.M || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Assets */}
      <div className="card">
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
          🚜 Farm Assets & Infrastructure
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Vehicles */}
          <div>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              🚜 Farm Vehicles
            </h4>
            <div style={{ background: 'var(--soft-white)', padding: '1rem', borderRadius: '8px' }}>
              {Object.entries(farmAssets.vehicles).map(([vehicle, count]) => (
                <div key={vehicle} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--cream)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {vehicle.includes('Tractor') ? '🚜' : 
                       vehicle.includes('Pickup') ? '🛻' : '🚛'}
                    </span>
                    <span>{vehicle}</span>
                  </div>
                  <strong style={{ color: 'var(--primary-green)' }}>{count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Crops & Land */}
          <div>
            <h4 style={{ color: 'var(--primary-green)', marginBottom: '1rem' }}>
              🌱 Crops & Land Use
            </h4>
            <div style={{ background: 'var(--soft-white)', padding: '1rem', borderRadius: '8px' }}>
              {Object.entries(farmAssets.crops).map(([crop, count]) => (
                <div key={crop} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--cream)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {crop.includes('Tea') ? '🍃' : '🌾'}
                    </span>
                    <span>{crop}</span>
                  </div>
                  <strong style={{ color: 'var(--primary-green)' }}>
                    {count} {crop.includes('Tea') ? 'Plantation' : 'Area'}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
          🕒 Recent Animals
        </h3>
        <div className="animals-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {animals.slice(0, 6).map(animal => (
            <div key={animal.id} className="animal-card" style={{ padding: '1rem' }}>
              <div className="animal-header">
                <div>
                  <div className="animal-name" style={{ fontSize: '1rem' }}>
                    {animal.type === 'Dairy Cattle' ? '🐄' : 
                     animal.type === 'Beef Cattle' ? '🐂' :
                     animal.type.includes('Goat') ? '🐐' :
                     animal.type.includes('Sheep') ? '🐑' : '🐔'} {animal.name}
                  </div>
                  <div className="animal-type">{animal.type}</div>
                </div>
                <div style={{ fontSize: '1.2rem' }}>
                  {animal.sex === 'F' ? '♀️' : '♂️'}
                </div>
              </div>
              <div className="animal-detail">
                <strong>Born:</strong>
                <span>{animal.dob || 'Unknown'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📥 Import CSV Data</h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                ❌
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Data Type:</label>
                <select 
                  value={importType} 
                  onChange={(e) => setImportType(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--cream)' }}
                >
                  <option value="animals">🐄 Animals</option>
                  <option value="workers">👷 Workers</option>
                </select>
              </div>

              <div className="form-group">
                <label>CSV File:</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportFile}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--cream)' }}
                />
              </div>

              {importType === 'animals' && (
                <div className="info-box">
                  <h4>Required CSV Columns for Animals:</h4>
                  <ul>
                    <li><strong>type</strong> - Animal type (e.g., "Dairy Cattle", "Sheep")</li>
                    <li><strong>name</strong> - Animal name</li>
                    <li><strong>sex</strong> - M/F or Male/Female</li>
                  </ul>
                  <h4>Optional Columns:</h4>
                  <ul>
                    <li><strong>dob</strong> - Date of birth (YYYY-MM-DD format)</li>
                    <li><strong>notes</strong> - Additional notes</li>
                  </ul>
                </div>
              )}

              {importType === 'workers' && (
                <div className="info-box">
                  <h4>Required CSV Columns for Workers:</h4>
                  <ul>
                    <li><strong>name</strong> - Worker full name</li>
                    <li><strong>employee_id</strong> - Unique employee ID</li>
                    <li><strong>role</strong> - Worker role</li>
                  </ul>
                  <h4>Optional Columns:</h4>
                  <ul>
                    <li><strong>hourly_rate</strong> - Hourly rate (number)</li>
                    <li><strong>phone</strong> - Phone number</li>
                  </ul>
                </div>
              )}

              {importError && (
                <div className="error-message">
                  ❌ {importError}
                </div>
              )}

              {importSuccess && (
                <div className="success-message">
                  ✅ {importSuccess}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={processImport} disabled={!importFile}>
                📥 Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Protect the Reports component - only admins and supervisors can access
export default withPermission(Reports, 'reports');