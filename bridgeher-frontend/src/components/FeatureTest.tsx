import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const FeatureTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, string>>({});

  const testFeature = async (name: string, testFn: () => Promise<boolean>) => {
    try {
      const success = await testFn();
      setResults(prev => ({ ...prev, [name]: success ? ' Working' : ' Failed' }));
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: ' Error: ' + (error as Error).message }));
    }
  };

  const tests = [
    {
      name: 'Search API',
      test: async () => {
        const res = await fetch(`${API_BASE_URL}/api/search/suggestions?q=test`);
        return res.ok;
      }
    },
    {
      name: 'Course Preview API',
      test: async () => {
        const res = await fetch(`${API_BASE_URL}/api/courses/1/preview`);
        return res.ok;
      }
    },
    {
      name: 'Course Recommendations API',
      test: async () => {
        const res = await fetch(`${API_BASE_URL}/api/courses/1/recommendations`);
        return res.ok;
      }
    },
    {
      name: 'Enhanced Search Component',
      test: async () => {
        return document.querySelector('.enhanced-search') !== null;
      }
    },
    {
      name: 'Course Preview Component',
      test: async () => {
        return document.querySelector('.preview-btn-small') !== null;
      }
    },
    {
      name: 'Service Worker',
      test: async () => {
        return 'serviceWorker' in navigator;
      }
    }
  ];

  const runAllTests = () => {
    tests.forEach(test => {
      testFeature(test.name, test.test);
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #4A148C', 
      borderRadius: '8px', 
      padding: '15px', 
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4A148C' }}>🔧 Feature Test</h4>
      <button 
        onClick={runAllTests}
        style={{
          background: '#4A148C',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        Test All Features
      </button>
      
      <div>
        {tests.map(test => (
          <div key={test.name} style={{ marginBottom: '5px' }}>
            <strong>{test.name}:</strong> {results[test.name] || '⏳ Not tested'}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        This component helps verify new features are working
      </div>
    </div>
  );
};

export default FeatureTest;