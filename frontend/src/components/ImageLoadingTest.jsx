import React, { useState, useEffect } from 'react';
import ImageService from '../services/ImageService.js';

/**
 * ImageLoadingTest - Component to test and verify image loading in production
 * Useful for debugging deployment issues and verifying image paths
 */
const ImageLoadingTest = ({ onClose }) => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState({});

  useEffect(() => {
    // Gather deployment information
    const info = {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isStaticDeployment: ImageService.isStaticDeployment(),
      useLocalStorage: localStorage.getItem('use-local-storage') === 'true',
      userAgent: navigator.userAgent,
      isOnline: navigator.onLine
    };
    setDeploymentInfo(info);
  }, []);

  const testImageLoading = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test images to verify
    const testImages = [
      'adonai1.jpg',
      'adonai2.jpg', 
      'farm-1.jpg',
      'farm-2.jpg',
      'nonexistent.jpg' // This should fail and test fallbacks
    ];

    const results = [];

    for (const filename of testImages) {
      const result = {
        filename,
        primaryUrl: ImageService.getImageUrl(filename),
        fallbackUrl: ImageService.getFallbackUrl(filename),
        status: 'testing',
        loadTime: 0,
        error: null
      };

      try {
        const startTime = Date.now();
        const success = await testImageLoad(result.primaryUrl);
        const loadTime = Date.now() - startTime;

        if (success) {
          result.status = 'success';
          result.loadTime = loadTime;
        } else {
          // Test fallback
          const fallbackSuccess = await testImageLoad(result.fallbackUrl);
          if (fallbackSuccess) {
            result.status = 'fallback-success';
            result.loadTime = loadTime;
          } else {
            result.status = 'failed';
            result.error = 'Both primary and fallback failed';
          }
        }
      } catch (error) {
        result.status = 'error';
        result.error = error.message;
      }

      results.push(result);
      setTestResults([...results]); // Update UI progressively
    }

    setIsLoading(false);
  };

  const testImageLoad = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'fallback-success': return '#FF9800';
      case 'failed': return '#F44336';
      case 'error': return '#9C27B0';
      case 'testing': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'fallback-success': return '⚠️';
      case 'failed': return '❌';
      case 'error': return '🚫';
      case 'testing': return '🔄';
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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🔍 Image Loading Test</h2>
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

        {/* Deployment Information */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>🌐 Deployment Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
            <div><strong>Hostname:</strong> {deploymentInfo.hostname}</div>
            <div><strong>Protocol:</strong> {deploymentInfo.protocol}</div>
            <div><strong>Static Deployment:</strong> {deploymentInfo.isStaticDeployment ? 'Yes' : 'No'}</div>
            <div><strong>Local Storage Mode:</strong> {deploymentInfo.useLocalStorage ? 'Yes' : 'No'}</div>
            <div><strong>Online:</strong> {deploymentInfo.isOnline ? 'Yes' : 'No'}</div>
            <div><strong>Mobile:</strong> {/Mobile|Android|iPhone|iPad/i.test(deploymentInfo.userAgent) ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Test Controls */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={testImageLoading}
            disabled={isLoading}
            style={{
              background: isLoading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoading ? '🔄 Testing Images...' : '🚀 Start Image Test'}
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h3>📊 Test Results</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    border: `2px solid ${getStatusColor(result.status)}`,
                    borderRadius: '4px',
                    padding: '15px',
                    backgroundColor: result.status === 'success' ? '#f8fff8' : 
                                   result.status === 'fallback-success' ? '#fff8f0' :
                                   result.status === 'failed' ? '#fff8f8' : '#f8f8ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>
                      {getStatusIcon(result.status)}
                    </span>
                    <strong>{result.filename}</strong>
                    <span style={{ 
                      marginLeft: 'auto', 
                      color: getStatusColor(result.status),
                      fontWeight: 'bold'
                    }}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div><strong>Primary URL:</strong> {result.primaryUrl}</div>
                    <div><strong>Fallback URL:</strong> {result.fallbackUrl}</div>
                    {result.loadTime > 0 && (
                      <div><strong>Load Time:</strong> {result.loadTime}ms</div>
                    )}
                    {result.error && (
                      <div style={{ color: '#f44336' }}><strong>Error:</strong> {result.error}</div>
                    )}
                  </div>

                  {/* Show actual image if it loaded */}
                  {result.status === 'success' && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={result.primaryUrl} 
                        alt={result.filename}
                        style={{ 
                          maxWidth: '100px', 
                          maxHeight: '100px', 
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
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
          <h4>📋 How to Use This Test</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>Success (✅):</strong> Image loaded from primary URL</li>
            <li><strong>Fallback Success (⚠️):</strong> Primary failed, fallback worked</li>
            <li><strong>Failed (❌):</strong> Both primary and fallback failed</li>
            <li><strong>Error (🚫):</strong> Network or other error occurred</li>
          </ul>
          <p style={{ margin: '10px 0 0 0' }}>
            <strong>Tip:</strong> If images are failing, check that the build script copied images to /uploads/Adonai/ 
            and that your Netlify deployment includes the uploads directory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageLoadingTest;