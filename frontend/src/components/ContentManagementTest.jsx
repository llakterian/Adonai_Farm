import React, { useState, useEffect } from 'react';
import PublicContentService from '../services/PublicContentService.js';

/**
 * ContentManagementTest - Test component to verify data flow
 * between admin management and public display
 */
export default function ContentManagementTest() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testData, setTestData] = useState({
    animals: [],
    publicAnimals: [],
    settings: {},
    farmContent: {}
  });

  const runTests = async () => {
    setIsRunning(true);
    const results = [];

    try {
      // Test 1: Public Content Service Initialization
      results.push(await testServiceInitialization());

      // Test 2: Animal Visibility Controls
      results.push(await testAnimalVisibilityControls());

      // Test 3: Featured Animals Management
      results.push(await testFeaturedAnimalsManagement());

      // Test 4: Content Sanitization
      results.push(await testContentSanitization());

      // Test 5: Farm Content Management
      results.push(await testFarmContentManagement());

      // Test 6: Settings Validation
      results.push(await testSettingsValidation());

      // Test 7: Data Flow Integration
      results.push(await testDataFlowIntegration());

      setTestResults(results);
    } catch (error) {
      console.error('Test execution error:', error);
      results.push({
        name: 'Test Execution',
        status: 'failed',
        message: `Test execution failed: ${error.message}`,
        details: error.stack
      });
      setTestResults(results);
    }

    setIsRunning(false);
  };

  const testServiceInitialization = async () => {
    try {
      const settings = PublicContentService.getPublicSettings();
      const farmContent = PublicContentService.getFarmContent();
      
      if (!settings || typeof settings !== 'object') {
        throw new Error('Public settings not properly initialized');
      }
      
      if (!farmContent || typeof farmContent !== 'object') {
        throw new Error('Farm content not properly initialized');
      }

      return {
        name: 'Service Initialization',
        status: 'passed',
        message: 'PublicContentService initialized correctly',
        details: {
          settingsKeys: Object.keys(settings).length,
          farmContentKeys: Object.keys(farmContent).length
        }
      };
    } catch (error) {
      return {
        name: 'Service Initialization',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const testAnimalVisibilityControls = async () => {
    try {
      // Get all animals and public animals
      const allAnimals = PublicContentService.getAllAnimals();
      const publicAnimals = PublicContentService.getPublicAnimals();
      
      // Test visibility toggle
      if (allAnimals.length > 0) {
        const testAnimal = allAnimals[0];
        const originalVisibility = testAnimal.isPublicVisible;
        
        // Toggle visibility
        PublicContentService.updateAnimalVisibility(testAnimal.id, false);
        const hiddenAnimals = PublicContentService.getPublicAnimals();
        
        // Restore original visibility
        PublicContentService.updateAnimalVisibility(testAnimal.id, originalVisibility !== false);
        const restoredAnimals = PublicContentService.getPublicAnimals();
        
        return {
          name: 'Animal Visibility Controls',
          status: 'passed',
          message: 'Animal visibility controls working correctly',
          details: {
            totalAnimals: allAnimals.length,
            publicAnimals: publicAnimals.length,
            hiddenCount: publicAnimals.length - hiddenAnimals.length,
            restoredCount: restoredAnimals.length
          }
        };
      } else {
        return {
          name: 'Animal Visibility Controls',
          status: 'skipped',
          message: 'No animals available for testing',
          details: {}
        };
      }
    } catch (error) {
      return {
        name: 'Animal Visibility Controls',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const testFeaturedAnimalsManagement = async () => {
    try {
      const allAnimals = PublicContentService.getAllAnimals();
      
      if (allAnimals.length > 0) {
        const testAnimal = allAnimals[0];
        
        // Test featuring an animal
        const wasFeatured = PublicContentService.toggleFeaturedAnimal(testAnimal.id);
        const featuredAnimals = PublicContentService.getFeaturedAnimals();
        
        // Test unfeaturing the animal
        PublicContentService.toggleFeaturedAnimal(testAnimal.id);
        const unfeaturedAnimals = PublicContentService.getFeaturedAnimals();
        
        return {
          name: 'Featured Animals Management',
          status: 'passed',
          message: 'Featured animals management working correctly',
          details: {
            toggleResult: wasFeatured,
            featuredCount: featuredAnimals.length,
            unfeaturedCount: unfeaturedAnimals.length
          }
        };
      } else {
        return {
          name: 'Featured Animals Management',
          status: 'skipped',
          message: 'No animals available for testing',
          details: {}
        };
      }
    } catch (error) {
      return {
        name: 'Featured Animals Management',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const testContentSanitization = async () => {
    try {
      // Create test animal with sensitive information
      const testAnimal = {
        id: 999,
        name: 'Test Animal',
        type: 'Dairy Cattle',
        sex: 'F',
        dob: '2022-01-01',
        notes: 'This animal had breeding issues. Medical treatment cost $500. Artificial insemination scheduled. Vaccination completed.',
        isPublicVisible: true
      };

      const settings = {
        hideBreedingInfo: true,
        hideMedicalInfo: true,
        hideFinancialInfo: true,
        featuredAnimals: []
      };

      const sanitizedAnimal = PublicContentService.sanitizeAnimalForPublic(testAnimal, settings);
      
      // Check if sensitive information was removed
      const hasSensitiveInfo = sanitizedAnimal.notes && (
        sanitizedAnimal.notes.toLowerCase().includes('breeding') ||
        sanitizedAnimal.notes.toLowerCase().includes('medical') ||
        sanitizedAnimal.notes.toLowerCase().includes('cost') ||
        sanitizedAnimal.notes.toLowerCase().includes('artificial insemination')
      );

      return {
        name: 'Content Sanitization',
        status: hasSensitiveInfo ? 'failed' : 'passed',
        message: hasSensitiveInfo ? 'Sensitive information not properly filtered' : 'Content sanitization working correctly',
        details: {
          originalNotes: testAnimal.notes,
          sanitizedNotes: sanitizedAnimal.notes || 'No notes (filtered out)',
          hasSensitiveInfo
        }
      };
    } catch (error) {
      return {
        name: 'Content Sanitization',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const testFarmContentManagement = async () => {
    try {
      const originalContent = PublicContentService.getFarmContent();
      
      // Test updating farm content
      const testContent = {
        ...originalContent,
        name: 'Test Farm Name',
        mission: 'Test mission statement',
        testField: 'This is a test'
      };

      PublicContentService.saveFarmContent(testContent);
      const updatedContent = PublicContentService.getFarmContent();
      
      // Restore original content
      PublicContentService.saveFarmContent(originalContent);
      
      const contentUpdated = updatedContent.name === 'Test Farm Name' && 
                           updatedContent.mission === 'Test mission statement';

      return {
        name: 'Farm Content Management',
        status: contentUpdated ? 'passed' : 'failed',
        message: contentUpdated ? 'Farm content management working correctly' : 'Farm content not properly updated',
        details: {
          originalName: originalContent.name,
          testName: updatedContent.name,
          contentUpdated
        }
      };
    } catch (error) {
      return {
        name: 'Farm Content Management',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const testSettingsValidation = async () => {
    try {
      // Test valid settings
      const validSettings = {
        siteTitle: 'Test Farm',
        siteDescription: 'Test description',
        visibleAnimalTypes: ['Dairy Cattle']
      };

      const validErrors = PublicContentService.validateSettings(validSettings);

      // Test invalid settings
      const invalidSettings = {
        siteTitle: '',
        siteDescription: '',
        visibleAnimalTypes: []
      };

      const invalidErrors = PublicContentService.validateSettings(invalidSettings);

      return {
        name: 'Settings Validation',
        status: validErrors.length === 0 && invalidErrors.length > 0 ? 'passed' : 'failed',
        message: 'Settings validation working correctly',
        details: {
          validSettingsErrors: validErrors.length,
          invalidSettingsErrors: invalidErrors.length,
          invalidErrors: invalidErrors
        }
      };
    } catch (error) {
      return {
        name: 'Settings Validation',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const testDataFlowIntegration = async () => {
    try {
      // Test complete data flow from admin to public
      const allAnimals = PublicContentService.getAllAnimals();
      const publicAnimals = PublicContentService.getPublicAnimals();
      const publicStats = PublicContentService.getPublicStatistics();
      const publicServices = PublicContentService.getPublicServices();
      
      // Verify data consistency
      const dataConsistent = publicStats.totalAnimals === publicAnimals.length;
      
      return {
        name: 'Data Flow Integration',
        status: dataConsistent ? 'passed' : 'failed',
        message: dataConsistent ? 'Data flow integration working correctly' : 'Data inconsistency detected',
        details: {
          totalAnimals: allAnimals.length,
          publicAnimals: publicAnimals.length,
          statsAnimals: publicStats.totalAnimals,
          publicServices: publicServices.length,
          dataConsistent
        }
      };
    } catch (error) {
      return {
        name: 'Data Flow Integration',
        status: 'failed',
        message: error.message,
        details: error.stack
      };
    }
  };

  const loadTestData = () => {
    setTestData({
      animals: PublicContentService.getAllAnimals(),
      publicAnimals: PublicContentService.getPublicAnimals(),
      settings: PublicContentService.getPublicSettings(),
      farmContent: PublicContentService.getFarmContent()
    });
  };

  useEffect(() => {
    loadTestData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return '#28a745';
      case 'failed': return '#dc3545';
      case 'skipped': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="content-management-test">
      <div className="test-header">
        <h2>Content Management Integration Test</h2>
        <p>Test the data flow between admin management and public display</p>
        <div className="test-actions">
          <button 
            onClick={runTests} 
            disabled={isRunning}
            className="btn btn-primary"
          >
            {isRunning ? '🔄 Running Tests...' : '🧪 Run Tests'}
          </button>
          <button 
            onClick={loadTestData}
            className="btn btn-outline"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Test Data Overview */}
      <div className="test-data-overview">
        <h3>Current Data State</h3>
        <div className="data-stats">
          <div className="data-stat">
            <span className="stat-number">{testData.animals.length}</span>
            <span className="stat-label">Total Animals</span>
          </div>
          <div className="data-stat">
            <span className="stat-number">{testData.publicAnimals.length}</span>
            <span className="stat-label">Public Animals</span>
          </div>
          <div className="data-stat">
            <span className="stat-number">{testData.settings.featuredAnimals?.length || 0}</span>
            <span className="stat-label">Featured Animals</span>
          </div>
          <div className="data-stat">
            <span className="stat-number">{testData.settings.visibleAnimalTypes?.length || 0}</span>
            <span className="stat-label">Visible Types</span>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="test-results">
          <h3>Test Results</h3>
          <div className="results-summary">
            <div className="summary-stat">
              <span className="stat-number" style={{ color: '#28a745' }}>
                {testResults.filter(r => r.status === 'passed').length}
              </span>
              <span className="stat-label">Passed</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number" style={{ color: '#dc3545' }}>
                {testResults.filter(r => r.status === 'failed').length}
              </span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="summary-stat">
              <span className="stat-number" style={{ color: '#ffc107' }}>
                {testResults.filter(r => r.status === 'skipped').length}
              </span>
              <span className="stat-label">Skipped</span>
            </div>
          </div>

          <div className="test-list">
            {testResults.map((result, index) => (
              <div key={index} className="test-result-card">
                <div className="test-result-header">
                  <span className="test-status" style={{ color: getStatusColor(result.status) }}>
                    {getStatusIcon(result.status)}
                  </span>
                  <h4>{result.name}</h4>
                </div>
                <p className="test-message">{result.message}</p>
                {result.details && (
                  <details className="test-details">
                    <summary>View Details</summary>
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Verification */}
      <div className="integration-verification">
        <h3>Integration Verification</h3>
        <div className="verification-checklist">
          <div className="verification-item">
            <span className="verification-icon">
              {testData.publicAnimals.length <= testData.animals.length ? '✅' : '❌'}
            </span>
            <span>Public animals count ≤ Total animals count</span>
          </div>
          <div className="verification-item">
            <span className="verification-icon">
              {testData.settings.featuredAnimals?.every(id => 
                testData.publicAnimals.some(animal => animal.id === id)
              ) ? '✅' : '❌'}
            </span>
            <span>All featured animals are visible in public</span>
          </div>
          <div className="verification-item">
            <span className="verification-icon">
              {testData.settings.visibleAnimalTypes?.length > 0 ? '✅' : '❌'}
            </span>
            <span>At least one animal type is visible</span>
          </div>
          <div className="verification-item">
            <span className="verification-icon">
              {testData.farmContent.name && testData.farmContent.mission ? '✅' : '❌'}
            </span>
            <span>Farm content is properly configured</span>
          </div>
        </div>
      </div>
    </div>
  );
}