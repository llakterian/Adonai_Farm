import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import { usePermissions, getDashboardContent } from '../utils/permissions.jsx';
import { notificationSystem } from '../utils/notifications.js';
import { Link } from 'react-router-dom';

const COLORS = ['#2d5016', '#4a7c59', '#d4af37', '#8b4513', '#6b8e23', '#556b2f'];

export default function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [notifications, setNotifications] = useState([]);

  const { user, role, canAccess, isAdmin, isSupervisor, isWorker } = usePermissions();

  useEffect(() => {
    loadData();
    loadNotifications();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const notificationTimer = setInterval(loadNotifications, 30000); // Update notifications every 30 seconds
    return () => {
      clearInterval(timer);
      clearInterval(notificationTimer);
    };
  }, []);

  const loadNotifications = () => {
    const activeNotifications = notificationSystem.getActiveNotifications();
    setNotifications(activeNotifications.slice(0, 5)); // Show only top 5 notifications
  };

  async function loadData() {
    try {
      setLoading(true);

      // Load data from localStorage
      const savedAnimals = localStorage.getItem('adonai_animals');
      if (savedAnimals) {
        setAnimals(JSON.parse(savedAnimals));
      }

      const savedWorkers = localStorage.getItem('adonai_workers');
      if (savedWorkers) {
        setWorkers(JSON.parse(savedWorkers));
      }

      const savedInfrastructure = localStorage.getItem('adonai_infrastructure');
      if (savedInfrastructure) {
        setInfrastructure(JSON.parse(savedInfrastructure));
      }

      const savedTimeEntries = localStorage.getItem('adonai_time_entries');
      if (savedTimeEntries) {
        setTimeEntries(JSON.parse(savedTimeEntries));
      }

      const savedPhotos = localStorage.getItem('adonai_gallery');
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }

      // Calculate performance metrics
      calculatePerformanceMetrics();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const calculatePerformanceMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    // Calculate today's metrics
    const todayTimeEntries = timeEntries.filter(entry =>
      entry.clock_in && entry.clock_in.startsWith(today)
    );

    const todayHours = todayTimeEntries.reduce((sum, entry) =>
      sum + (entry.hours_worked || 0), 0
    );

    // Calculate weekly metrics
    const weeklyTimeEntries = timeEntries.filter(entry =>
      entry.clock_in && new Date(entry.clock_in) >= thisWeek
    );

    const weeklyHours = weeklyTimeEntries.reduce((sum, entry) =>
      sum + (entry.hours_worked || 0), 0
    );

    // Calculate infrastructure utilization
    const activeInfrastructure = infrastructure.filter(item =>
      item.status === 'Active'
    ).length;

    const totalInfrastructureValue = infrastructure.reduce((sum, item) =>
      sum + (item.current_value || item.value || 0), 0
    );

    setPerformanceMetrics({
      todayHours: todayHours.toFixed(1),
      weeklyHours: weeklyHours.toFixed(1),
      activeWorkers: todayTimeEntries.length,
      infrastructureUtilization: infrastructure.length > 0 ?
        ((activeInfrastructure / infrastructure.length) * 100).toFixed(1) : 0,
      totalAssetValue: totalInfrastructureValue,
      animalsThisMonth: animals.filter(animal =>
        animal.created_at && new Date(animal.created_at) >= thisMonth
      ).length
    });
  };

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
    <div className="admin-container">
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
            🌾 {getDashboardContent(role).title}
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
            {getDashboardContent(role).description}
          </p>
          {user && (
            <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Welcome back, {user.name}!
            </p>
          )}
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

      {/* Role-Specific Performance Metrics */}
      {isAdmin() && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
            📊 Real-Time Performance Indicators
          </h2>
          <div className="stats-grid">
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.todayHours || '0.0'}</div>
              <div className="stat-label">⏰ Hours Today</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.activeWorkers || 0}</div>
              <div className="stat-label">👷 Active Workers</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.infrastructureUtilization || 0}%</div>
              <div className="stat-label">🚜 Asset Utilization</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">KSh {(performanceMetrics.totalAssetValue || 0).toLocaleString()}</div>
              <div className="stat-label">💰 Asset Value</div>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Performance Metrics */}
      {isSupervisor() && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--light-green) 0%, var(--accent-gold) 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>
            📈 Operational Metrics
          </h2>
          <div className="stats-grid">
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.weeklyHours || '0.0'}</div>
              <div className="stat-label">📅 Weekly Hours</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{workers.length}</div>
              <div className="stat-label">👥 Total Workers</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.animalsThisMonth || 0}</div>
              <div className="stat-label">🐄 New Animals</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{infrastructure.length}</div>
              <div className="stat-label">🏗️ Infrastructure</div>
            </div>
          </div>
        </div>
      )}

      {/* Worker Personal Dashboard */}
      {isWorker() && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--warm-brown) 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>
            👷 Your Work Summary
          </h2>
          <div className="stats-grid">
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.todayHours || '0.0'}</div>
              <div className="stat-label">⏰ Hours Today</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{performanceMetrics.weeklyHours || '0.0'}</div>
              <div className="stat-label">📅 Hours This Week</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{animals.length}</div>
              <div className="stat-label">🐄 Animals to Care For</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <div className="stat-number">{currentTime.toLocaleDateString()}</div>
              <div className="stat-label">📅 Today's Date</div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Summary Widget */}
      {notifications.length > 0 && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: 'white', margin: 0 }}>
              🔔 Recent Notifications
            </h2>
            <Link
              to="/notifications"
              style={{
                color: 'white',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem'
              }}
            >
              View All →
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>
                  {notification.type === 'maintenance' ? '🔧' :
                    notification.type === 'event' ? '📅' :
                      notification.type === 'system' ? '⚙️' : '⏰'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {notification.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    {notification.message}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.8,
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '10px'
                }}>
                  {notification.priority === 'critical' ? '🚨' :
                    notification.priority === 'high' ? '⚠️' : '📋'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats - Available to all roles */}
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

      {/* Interactive Charts Section - Only for Admin and Supervisor */}
      {(isAdmin() || isSupervisor()) && (
        <>
          {/* Farm Overview KPIs */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--light-green) 100%)',
            color: 'white',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>
              📈 Farm Overview & KPIs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Monthly Growth Trend */}
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>📊 Monthly Growth</h4>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', animals: animals.length * 0.7, workers: workers.length * 0.8 },
                      { month: 'Feb', animals: animals.length * 0.8, workers: workers.length * 0.85 },
                      { month: 'Mar', animals: animals.length * 0.9, workers: workers.length * 0.9 },
                      { month: 'Apr', animals: animals.length, workers: workers.length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                      <XAxis dataKey="month" stroke="white" />
                      <YAxis stroke="white" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="animals" stroke="var(--accent-gold)" strokeWidth={3} name="Animals" />
                      <Line type="monotone" dataKey="workers" stroke="#fff" strokeWidth={3} name="Workers" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Productivity Metrics */}
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>⚡ Productivity Index</h4>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Mon', productivity: 85, efficiency: 78 },
                      { day: 'Tue', productivity: 92, efficiency: 85 },
                      { day: 'Wed', productivity: 88, efficiency: 82 },
                      { day: 'Thu', productivity: 95, efficiency: 90 },
                      { day: 'Fri', productivity: 90, efficiency: 87 },
                      { day: 'Sat', productivity: 87, efficiency: 84 },
                      { day: 'Sun', productivity: 82, efficiency: 79 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                      <XAxis dataKey="day" stroke="white" />
                      <YAxis stroke="white" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="productivity" stackId="1" stroke="var(--accent-gold)" fill="var(--accent-gold)" fillOpacity={0.6} name="Productivity %" />
                      <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#fff" fill="#fff" fillOpacity={0.3} name="Efficiency %" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Animals by Type Chart */}
            <div className="card">
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
                📊 Animals by Type
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="var(--primary-green)" name="Count" />
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Infrastructure Status */}
            <div className="card">
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
                🏗️ Infrastructure Status
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Active', count: infrastructure.filter(i => i.status === 'Active').length },
                    { name: 'Maintenance', count: infrastructure.filter(i => i.status === 'Maintenance').length },
                    { name: 'Retired', count: infrastructure.filter(i => i.status === 'Retired').length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="var(--accent-gold)" name="Infrastructure Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Worker Performance */}
            <div className="card">
              <h3 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
                👷 Worker Performance
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { week: 'Week 1', hours: performanceMetrics.weeklyHours * 0.8, efficiency: 85 },
                    { week: 'Week 2', hours: performanceMetrics.weeklyHours * 0.9, efficiency: 88 },
                    { week: 'Week 3', hours: performanceMetrics.weeklyHours * 0.95, efficiency: 92 },
                    { week: 'Week 4', hours: performanceMetrics.weeklyHours, efficiency: 90 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="hours" stroke="var(--primary-green)" strokeWidth={2} name="Hours Worked" />
                    <Line type="monotone" dataKey="efficiency" stroke="var(--accent-gold)" strokeWidth={2} name="Efficiency %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

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
          {[
            { src: '/images/adonai1.jpg', alt: 'Dairy Cattle at Adonai Farm', icon: '🐄', label: 'Dairy Cattle', color: 'var(--sage-green)' },
            { src: '/images/adonai2.jpg', alt: 'Beef Cattle at Adonai Farm', icon: '🐂', label: 'Beef Cattle', color: 'var(--earth-taupe)' },
            { src: '/images/adonai3.jpg', alt: 'Goats at Adonai Farm', icon: '🐐', label: 'Farm Goats', color: 'var(--olive-green)' },
            { src: '/images/adonai4.jpg', alt: 'Sheep at Adonai Farm', icon: '🐑', label: 'Prize Sheep', color: 'var(--moss-green)' },
            { src: '/images/adonai5.jpg', alt: 'Poultry at Adonai Farm', icon: '🐔', label: 'Free-Range Poultry', color: 'var(--wheat-gold)' },
            { src: '/images/adonai6.jpg', alt: 'Farm Facilities', icon: '🏡', label: 'Farm Facilities', color: 'var(--forest-green)' }
          ].map((image, index) => (
            <div key={index} className="gallery-item">
              <img
                src={image.src}
                alt={image.alt}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  transition: 'transform 0.3s ease'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              />
              <div
                className="image-placeholder"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  height: '200px',
                  background: image.color,
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '2rem' }}>{image.icon}</span>
                <span>{image.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
