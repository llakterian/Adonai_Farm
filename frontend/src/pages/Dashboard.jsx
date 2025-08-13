import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2d5016', '#4a7c59', '#d4af37', '#8b4513', '#6b8e23', '#556b2f'];

export default function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('adonai_token');
      
      const [animalsRes, photosRes] = await Promise.all([
        axios.get(api + '/api/livestock', { headers: { Authorization: 'Bearer ' + token } }),
        axios.get(api + '/api/gallery', { headers: { Authorization: 'Bearer ' + token } }).catch(() => ({ data: [] }))
      ]);
      
      setAnimals(animalsRes.data);
      setPhotos(photosRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getAnimalStats = () => {
    const typeCounts = animals.reduce((acc, animal) => {
      acc[animal.type] = (acc[animal.type] || 0) + 1;
      return acc;
    }, {});

    const sexCounts = animals.reduce((acc, animal) => {
      acc[animal.sex] = (acc[animal.sex] || 0) + 1;
      return acc;
    }, {});

    // Add placeholder data for better visualization
    const placeholderTypes = {
      'Dairy Cattle': 0,
      'Beef Cattle': 0,
      'Sheep': 0,
      'Goats': 0,
      'Poultry': 0
    };

    const mergedTypeCounts = { ...placeholderTypes, ...typeCounts };
    const typeData = Object.keys(mergedTypeCounts).map(type => ({
      name: type,
      value: mergedTypeCounts[type]
    }));

    const sexData = [
      { name: 'Female', value: sexCounts.F || 0 },
      { name: 'Male', value: sexCounts.M || 0 }
    ];

    return { typeData, sexData, typeCounts: mergedTypeCounts, sexCounts };
  };

  const getFarmAssets = () => {
    return {
      vehicles: {
        'Tractors with Trailers': 2,
        'Pickup Trucks': 2,
        'Canter Lorries': 2
      },
      crops: {
        'Tea Plantation': '15 Acres',
        'Pasture Land': '50 Acres',
        'Grazing Fields': '25 Acres'
      },
      staff: {
        'Farm Workers': 8,
        'Drivers': 3,
        'Milkmen': 4,
        'Supervisors': 2
      },
      infrastructure: {
        'Milking Parlors': 2,
        'Storage Barns': 4,
        'Feed Stores': 3,
        'Water Points': 12
      }
    };
  };

  const getWeatherInfo = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { icon: '🌙', status: 'Night Time', temp: '18°C' };
    if (hour < 12) return { icon: '🌅', status: 'Morning', temp: '22°C' };
    if (hour < 18) return { icon: '☀️', status: 'Afternoon', temp: '28°C' };
    return { icon: '🌆', status: 'Evening', temp: '24°C' };
  };

  const getRecentAnimals = () => {
    return animals
      .sort((a, b) => new Date(b.dob || 0) - new Date(a.dob || 0))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const { typeData, sexData } = getAnimalStats();
  const recentAnimals = getRecentAnimals();
  const farmAssets = getFarmAssets();
  const weather = getWeatherInfo();

  return (
    <div>
      {/* Hero Welcome Section with Live Time & Weather */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)',
        color: 'white',
        textAlign: 'center',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '1rem', 
          right: '1rem', 
          background: 'rgba(255,255,255,0.2)', 
          padding: '0.5rem 1rem', 
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{weather.icon}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{weather.status}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{weather.temp}</div>
        </div>
        
        <div style={{ 
          position: 'absolute', 
          top: '1rem', 
          left: '1rem', 
          background: 'rgba(255,255,255,0.2)', 
          padding: '0.5rem 1rem', 
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            {currentTime.toLocaleDateString()}
          </div>
          <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        <div style={{ padding: '2rem 0' }}>
          <h1 style={{ 
            color: 'var(--accent-gold)', 
            marginBottom: '1rem', 
            fontSize: '3rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🌾 Adonai Farm Dashboard
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
            Your comprehensive livestock & agricultural management system
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '2rem', 
            marginTop: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}>🐄</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{animals.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Animals</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}>🍃</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>90</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Total Acres</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}>👥</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>17</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Staff Members</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--accent-gold)' }}>🚜</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>6</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Vehicles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{animals.length}</div>
          <div className="stat-label">🐄 Total Animals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{new Set(animals.map(a => a.type)).size}</div>
          <div className="stat-label">🏷️ Animal Types</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{photos.length}</div>
          <div className="stat-label">📸 Farm Photos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{animals.filter(a => a.sex === 'F').length}</div>
          <div className="stat-label">♀️ Female Animals</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Animals by Type Chart */}
        <div className="card">
          <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
            📊 Animals by Type
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="var(--primary-green)" />
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
                  data={sexData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sexData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Farm Assets Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Vehicles Section */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          color: 'white'
        }}>
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🚜 Farm Vehicles
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(farmAssets.vehicles).map(([vehicle, count]) => (
              <div key={vehicle} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {vehicle.includes('Tractor') ? '🚜' : 
                     vehicle.includes('Pickup') ? '🛻' : '🚛'}
                  </span>
                  <span style={{ fontWeight: '500' }}>{vehicle}</span>
                </div>
                <div style={{ 
                  background: 'var(--accent-gold)', 
                  color: 'var(--primary-green)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '15px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Section */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--light-green) 0%, #6b8e23 100%)',
          color: 'white'
        }}>
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            👥 Farm Staff
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(farmAssets.staff).map(([role, count]) => (
              <div key={role} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {role.includes('Worker') ? '👷' : 
                     role.includes('Driver') ? '🚗' : 
                     role.includes('Milkmen') ? '🥛' : '👨‍💼'}
                  </span>
                  <span style={{ fontWeight: '500' }}>{role}</span>
                </div>
                <div style={{ 
                  background: 'var(--accent-gold)', 
                  color: 'var(--primary-green)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '15px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crops & Land Section */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #556b2f 0%, #6b8e23 100%)',
          color: 'white'
        }}>
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌱 Land & Crops
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(farmAssets.crops).map(([crop, area]) => (
              <div key={crop} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {crop.includes('Tea') ? '🍃' : 
                     crop.includes('Pasture') ? '🌾' : '🌿'}
                  </span>
                  <span style={{ fontWeight: '500' }}>{crop}</span>
                </div>
                <div style={{ 
                  background: 'var(--accent-gold)', 
                  color: 'var(--primary-green)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '15px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {area}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Section */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--warm-brown) 100%)',
          color: 'white'
        }}>
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏗️ Infrastructure
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {Object.entries(farmAssets.infrastructure).map(([facility, count]) => (
              <div key={facility} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.75rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {facility.includes('Milking') ? '🥛' : 
                     facility.includes('Barn') ? '🏚️' : 
                     facility.includes('Feed') ? '🌾' : '💧'}
                  </span>
                  <span style={{ fontWeight: '500' }}>{facility}</span>
                </div>
                <div style={{ 
                  background: 'var(--accent-gold)', 
                  color: 'var(--primary-green)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '15px',
                  fontWeight: 'bold'
                }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Farm Operations Status */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--accent-gold) 0%, #f4d03f 100%)',
        color: 'var(--primary-green)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 Today's Farm Operations
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥛</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>450L</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Milk Collected</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌾</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>2.5T</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Feed Distributed</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍃</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>15kg</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tea Harvested</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>5000L</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Water Consumed</div>
          </div>
        </div>
      </div>

      {/* Recent Animals */}
      <div className="card">
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
          🆕 Recently Added Animals
        </h3>
        {recentAnimals.length > 0 ? (
          <div className="animals-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {recentAnimals.map(animal => (
              <div key={animal.id} className="animal-card" style={{ padding: '1rem' }}>
                <div className="animal-header">
                  <div>
                    <div className="animal-name" style={{ fontSize: '1.1rem' }}>
                      {animal.type === 'Dairy Cattle' ? '🐄' : 
                       animal.type === 'Beef Cattle' ? '🐂' :
                       animal.type.includes('Goat') ? '🐐' :
                       animal.type.includes('Sheep') ? '🐑' : '🐔'} {animal.name}
                    </div>
                    <div className="animal-type">{animal.type}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem' }}>
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
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            <p>No animals added yet. Start by adding your first animal!</p>
          </div>
        )}
      </div>

      {/* Farm Gallery Preview */}
      {photos.length > 0 && (
        <div className="card">
          <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
            📸 Recent Farm Photos
          </h3>
          <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {photos.slice(0, 6).map(photo => (
              <div key={photo.id} className="gallery-item">
                <img 
                  src={`http://localhost:4000${photo.path}`} 
                  alt={photo.filename}
                  style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farm Images Showcase */}
      <div className="card">
        <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
          🌾 Our Beautiful Farm
        </h3>
        <div className="gallery-grid">
          <div className="gallery-item">
            <img src="/images/farm-2.jpg" alt="Farm View 1" />
          </div>
          <div className="gallery-item">
            <img src="/images/farm-3.jpg" alt="Farm View 2" />
          </div>
          <div className="gallery-item">
            <img src="/images/farm-4.jpg" alt="Farm View 3" />
          </div>
        </div>
      </div>
    </div>
  );
}
