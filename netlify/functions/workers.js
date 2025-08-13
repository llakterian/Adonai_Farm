// Netlify serverless function for worker management
const mockWorkers = [
  { id: 1, name: 'John Kamau', employee_id: 'EMP001', role: 'Farm Worker', hourly_rate: 500, phone: '+254712345678' },
  { id: 2, name: 'Mary Wanjiku', employee_id: 'EMP002', role: 'Milkman', hourly_rate: 600, phone: '+254723456789' },
  { id: 3, name: 'Peter Mwangi', employee_id: 'EMP003', role: 'Driver', hourly_rate: 700, phone: '+254734567890' },
  { id: 4, name: 'Grace Akinyi', employee_id: 'EMP004', role: 'Supervisor', hourly_rate: 800, phone: '+254745678901' }
];

let workers = [...mockWorkers];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/workers', '');
  const method = event.httpMethod;

  try {
    // GET /api/workers - Get all workers
    if (method === 'GET' && !path) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(workers)
      };
    }

    // POST /api/workers - Add new worker
    if (method === 'POST' && !path) {
      const { name, employee_id, role, hourly_rate, phone } = JSON.parse(event.body);
      
      // Check if employee_id already exists
      if (workers.find(w => w.employee_id === employee_id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Employee ID already exists' })
        };
      }
      
      const newWorker = {
        id: Math.max(...workers.map(w => w.id), 0) + 1,
        name,
        employee_id,
        role,
        hourly_rate: parseFloat(hourly_rate) || 500,
        phone
      };
      workers.push(newWorker);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(newWorker)
      };
    }

    // PUT /api/workers/:id - Update worker
    if (method === 'PUT' && path) {
      const id = parseInt(path.replace('/', ''));
      const { name, employee_id, role, hourly_rate, phone } = JSON.parse(event.body);
      
      const workerIndex = workers.findIndex(w => w.id === id);
      if (workerIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Worker not found' })
        };
      }
      
      // Check if employee_id already exists (excluding current worker)
      if (workers.find(w => w.employee_id === employee_id && w.id !== id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Employee ID already exists' })
        };
      }
      
      workers[workerIndex] = { 
        id, 
        name, 
        employee_id, 
        role, 
        hourly_rate: parseFloat(hourly_rate) || 500, 
        phone 
      };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(workers[workerIndex])
      };
    }

    // DELETE /api/workers/:id - Delete worker
    if (method === 'DELETE' && path) {
      const id = parseInt(path.replace('/', ''));
      const workerIndex = workers.findIndex(w => w.id === id);
      
      if (workerIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Worker not found' })
        };
      }
      
      workers.splice(workerIndex, 1);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Worker deleted successfully' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};