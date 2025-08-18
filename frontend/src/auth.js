// Client-side authentication for Netlify deployment
// Enhanced security with token validation and session management
// Note: This is still a demo - in production, use proper backend auth with JWT

import config from './config.js';
import localStorageBackend from './utils/localStorageBackend.js';

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor', 
  WORKER: 'worker'
};

// Default users with roles
const defaultUsers = [
  { 
    id: 1, 
    username: 'admin', 
    password: 'adonai123', 
    role: USER_ROLES.ADMIN, 
    name: 'Farm Administrator',
    email: 'admin@adonaifarm.com',
    active: true,
    created_at: '2025-01-01'
  },
  { 
    id: 2, 
    username: 'supervisor', 
    password: 'super123', 
    role: USER_ROLES.SUPERVISOR, 
    name: 'Farm Supervisor',
    email: 'supervisor@adonaifarm.com',
    active: true,
    created_at: '2025-01-01'
  },
  { 
    id: 3, 
    username: 'worker', 
    password: 'work123', 
    role: USER_ROLES.WORKER, 
    name: 'Farm Worker',
    email: 'worker@adonaifarm.com',
    active: true,
    created_at: '2025-01-01'
  }
];

// Initialize users in localStorage if not exists
function initializeUsers() {
  if (!localStorage.getItem('adonai_users')) {
    localStorage.setItem('adonai_users', JSON.stringify(defaultUsers));
  }
}

export function authenticateUser(username, password) {
  // Check for suspicious activity first
  if (checkSuspiciousActivity()) {
    logSecurityEvent('login_blocked', { username, reason: 'suspicious_activity' });
    return { success: false, error: 'Account temporarily locked due to suspicious activity' };
  }
  
  initializeUsers();
  const users = JSON.parse(localStorage.getItem('adonai_users') || '[]');
  
  const user = users.find(u => u.username === username && u.password === password && u.active);
  
  if (user) {
    const token = generateSecureToken(user);
    const sessionExpiry = Date.now() + (8 * 60 * 60 * 1000); // 8 hours
    const currentUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
      sessionExpiry: sessionExpiry
    };
    
    localStorage.setItem('adonai_token', token);
    localStorage.setItem('adonai_current_user', JSON.stringify(currentUser));
    localStorage.setItem('adonai_session_expiry', sessionExpiry.toString());
    
    logSecurityEvent('login_success', { 
      username: user.username, 
      role: user.role,
      sessionExpiry: new Date(sessionExpiry).toISOString()
    });
    
    return { success: true, token, user: currentUser };
  }
  
  logSecurityEvent('login_failed', { username, reason: 'invalid_credentials' });
  return { success: false, error: 'Invalid credentials' };
}

// Generate a more secure token
function generateSecureToken(user) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2);
  const userHash = btoa(`${user.id}-${user.username}-${user.role}`);
  return `adonai_${userHash}_${timestamp}_${randomStr}`;
}

export function isAuthenticated() {
  const token = localStorage.getItem('adonai_token');
  const sessionExpiry = localStorage.getItem('adonai_session_expiry');
  
  if (!token || !sessionExpiry) {
    return false;
  }
  
  // Check if session has expired
  if (Date.now() > parseInt(sessionExpiry)) {
    logout(); // Clear expired session
    return false;
  }
  
  // Validate token format
  if (!token.startsWith('adonai_')) {
    logout(); // Clear invalid token
    return false;
  }
  
  return true;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('adonai_current_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function getUserRole() {
  const user = getCurrentUser();
  return user ? user.role : null;
}

export function hasPermission(requiredRole) {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  // Role hierarchy: admin > supervisor > worker
  const roleHierarchy = {
    [USER_ROLES.ADMIN]: 3,
    [USER_ROLES.SUPERVISOR]: 2,
    [USER_ROLES.WORKER]: 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccess(feature) {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  const permissions = {
    [USER_ROLES.ADMIN]: ['dashboard', 'animals', 'breeding', 'workers', 'infrastructure', 'inventory', 'reports', 'users', 'gallery', 'account'],
    [USER_ROLES.SUPERVISOR]: ['dashboard', 'animals', 'breeding', 'workers', 'infrastructure', 'inventory', 'reports', 'gallery', 'account'],
    [USER_ROLES.WORKER]: ['dashboard', 'animals', 'breeding', 'account', 'time_tracking']
  };
  
  return permissions[userRole]?.includes(feature) || false;
}

export function logout() {
  const currentUser = getCurrentUser();
  
  logSecurityEvent('logout', {
    user: currentUser ? currentUser.username : 'unknown',
    sessionDuration: currentUser ? Date.now() - (currentUser.sessionExpiry - 8 * 60 * 60 * 1000) : 0
  });
  
  localStorage.removeItem('adonai_token');
  localStorage.removeItem('adonai_current_user');
  localStorage.removeItem('adonai_session_expiry');
  
  // Redirect to home page
  window.location.href = '/';
}

// User management functions
export function getAllUsers() {
  initializeUsers();
  return JSON.parse(localStorage.getItem('adonai_users') || '[]');
}

export function createUser(userData) {
  const users = getAllUsers();
  const newUser = {
    id: Math.max(...users.map(u => u.id), 0) + 1,
    ...userData,
    created_at: new Date().toISOString().split('T')[0],
    active: true
  };
  
  users.push(newUser);
  localStorage.setItem('adonai_users', JSON.stringify(users));
  return newUser;
}

export function updateUser(userId, userData) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    localStorage.setItem('adonai_users', JSON.stringify(users));
    return users[index];
  }
  
  return null;
}

export function deleteUser(userId) {
  const users = getAllUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem('adonai_users', JSON.stringify(filteredUsers));
  return true;
}

// Mock API data for demo purposes
export const mockAnimals = [
  // Dairy Cattle
  { 
    id: 1, 
    type: 'Dairy Cattle', 
    name: 'Bessie', 
    dob: '2023-03-15', 
    sex: 'F', 
    notes: 'High milk producer, Holstein breed, excellent health record',
    breed: 'Holstein',
    weight: 650,
    tagNumber: 'DC001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-15', type: 'Vaccination', notes: 'Annual vaccinations completed' },
      { date: '2025-01-20', type: 'Health Check', notes: 'Excellent condition, no issues' }
    ],
    milkProduction: [
      { date: '2025-02-15', amount: 28.5, quality: 'A' },
      { date: '2025-02-14', amount: 29.2, quality: 'A' },
      { date: '2025-02-13', amount: 27.8, quality: 'A' }
    ]
  },
  { 
    id: 2, 
    type: 'Dairy Cattle', 
    name: 'Daisy', 
    dob: '2022-11-08', 
    sex: 'F', 
    notes: 'Consistent milk producer, gentle temperament, good mother',
    breed: 'Jersey',
    weight: 450,
    tagNumber: 'DC002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-10', type: 'Health Check', notes: 'Good condition, minor hoof trimming needed' },
      { date: '2025-01-15', type: 'Breeding Check', notes: 'Successfully bred, due in October' }
    ],
    milkProduction: [
      { date: '2025-02-15', amount: 22.3, quality: 'A+' },
      { date: '2025-02-14', amount: 23.1, quality: 'A+' },
      { date: '2025-02-13', amount: 21.9, quality: 'A' }
    ]
  },

  // Beef Cattle
  { 
    id: 3, 
    type: 'Beef Cattle', 
    name: 'Thunder', 
    dob: '2022-08-20', 
    sex: 'M', 
    notes: 'Prize bull, excellent genetics, calm temperament for breeding',
    breed: 'Angus',
    weight: 950,
    tagNumber: 'BC001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-12', type: 'Health Check', notes: 'Excellent condition, ready for breeding season' },
      { date: '2025-01-25', type: 'Vaccination', notes: 'Breeding vaccinations completed' }
    ],
    breedingRecords: [
      { date: '2025-02-01', female: 'Bella', success: true, notes: 'Successful breeding' },
      { date: '2025-01-15', female: 'Rosie', success: true, notes: 'Successful breeding' }
    ]
  },
  { 
    id: 4, 
    type: 'Beef Cattle', 
    name: 'Bella', 
    dob: '2022-05-12', 
    sex: 'F', 
    notes: 'Young heifer, first breeding, good growth rate',
    breed: 'Angus',
    weight: 520,
    tagNumber: 'BC002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-08', type: 'Pregnancy Check', notes: 'Confirmed pregnant, due in November' },
      { date: '2025-01-30', type: 'Health Check', notes: 'Good condition, gaining weight well' }
    ]
  },

  // Dairy Goats
  { 
    id: 5, 
    type: 'Dairy Goat', 
    name: 'Nanny', 
    dob: '2023-01-10', 
    sex: 'F', 
    notes: 'Gentle temperament, good milk producer, Nubian breed',
    breed: 'Nubian',
    weight: 65,
    tagNumber: 'DG001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-14', type: 'Health Check', notes: 'Excellent condition, hooves trimmed' },
      { date: '2025-01-28', type: 'Vaccination', notes: 'CDT vaccination completed' }
    ],
    milkProduction: [
      { date: '2025-02-15', amount: 3.2, quality: 'A' },
      { date: '2025-02-14', amount: 3.4, quality: 'A' },
      { date: '2025-02-13', amount: 3.1, quality: 'A' }
    ]
  },
  { 
    id: 6, 
    type: 'Dairy Goat', 
    name: 'Luna', 
    dob: '2022-09-22', 
    sex: 'F', 
    notes: 'High milk producer, Alpine breed, excellent mother',
    breed: 'Alpine',
    weight: 58,
    tagNumber: 'DG002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-11', type: 'Health Check', notes: 'Good condition, minor eye irritation treated' },
      { date: '2025-01-20', type: 'Breeding Check', notes: 'Successfully bred, due in June' }
    ],
    milkProduction: [
      { date: '2025-02-15', amount: 4.1, quality: 'A+' },
      { date: '2025-02-14', amount: 3.9, quality: 'A' },
      { date: '2025-02-13', amount: 4.2, quality: 'A+' }
    ]
  },

  // Beef Goats
  { 
    id: 7, 
    type: 'Beef Goat', 
    name: 'Buck', 
    dob: '2022-12-05', 
    sex: 'M', 
    notes: 'Breeding buck, Boer breed, excellent genetics',
    breed: 'Boer',
    weight: 85,
    tagNumber: 'BG001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-13', type: 'Health Check', notes: 'Excellent condition, ready for breeding' },
      { date: '2025-01-22', type: 'Hoof Trimming', notes: 'Routine hoof care completed' }
    ],
    breedingRecords: [
      { date: '2025-02-05', female: 'Ruby', success: true, notes: 'Successful breeding' },
      { date: '2025-01-20', female: 'Ginger', success: true, notes: 'Successful breeding' }
    ]
  },
  { 
    id: 8, 
    type: 'Beef Goat', 
    name: 'Ruby', 
    dob: '2022-07-18', 
    sex: 'F', 
    notes: 'Good mother, Boer breed, fast growth rate',
    breed: 'Boer',
    weight: 68,
    tagNumber: 'BG002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-09', type: 'Pregnancy Check', notes: 'Confirmed pregnant, due in July' },
      { date: '2025-01-25', type: 'Health Check', notes: 'Good condition, gaining weight' }
    ]
  },

  // Sheep
  { 
    id: 9, 
    type: 'Sheep', 
    name: 'Woolly', 
    dob: '2022-11-05', 
    sex: 'F', 
    notes: 'Excellent wool quality, Romney breed, good mother',
    breed: 'Romney',
    weight: 75,
    tagNumber: 'SH001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-16', type: 'Shearing', notes: 'Annual shearing completed, 8.5kg wool' },
      { date: '2025-01-18', type: 'Health Check', notes: 'Excellent condition' }
    ],
    woolProduction: [
      { date: '2025-02-16', amount: 8.5, quality: 'Premium' },
      { date: '2024-02-20', amount: 7.8, quality: 'Good' }
    ]
  },
  { 
    id: 10, 
    type: 'Sheep', 
    name: 'Cotton', 
    dob: '2023-03-28', 
    sex: 'F', 
    notes: 'Young ewe, first shearing, Merino breed',
    breed: 'Merino',
    weight: 62,
    tagNumber: 'SH002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-14', type: 'First Shearing', notes: 'First shearing completed, 5.2kg wool' },
      { date: '2025-01-30', type: 'Health Check', notes: 'Good condition, ready for breeding' }
    ],
    woolProduction: [
      { date: '2025-02-14', amount: 5.2, quality: 'Good' }
    ]
  },

  // Pedigree Sheep
  { 
    id: 11, 
    type: 'Pedigree Sheep', 
    name: 'Champion', 
    dob: '2022-04-15', 
    sex: 'M', 
    notes: 'Prize-winning ram, Suffolk breed, excellent genetics',
    breed: 'Suffolk',
    weight: 110,
    tagNumber: 'PS001',
    parentId: null,
    pedigreeNumber: 'SF2021-001',
    healthRecords: [
      { date: '2025-02-12', type: 'Health Check', notes: 'Excellent condition, ready for breeding season' },
      { date: '2025-01-28', type: 'Vaccination', notes: 'Annual vaccinations completed' }
    ],
    breedingRecords: [
      { date: '2025-02-03', female: 'Princess', success: true, notes: 'Successful breeding' },
      { date: '2025-01-18', female: 'Queen', success: true, notes: 'Successful breeding' }
    ]
  },
  { 
    id: 12, 
    type: 'Pedigree Sheep', 
    name: 'Princess', 
    dob: '2022-06-20', 
    sex: 'F', 
    notes: 'Show quality ewe, Suffolk breed, excellent bloodline',
    breed: 'Suffolk',
    weight: 85,
    tagNumber: 'PS002',
    parentId: null,
    pedigreeNumber: 'SF2022-005',
    healthRecords: [
      { date: '2025-02-10', type: 'Pregnancy Check', notes: 'Confirmed pregnant, due in July' },
      { date: '2025-01-26', type: 'Health Check', notes: 'Excellent condition' }
    ]
  },

  // Chickens
  { 
    id: 13, 
    type: 'Chicken', 
    name: 'Henrietta', 
    dob: '2023-04-12', 
    sex: 'F', 
    notes: 'Rhode Island Red, excellent layer, friendly temperament',
    breed: 'Rhode Island Red',
    weight: 2.8,
    tagNumber: 'CH001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-15', type: 'Health Check', notes: 'Good condition, laying regularly' },
      { date: '2025-01-20', type: 'Vaccination', notes: 'Routine vaccinations completed' }
    ],
    eggProduction: [
      { date: '2025-02-15', count: 1, size: 'Large', quality: 'A' },
      { date: '2025-02-14', count: 1, size: 'Large', quality: 'A' },
      { date: '2025-02-13', count: 0, size: null, quality: null }
    ]
  },
  { 
    id: 14, 
    type: 'Chicken', 
    name: 'Clucky', 
    dob: '2023-05-08', 
    sex: 'F', 
    notes: 'Leghorn breed, high egg production, white eggs',
    breed: 'Leghorn',
    weight: 2.2,
    tagNumber: 'CH002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-14', type: 'Health Check', notes: 'Excellent condition, very active' },
      { date: '2025-01-18', type: 'Deworming', notes: 'Routine deworming completed' }
    ],
    eggProduction: [
      { date: '2025-02-15', count: 1, size: 'Large', quality: 'A+' },
      { date: '2025-02-14', count: 1, size: 'Large', quality: 'A' },
      { date: '2025-02-13', count: 1, size: 'Medium', quality: 'A' }
    ]
  },

  // Poultry (General)
  { 
    id: 15, 
    type: 'Poultry', 
    name: 'Rooster', 
    dob: '2022-08-30', 
    sex: 'M', 
    notes: 'Dominant rooster, Rhode Island Red, good protector',
    breed: 'Rhode Island Red',
    weight: 4.2,
    tagNumber: 'PO001',
    parentId: null,
    healthRecords: [
      { date: '2025-02-13', type: 'Health Check', notes: 'Excellent condition, very protective of flock' },
      { date: '2025-01-25', type: 'Vaccination', notes: 'Annual vaccinations completed' }
    ]
  },
  { 
    id: 16, 
    type: 'Poultry', 
    name: 'Goldie', 
    dob: '2023-06-15', 
    sex: 'F', 
    notes: 'Buff Orpington, broody hen, excellent mother',
    breed: 'Buff Orpington',
    weight: 3.5,
    tagNumber: 'PO002',
    parentId: null,
    healthRecords: [
      { date: '2025-02-11', type: 'Health Check', notes: 'Good condition, currently brooding' },
      { date: '2025-01-22', type: 'Vaccination', notes: 'Routine vaccinations completed' }
    ],
    eggProduction: [
      { date: '2025-02-15', count: 0, size: null, quality: null, notes: 'Brooding' },
      { date: '2025-02-14', count: 0, size: null, quality: null, notes: 'Brooding' },
      { date: '2025-02-13', count: 0, size: null, quality: null, notes: 'Brooding' }
    ]
  }
];

