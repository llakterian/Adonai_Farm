// CSV Import/Export Utilities for Farm Management System

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header] || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

/**
 * Parse CSV string to array of objects
 */
export function csvToArray(csvString, expectedHeaders) {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  // Parse headers
  const headers = parseCSVRow(lines[0]);
  
  // Validate headers
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Parse data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVRow(lines[i]);
      const item = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      data.push(item);
    }
  }

  return data;
}

/**
 * Parse a single CSV row handling quotes and commas
 */
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export Animals to CSV
 */
export function exportAnimalsCSV(animals) {
  const headers = ['id', 'type', 'name', 'dob', 'sex', 'notes', 'created_at'];
  const csvContent = arrayToCSV(animals, headers);
  const filename = `adonai-animals-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Workers to CSV
 */
export function exportWorkersCSV(workers) {
  const headers = ['id', 'name', 'employee_id', 'role', 'hourly_rate', 'phone'];
  const csvContent = arrayToCSV(workers, headers);
  const filename = `adonai-workers-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Infrastructure to CSV
 */
export function exportInfrastructureCSV(infrastructure) {
  const headers = ['id', 'category', 'type', 'name', 'model', 'year', 'purchase_date', 'purchase_cost', 'current_value', 'status', 'usage_hours', 'fuel_consumption', 'notes'];
  const csvContent = arrayToCSV(infrastructure, headers);
  const filename = `adonai-infrastructure-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Users to CSV (admin only)
 */
export function exportUsersCSV(users) {
  const headers = ['id', 'username', 'name', 'email', 'role', 'active', 'created_at'];
  const csvContent = arrayToCSV(users, headers);
  const filename = `adonai-users-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export Time Entries to CSV
 */
export function exportTimeEntriesCSV(timeEntries, workers) {
  // Enrich time entries with worker names
  const enrichedEntries = timeEntries.map(entry => {
    const worker = workers.find(w => w.id === entry.worker_id);
    return {
      ...entry,
      worker_name: worker ? worker.name : 'Unknown Worker',
      worker_employee_id: worker ? worker.employee_id : 'Unknown'
    };
  });

  const headers = ['id', 'worker_id', 'worker_name', 'worker_employee_id', 'clock_in', 'clock_out', 'hours_worked', 'notes'];
  const csvContent = arrayToCSV(enrichedEntries, headers);
  const filename = `adonai-time-entries-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Import Animals from CSV
 */
export function importAnimalsCSV(csvString, existingAnimals) {
  const requiredHeaders = ['type', 'name', 'sex'];
  const optionalHeaders = ['dob', 'notes'];
  const allHeaders = [...requiredHeaders, ...optionalHeaders];
  
  const importedData = csvToArray(csvString, requiredHeaders);
  
  // Validate and process data
  const processedAnimals = importedData.map((item, index) => {
    const errors = [];
    
    // Validate required fields
    if (!item.type || !item.type.trim()) {
      errors.push('Type is required');
    }
    if (!item.name || !item.name.trim()) {
      errors.push('Name is required');
    }
    if (!item.sex || !['M', 'F', 'Male', 'Female'].includes(item.sex)) {
      errors.push('Sex must be M, F, Male, or Female');
    }
    
    // Validate date format if provided
    if (item.dob && item.dob.trim()) {
      const date = new Date(item.dob);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format for date of birth');
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Row ${index + 2}: ${errors.join(', ')}`);
    }
    
    // Generate new ID
    const maxId = Math.max(...existingAnimals.map(a => a.id), 0);
    
    return {
      id: maxId + index + 1,
      type: item.type.trim(),
      name: item.name.trim(),
      dob: item.dob ? item.dob.trim() : '',
      sex: item.sex === 'Male' ? 'M' : item.sex === 'Female' ? 'F' : item.sex.toUpperCase(),
      notes: item.notes ? item.notes.trim() : '',
      created_at: new Date().toISOString().split('T')[0]
    };
  });
  
  return processedAnimals;
}

/**
 * Import Workers from CSV
 */
export function importWorkersCSV(csvString, existingWorkers) {
  const requiredHeaders = ['name', 'employee_id', 'role'];
  const optionalHeaders = ['hourly_rate', 'phone'];
  
  const importedData = csvToArray(csvString, requiredHeaders);
  
  // Validate and process data
  const processedWorkers = importedData.map((item, index) => {
    const errors = [];
    
    // Validate required fields
    if (!item.name || !item.name.trim()) {
      errors.push('Name is required');
    }
    if (!item.employee_id || !item.employee_id.trim()) {
      errors.push('Employee ID is required');
    }
    if (!item.role || !item.role.trim()) {
      errors.push('Role is required');
    }
    
    // Check for duplicate employee ID
    const existingWorker = existingWorkers.find(w => w.employee_id === item.employee_id.trim());
    if (existingWorker) {
      errors.push(`Employee ID ${item.employee_id} already exists`);
    }
    
    // Validate hourly rate if provided
    if (item.hourly_rate && item.hourly_rate.trim()) {
      const rate = parseFloat(item.hourly_rate);
      if (isNaN(rate) || rate < 0) {
        errors.push('Hourly rate must be a positive number');
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Row ${index + 2}: ${errors.join(', ')}`);
    }
    
    // Generate new ID
    const maxId = Math.max(...existingWorkers.map(w => w.id), 0);
    
    return {
      id: maxId + index + 1,
      name: item.name.trim(),
      employee_id: item.employee_id.trim(),
      role: item.role.trim(),
      hourly_rate: item.hourly_rate ? parseFloat(item.hourly_rate) : 500,
      phone: item.phone ? item.phone.trim() : ''
    };
  });
  
  return processedWorkers;
}

/**
 * Validate CSV file before processing
 */
export function validateCSVFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      reject(new Error('Please select a CSV file'));
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      reject(new Error('File size must be less than 5MB'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}