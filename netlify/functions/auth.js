// Netlify serverless function for authentication
exports.handler = async (event, context) => {
  console.log('Auth function called:', event.httpMethod, event.path);
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Request body:', event.body);
    const { username, password } = JSON.parse(event.body || '{}');
    
    console.log('Login attempt for username:', username);
    
    // Simple authentication (in production, use proper auth)
    if (username === 'admin' && password === 'adonai123') {
      const token = 'demo-token-' + Date.now();
      console.log('Login successful, token:', token);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          token: token,
          message: 'Login successful' 
        })
      };
    } else {
      console.log('Invalid credentials provided');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error: ' + error.message })
    };
  }
};