export const mockWorkers = [
  { 
    id: 1, 
    name: 'John Smith', 
    role: 'Farm Manager', 
    phone: '555-0101', 
    email: 'john@adonaifarm.com',
    startDate: '2020-03-15',
    specialties: ['Livestock Management', 'Farm Operations', 'Equipment Maintenance'],
    certifications: ['Livestock Handler Certification', 'Farm Safety Certification']
  },
  { 
    id: 2, 
    name: 'Mary Johnson', 
    role: 'Livestock Specialist', 
    phone: '555-0102', 
    email: 'mary@adonaifarm.com',
    startDate: '2021-07-20',
    specialties: ['Animal Health', 'Breeding Programs', 'Nutrition Planning'],
    certifications: ['Veterinary Assistant', 'Animal Nutrition Specialist']
  },
  { 
    id: 3, 
    name: 'David Brown', 
    role: 'Equipment Operator', 
    phone: '555-0103', 
    email: 'david@adonaifarm.com',
    startDate: '2022-01-10',
    specialties: ['Heavy Equipment', 'Maintenance', 'Field Operations'],
    certifications: ['Heavy Equipment License', 'Welding Certification']
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    role: 'Dairy Technician', 
    phone: '555-0104', 
    email: 'sarah@adonaifarm.com',
    startDate: '2023-05-12',
    specialties: ['Milking Operations', 'Dairy Quality Control', 'Equipment Sanitization'],
    certifications: ['Dairy Quality Assurance', 'Food Safety Certification']
  }
];

export const mockGalleryImages = [
  // Farm Infrastructure Photos - Using available frontend images
  { id: 1, filename: 'farm-2.jpg', path: '/images/farm-2.jpg', fallbackPath: '/images/hero-farm.jpg', uploaded_at: '2025-01-15', category: 'farm', caption: 'Beautiful farm landscape with rolling hills' },
  { id: 2, filename: 'farm-3.jpg', path: '/images/farm-3.jpg', fallbackPath: '/images/farm-2.jpg', uploaded_at: '2025-01-16', category: 'farm', caption: 'Pastoral views with cattle grazing' },
  { id: 3, filename: 'farm-4.jpg', path: '/images/farm-4.jpg', fallbackPath: '/images/farm-3.jpg', uploaded_at: '2025-01-17', category: 'farm', caption: 'Modern farming operations and equipment' },
  { id: 4, filename: 'hero-farm.jpg', path: '/images/hero-farm.jpg', fallbackPath: '/images/farm-2.jpg', uploaded_at: '2025-01-18', category: 'farm', caption: 'Golden hour sunrise over tea plantation' },
  
  // Additional farm photos using the same images with different contexts
  { id: 5, filename: 'morning-pasture.jpg', path: '/images/farm-2.jpg', fallbackPath: '/images/hero-farm.jpg', uploaded_at: '2025-01-19', category: 'farm', caption: 'Morning dew on pasture land' },
  { id: 6, filename: 'cattle-grazing.jpg', path: '/images/farm-3.jpg', fallbackPath: '/images/farm-4.jpg', uploaded_at: '2025-01-20', category: 'animals', caption: 'Cattle peacefully grazing in open fields' },
  { id: 7, filename: 'farm-operations.jpg', path: '/images/farm-4.jpg', fallbackPath: '/images/farm-2.jpg', uploaded_at: '2025-01-21', category: 'farm', caption: 'Daily farm operations and maintenance' },
  { id: 8, filename: 'sunset-farm.jpg', path: '/images/hero-farm.jpg', fallbackPath: '/images/farm-3.jpg', uploaded_at: '2025-01-22', category: 'farm', caption: 'Spectacular sunset over the farm' },
  
  // Livestock and Animal Photos
  { id: 9, filename: 'dairy-cattle.jpg', path: '/images/farm-3.jpg', fallbackPath: '/images/farm-2.jpg', uplo uploaded_at: '2025-01-28', category: 'animals', caption: 'Beef cattle grazing in spring pasture' },
  { id: 15, filename: 'adonai8.jpg', path: '/uploads/Adonai/adonai8.jpg', fallbackPath: '/images/farm-4.jpg', uploaded_at: '2025-01-29', category: 'animals', caption: 'Goat kids playing in the barnyard' },
  { id: 16, filename: 'adonai9.jpg', path: '/uploads/Adonai/adonai9.jpg', fallbackPath: '/images/hero-farm.jpg', uploaded_at: '2025-01-30', category: 'animals', caption: 'Sheep flock during evening feeding' },
  { id: 17, filename: 'adonaix.jpg', path: '/uploads/Adonai/adonaix.jpg', fallbackPath: '/images/farm-2.jpg', uploaded_at: '2025-01-31', category: 'animals', caption: 'Dairy cows in the milking parlor' },
  { id: 18, filename: 'adonaixi.jpg', path: '/uploads/Adonai/adonaixi.jpg', fallbackPath: '/images/farm-3.jpg', uploaded_at: '2025-02-01', category: 'animals', caption: 'Rooster protecting the chicken flock' },
  { id: 19, filename: 'adonaixii.jpg', path: '/uploads/Adonai/adonaixii.jpg', fallbackPath: '/images/farm-4.jpg', uploaded_at: '2025-02-02', category: 'animals', caption: 'Young calves in the nursery area' },
  { id: 20, filename: 'adonaixiii.jpg', path: '/uploads/Adonai/adonaixiii.jpg', fallbackPath: '/images/hero-farm.jpg', uploaded_at: '2025-02-03', category: 'animals', caption: 'Mixed livestock enjoying sunny weather' }
];

