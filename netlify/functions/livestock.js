// Netlify serverless function for livestock management
const mockAnimals = [
  { id: 1, type: 'Dairy Cattle', name: 'Bessie', dob: '2022-03-15', sex: 'F', notes: 'High milk producer' },
  { id: 2, type: 'Beef Cattle', name: 'Thunder', dob: '2021-08-20', sex: 'M', notes: 'Prize bull' },
  { id: 3, type: 'Dairy Goat', name: 'Nanny', dob: '2023-01-10', sex: 'F', notes: 'Gentle temperament' },
  { id: 4, type: 'Sheep', name: 'Woolly', dob: '2022-11-05', sex: 'F', notes: 'Excellent wool quality' }
];

let animals = [...mockAnimals];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/livestock', '');
  const method = event.httpMethod;

  try {
    // GET /api/livestock - Get all animals
    if (method === 'GET' && !path) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(animals)
      };
    }

    // POST /api/livestock - Add new animal
    if (method === 'POST' && !path) {
      const { type, name, dob, sex, notes } = JSON.parse(event.body);
      const newAnimal = {
        id: Math.max(...animals.map(a => a.id), 0) + 1,
        type,
        name,
        dob,
        sex,
        notes
      };
      animals.push(newAnimal);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(newAnimal)
      };
    }

    // PUT /api/livestock/:id - Update animal
    if (method === 'PUT' && path) {
      const id = parseInt(path.replace('/', ''));
      const { type, name, dob, sex, notes } = JSON.parse(event.body);
      
      const animalIndex = animals.findIndex(a => a.id === id);
      if (animalIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Animal not found' })
        };
      }
      
      animals[animalIndex] = { id, type, name, dob, sex, notes };
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(animals[animalIndex])
      };
    }

    // DELETE /api/livestock/:id - Delete animal
    if (method === 'DELETE' && path) {
      const id = parseInt(path.replace('/', ''));
      const animalIndex = animals.findIndex(a => a.id === id);
      
      if (animalIndex === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Animal not found' })
        };
      }
      
      animals.splice(animalIndex, 1);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Animal deleted successfully' })
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