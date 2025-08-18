import React, { useState, useEffect, useRef } from 'react';
import { searchManager, globalSearch, getSearchSuggestions, getFilterPresets, saveFilterPreset } from '../utils/search.js';

const SearchComponent = ({ 
  dataType = 'global', 
  onResults, 
  placeholder = 'Search...', 
  showFilters = true,
  showPresets = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedPresets, setSavedPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (showPresets) {
      setSavedPresets(getFilterPresets(dataType));
    }
  }, [dataType, showPresets]);

  useEffect(() => {
    // Handle clicks outside suggestions
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 1) {
      const suggestions = getSearchSuggestions(newQuery, dataType === 'global' ? null : dataType, 5);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) return;

    setIsSearching(true);
    
    try {
      let results;
      
      if (dataType === 'global') {
        results = globalSearch(searchQuery, filters);
      } else {
        const data = JSON.parse(localStorage.getItem(`adonai_${dataType}`) || '[]');
        switch (dataType) {
          case 'animals':
            results = searchManager.searchAnimals(data, searchQuery, filters);
            break;
          case 'workers':
            results = searchManager.searchWorkers(data, searchQuery, filters);
            break;
          case 'infrastructure':
            results = searchManager.searchInfrastructure(data, searchQuery, filters);
            break;
          case 'users':
            results = searchManager.searchUsers(data, searchQuery, filters);
            break;
          default:
            results = [];
        }
      }

      setSearchResults(results);
      if (onResults) {
        onResults(results, searchQuery, filters);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.query);
    setShowSuggestions(false);
    handleSearch(suggestion.query);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterKey];
    } else {
      newFilters[filterKey] = value;
    }
    
    setFilters(newFilters);
  };

  const handlePresetLoad = (preset) => {
    setQuery(preset.query || '');
    setFilters(preset.filters || {});
    handleSearch(preset.query || '');
  };

  const handlePresetSave = () => {
    if (!presetName.trim()) return;
    
    const preset = saveFilterPreset(presetName, dataType, filters, query);
    setSavedPresets([...savedPresets, preset]);
    setPresetName('');
    setShowSavePreset(false);
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    setSearchResults(null);
    if (onResults) {
      onResults(null, '', {});
    }
  };

  const exportResults = () => {
    if (!searchResults) return;
    
    if (dataType === 'global') {
      // Export all results as separate files
      Object.keys(searchResults).forEach(type => {
        if (type !== 'total' && searchResults[type].length > 0) {
          searchManager.exportSearchResults(searchResults[type], type, query);
        }
      });
    } else {
      searchManager.exportSearchResults(searchResults, dataType, query);
    }
  };

  const renderFilters = () => {
    if (!showFilters || !showAdvancedFilters) return null;

    switch (dataType) {
      case 'animals':
        return renderAnimalFilters();
      case 'workers':
        return renderWorkerFilters();
      case 'infrastructure':
        return renderInfrastructureFilters();
      case 'users':
        return renderUserFilters();
      case 'global':
        return renderGlobalFilters();
      default:
        return null;
    }
  };

  const renderAnimalFilters = () => (
    <div className="search-filters">
      <div className="filter-group">
        <label>Species</label>
        <select 
          multiple 
          value={filters.species || []}
          onChange={(e) => handleFilterChange('species', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="Cattle">Cattle</option>
          <option value="Sheep">Sheep</option>
          <option value="Goat">Goat</option>
          <option value="Pig">Pig</option>
          <option value="Chicken">Chicken</option>
          <option value="Horse">Horse</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Health Status</label>
        <select 
          multiple 
          value={filters.healthStatus || []}
          onChange={(e) => handleFilterChange('healthStatus', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="Healthy">Healthy</option>
          <option value="Sick">Sick</option>
          <option value="Injured">Injured</option>
          <option value="Pregnant">Pregnant</option>
          <option value="Quarantine">Quarantine</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Age Range (years)</label>
        <div className="range-inputs">
          <input 
            type="number" 
            placeholder="Min"
            value={filters.ageRange?.min || ''}
            onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, min: parseInt(e.target.value) || 0 })}
          />
          <input 
            type="number" 
            placeholder="Max"
            value={filters.ageRange?.max || ''}
            onChange={(e) => handleFilterChange('ageRange', { ...filters.ageRange, max: parseInt(e.target.value) || 100 })}
          />
        </div>
      </div>
      
      <div className="filter-group">
        <label>Weight Range (kg)</label>
        <div className="range-inputs">
          <input 
            type="number" 
            placeholder="Min"
            value={filters.weightRange?.min || ''}
            onChange={(e) => handleFilterChange('weightRange', { ...filters.weightRange, min: parseFloat(e.target.value) || 0 })}
          />
          <input 
            type="number" 
            placeholder="Max"
            value={filters.weightRange?.max || ''}
            onChange={(e) => handleFilterChange('weightRange', { ...filters.weightRange, max: parseFloat(e.target.value) || 1000 })}
          />
        </div>
      </div>
    </div>
  );

  const renderWorkerFilters = () => (
    <div className="search-filters">
      <div className="filter-group">
        <label>Role</label>
        <select 
          multiple 
          value={filters.role || []}
          onChange={(e) => handleFilterChange('role', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="Farm Manager">Farm Manager</option>
          <option value="Livestock Specialist">Livestock Specialist</option>
          <option value="Field Worker">Field Worker</option>
          <option value="Equipment Operator">Equipment Operator</option>
          <option value="Veterinarian">Veterinarian</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Department</label>
        <select 
          multiple 
          value={filters.department || []}
          onChange={(e) => handleFilterChange('department', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="Livestock">Livestock</option>
          <option value="Crops">Crops</option>
          <option value="Equipment">Equipment</option>
          <option value="Administration">Administration</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Status</label>
        <select 
          multiple 
          value={filters.status || []}
          onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  const renderInfrastructureFilters = () => (
    <div className="search-filters">
      <div className="filter-group">
        <label>Category</label>
        <select 
          multiple 
          value={filters.category || []}
          onChange={(e) => handleFilterChange('category', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="vehicle">Vehicle</option>
          <option value="building">Building</option>
          <option value="equipment">Equipment</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Status</label>
        <select 
          multiple 
          value={filters.status || []}
          onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Value Range ($)</label>
        <div className="range-inputs">
          <input 
            type="number" 
            placeholder="Min"
            value={filters.valueRange?.min || ''}
            onChange={(e) => handleFilterChange('valueRange', { ...filters.valueRange, min: parseFloat(e.target.value) || 0 })}
          />
          <input 
            type="number" 
            placeholder="Max"
            value={filters.valueRange?.max || ''}
            onChange={(e) => handleFilterChange('valueRange', { ...filters.valueRange, max: parseFloat(e.target.value) || 1000000 })}
          />
        </div>
      </div>
    </div>
  );

  const renderUserFilters = () => (
    <div className="search-filters">
      <div className="filter-group">
        <label>Role</label>
        <select 
          multiple 
          value={filters.role || []}
          onChange={(e) => handleFilterChange('role', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="admin">Admin</option>
          <option value="supervisor">Supervisor</option>
          <option value="worker">Worker</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Status</label>
        <select 
          multiple 
          value={filters.status || []}
          onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  const renderGlobalFilters = () => (
    <div className="search-filters">
      <div className="filter-group">
        <label>Search In</label>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={filters.includeAnimals !== false}
              onChange={(e) => handleFilterChange('includeAnimals', e.target.checked)}
            />
            Animals
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={filters.includeWorkers !== false}
              onChange={(e) => handleFilterChange('includeWorkers', e.target.checked)}
            />
            Workers
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={filters.includeInfrastructure !== false}
              onChange={(e) => handleFilterChange('includeInfrastructure', e.target.checked)}
            />
            Infrastructure
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={filters.includeUsers !== false}
              onChange={(e) => handleFilterChange('includeUsers', e.target.checked)}
            />
            Users
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`search-component ${className}`}>
      {/* Main Search Bar */}
      <div className="search-bar">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="search-input"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-query">{suggestion.query}</div>
                  <div className="suggestion-meta">
                    {suggestion.dataType} • {suggestion.resultCount} results
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="search-actions">
          <button 
            className="btn btn-primary"
            onClick={() => handleSearch()}
            disabled={isSearching}
          >
            {isSearching ? '🔍 Searching...' : '🔍 Search'}
          </button>
          
          {showFilters && (
            <button 
              className="btn btn-outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              🔧 Filters
            </button>
          )}
          
          {(query || Object.keys(filters).length > 0) && (
            <button 
              className="btn btn-outline"
              onClick={clearSearch}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {renderFilters()}

      {/* Filter Presets */}
      {showPresets && savedPresets.length > 0 && (
        <div className="filter-presets">
          <h4>Saved Filters</h4>
          <div className="preset-buttons">
            {savedPresets.map(preset => (
              <button
                key={preset.id}
                className="btn btn-outline btn-small"
                onClick={() => handlePresetLoad(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Preset */}
      {showPresets && (query || Object.keys(filters).length > 0) && (
        <div className="save-preset">
          {showSavePreset ? (
            <div className="save-preset-form">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name..."
                className="preset-name-input"
              />
              <button className="btn btn-primary btn-small" onClick={handlePresetSave}>
                💾 Save
              </button>
              <button className="btn btn-outline btn-small" onClick={() => setShowSavePreset(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-outline btn-small"
              onClick={() => setShowSavePreset(true)}
            >
              💾 Save Filter
            </button>
          )}
        </div>
      )}

      {/* Search Results Summary */}
      {searchResults && (
        <div className="search-results-summary">
          <div className="results-info">
            {dataType === 'global' ? (
              <span>
                Found {searchResults.total} results: 
                {searchResults.animals.length > 0 && ` ${searchResults.animals.length} animals`}
                {searchResults.workers.length > 0 && ` ${searchResults.workers.length} workers`}
                {searchResults.infrastructure.length > 0 && ` ${searchResults.infrastructure.length} infrastructure`}
                {searchResults.users.length > 0 && ` ${searchResults.users.length} users`}
              </span>
            ) : (
              <span>Found {Array.isArray(searchResults) ? searchResults.length : 0} results</span>
            )}
          </div>
          
          {searchResults && (
            <button className="btn btn-outline btn-small" onClick={exportResults}>
              📊 Export Results
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .search-component {
          margin-bottom: 2rem;
        }

        .search-bar {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .search-input-container {
          position: relative;
          flex: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: white;
        }

        .search-input:focus {
          border-color: var(--primary-green);
          outline: none;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
        }

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 0.75rem;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
        }

        .suggestion-item:hover {
          background: var(--cream);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-query {
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .suggestion-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .search-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .search-filters {
          background: var(--card-bg);
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          margin-bottom: 1rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .filter-group label {
          display: block;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: var(--primary-green);
        }

        .filter-group select,
        .filter-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }

        .range-inputs {
          display: flex;
          gap: 0.5rem;
        }

        .range-inputs input {
          flex: 1;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: normal;
          margin: 0;
        }

        .filter-presets {
          margin-bottom: 1rem;
        }

        .filter-presets h4 {
          margin-bottom: 0.5rem;
          color: var(--primary-green);
        }

        .preset-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .save-preset {
          margin-bottom: 1rem;
        }

        .save-preset-form {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .preset-name-input {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          flex: 1;
          max-width: 200px;
        }

        .search-results-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--cream);
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .results-info {
          font-weight: bold;
          color: var(--primary-green);
        }

        @media (max-width: 768px) {
          .search-bar {
            flex-direction: column;
          }

          .search-actions {
            width: 100%;
          }

          .search-actions .btn {
            flex: 1;
          }

          .search-filters {
            grid-template-columns: 1fr;
          }

          .search-results-summary {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchComponent;