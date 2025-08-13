import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2d5016', '#4a7c59', '#d4af37', '#8b4513', '#6b8e23', '#556b2f'];

export default function Reports() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      const res = await axios.get(api + '/api/livestock', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setAnimals(res.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load animal data. Please try again.');
    } finally {
      setLoading(false);
    }
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

    // Farm assets data
    const farmAssets = {
      vehicles: {
        'Tractors with Trailers': 2,
        'Pickup Trucks': 2,
        'Canter Lorries': 2
      },
      crops: {
        'Tea Plantation': 1,
        'Pasture Land': 1
      }
    };

    return { typeChartData, sexChartData, ageChartData, typeData: mergedTypeData, sexData, filteredAnimals, farmAssets };
  };

  const exportCSV = () => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    window.open(api + '/api/reports/animals.csv', '_blank');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
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

  const { typeChartData, sexChartData, ageChartData, typeData, sexData, filteredAnimals, farmAssets } = generateReports();
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

      {/* Export Section */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-green)' }}>
          📤 Export Data
        </h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>
          Download your farm data in various formats for external analysis or record keeping.
        </p>
        <div className="btn-group">
          <button className="btn btn-primary" onClick={exportCSV}>
            📊 Export Animals CSV
          </button>
          <button className="btn btn-secondary" onClick={() => window.print()}>
            🖨️ Print Report
          </button>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary-green)" />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--light-green)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
    </div>
  );
}