// Farm Production Records
export const mockProductionRecords = {
  milk: [
    { date: '2025-02-15', totalLiters: 145.8, averageQuality: 'A', notes: 'Excellent production day' },
    { date: '2025-02-14', totalLiters: 142.3, averageQuality: 'A', notes: 'Consistent quality' },
    { date: '2025-02-13', totalLiters: 138.9, averageQuality: 'A', notes: 'Good production levels' }
  ],
  eggs: [
    { date: '2025-02-15', totalCount: 28, averageSize: 'Large', quality: 'A', notes: 'Peak laying season' },
    { date: '2025-02-14', totalCount: 26, averageSize: 'Large', quality: 'A', notes: 'Good production' },
    { date: '2025-02-13', totalCount: 24, averageSize: 'Medium', quality: 'A', notes: 'Slightly lower due to weather' }
  ],
  wool: [
    { date: '2025-02-16', totalKg: 8.5, quality: 'Premium', animal: 'Woolly', notes: 'Annual shearing - excellent quality' },
    { date: '2025-02-14', totalKg: 5.2, quality: 'Good', animal: 'Cotton', notes: 'First shearing - promising quality' }
  ]
};

// Feed and Nutrition Records
export const mockFeedRecords = [
  { 
    date: '2025-02-15', 
    animalType: 'Dairy Cattle', 
    feedType: 'Alfalfa Hay', 
    quantity: 120, 
    unit: 'kg', 
    cost: 180.00,
    supplier: 'Green Valley Feed Co.',
    notes: 'High quality hay for milk production'
  },
  { 
    date: '2025-02-15', 
    animalType: 'Beef Cattle', 
    feedType: 'Grass Hay', 
    quantity: 80, 
    unit: 'kg', 
    cost: 96.00,
    supplier: 'Local Hay Supplier',
    notes: 'Standard grazing supplement'
  },
  { 
    date: '2025-02-14', 
    animalType: 'Dairy Goats', 
    feedType: 'Goat Pellets', 
    quantity: 25, 
    unit: 'kg', 
    cost: 45.00,
    supplier: 'Farm Supply Store',
    notes: 'High protein pellets for lactating does'
  }
];

// Health and Veterinary Records
export const mockHealthRecords = [
  {
    date: '2025-02-15',
    animalId: 1,
    animalName: 'Bessie',
    type: 'Routine Check',
    veterinarian: 'Dr. Emily Carter',
    findings: 'Excellent health, no issues detected',
    treatment: 'None required',
    nextCheckup: '2025-05-15',
    cost: 75.00
  },
  {
    date: '2025-02-14',
    animalId: 3,
    animalName: 'Thunder',
    type: 'Breeding Soundness Exam',
    veterinarian: 'Dr. Michael Ross',
    findings: 'Excellent breeding condition',
    treatment: 'Vitamin supplement recommended',
    nextCheckup: '2025-08-14',
    cost: 150.00
  },
  {
    date: '2025-02-13',
    animalId: 5,
    animalName: 'Nanny',
    type: 'Vaccination',
    veterinarian: 'Dr. Emily Carter',
    findings: 'Healthy, ready for vaccination',
    treatment: 'CDT vaccine administered',
    nextCheckup: '2025-02-13',
    cost: 35.00
  }
];

// Breeding Records
export const mockBreedingRecords = [
  {
    id: 1,
    date: '2025-02-01',
    maleId: 3,
    maleName: 'Thunder',
    femaleId: 4,
    femaleName: 'Bella',
    method: 'Natural',
    success: true,
    expectedDue: '2025-11-01',
    notes: 'First breeding for Bella, went smoothly',
    veterinarian: 'Dr. Michael Ross'
  },
  {
    id: 2,
    date: '2025-01-20',
    maleId: 7,
    maleName: 'Buck',
    femaleId: 8,
    femaleName: 'Ruby',
    method: 'Natural',
    success: true,
    expectedDue: '2025-07-20',
    notes: 'Successful breeding, Ruby showing good signs',
    veterinarian: 'Dr. Emily Carter'
  },
  {
    id: 3,
    date: '2025-01-15',
    maleId: 11,
    maleName: 'Champion',
    femaleId: 12,
    femaleName: 'Princess',
    method: 'Natural',
    success: true,
    expectedDue: '2025-07-15',
    notes: 'Pedigree breeding for show quality offspring',
    veterinarian: 'Dr. Michael Ross'
  }
];

