// Netlify serverless function for gallery management
const mockPhotos = [
  { id: 1, filename: 'farm-sunrise.jpg', path: '/images/hero-farm.jpg', uploaded_at: '2024-01-15T08:30:00Z' },
  { id: 2, filename: 'cattle-grazing.jpg', path: '/images/farm-2.jpg', uploaded_at: '2024-01-14T14:20:00Z' },
  { id: 3, filename: 'pastoral-view.jpg', path: '/images/farm-3.jpg', uploaded_at: '2024-01-13T16:45:00Z' },
  { id: 4, filename: 'farm-operations.jpg', path: '/images/farm-4.jpg', uploaded_at: '2024-01-12T10:15:00Z' }
];

let photos = [...mockPhotos];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/gallery', '');
  const method = event.httpMethod;

  try {
    // GET /api/gallery - Get all photos
    if (method === 'GET' && !path) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(photos)
      };
    }

    // POST /api/gallery/upload - Upload photo (mock)
    if (method === 'POST' && path === '/upload') {
      // In a real implementation, you'd handle file upload here
      // For demo purposes, we'll simulate adding a photo
      const newPhoto = {
        id: Math.max(...photos.map(p => p.id), 0) + 1,
        filename: `uploaded-photo-${Date.now()}.jpg`,
        path: `/images/hero-farm.jpg`, // Mock path
        uploaded_at: new Date().toISOString(),
        size: Math.floor(Math.random() * 1000000) + 500000 // Mock size
      };
      
      photos.unshift(newPhoto); // Add to beginning
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          url: newPhoto.path, 
          filename: newPhoto.filename,
          message: 'Photo uploaded successfully (demo)' 
        })
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