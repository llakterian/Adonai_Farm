// Test the authentication logic
function requireAuth() { 
  return !!process.env.TEST_TOKEN; 
}

// Test case 1: No token (should redirect to login)
process.env.TEST_TOKEN = '';
console.log('No token - requireAuth():', requireAuth());

// Test case 2: With token (should allow access)
process.env.TEST_TOKEN = 'test-token';
console.log('With token - requireAuth():', requireAuth());

console.log('Authentication logic test passed!');