// Session management and security enhancements
export function refreshSession() {
  const currentUser = getCurrentUser();
  if (currentUser && isAuthenticated()) {
    const newExpiry = Date.now() + (8 * 60 * 60 * 1000); // Extend by 8 hours
    localStorage.setItem('adonai_session_expiry', newExpiry.toString());
    
    // Update user object with new expiry
    const updatedUser = { ...currentUser, sessionExpiry: newExpiry };
    localStorage.setItem('adonai_current_user', JSON.stringify(updatedUser));
    return true;
  }
  return false;
}

// Check if session is about to expire (within 30 minutes)
export function isSessionExpiringSoon() {
  const sessionExpiry = localStorage.getItem('adonai_session_expiry');
  if (!sessionExpiry) return false;
  
  const thirtyMinutes = 30 * 60 * 1000;
  return (parseInt(sessionExpiry) - Date.now()) < thirtyMinutes;
}

// Duplicate hasPermission function removed - using the one defined earlier

// Security audit log (for demo purposes)
export function logSecurityEvent(event, details = {}) {
  const timestamp = new Date().toISOString();
  const currentUser = getCurrentUser();
  
  const logEntry = {
    timestamp,
    event,
    user: currentUser ? currentUser.username : 'anonymous',
    details,
    userAgent: navigator.userAgent,
    ip: 'client-side' // In production, this would come from server
  };
  
  // Store security logs (in production, send to server)
  const logs = JSON.parse(localStorage.getItem('adonai_security_logs') || '[]');
  logs.push(logEntry);
  
  // Keep only last 100 logs
  if (logs.length > 100) {
    logs.splice(0, logs.length - 100);
  }
  
  localStorage.setItem('adonai_security_logs', JSON.stringify(logs));
  console.log('Security Event:', logEntry);
}

// Enhanced logout function is already defined above

// Force logout all sessions (useful for security)
export function forceLogoutAllSessions() {
  logSecurityEvent('force_logout_all', { reason: 'security_measure' });
  logout();
}

// Check for suspicious activity
export function checkSuspiciousActivity() {
  const logs = JSON.parse(localStorage.getItem('adonai_security_logs') || '[]');
  const recentLogs = logs.filter(log => 
    Date.now() - new Date(log.timestamp).getTime() < 60 * 60 * 1000 // Last hour
  );
  
  const failedLogins = recentLogs.filter(log => log.event === 'login_failed').length;
  
  if (failedLogins > 5) {
    logSecurityEvent('suspicious_activity', { 
      failedLogins, 
      timeframe: '1_hour',
      action: 'account_locked'
    });
    return true;
  }
  
  return false;
}