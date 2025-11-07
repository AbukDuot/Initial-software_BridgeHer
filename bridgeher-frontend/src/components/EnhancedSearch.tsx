import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { API_BASE_URL } from '../config/api';
import '../styles/enhancedSearch.css';

interface SearchSuggestion {
  id: number;
  title: string;
  type: 'course' | 'instructor' | 'category';
  category?: string;
  instructor?: string;
}

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({ onSearch, placeholder }) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      // Fallback to mock suggestions
      const mockSuggestions: SearchSuggestion[] = [
        { id: 1, title: 'Financial Literacy Basics', type: 'course', category: 'Finance' },
        { id: 2, title: 'Entrepreneurship for Women', type: 'course', category: 'Business' },
        { id: 3, title: 'Digital Skills', type: 'course', category: 'Technology' },
        { id: 4, title: 'Leadership & Communication', type: 'course', category: 'Leadership' }
      ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
      setSuggestions(mockSuggestions);
      setShowSuggestions(mockSuggestions.length > 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    onSearch(suggestion.title);
  };

  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'course': return '📚';
      case 'instructor': return '👨‍🏫';
      case 'category': return '📂';
      default: return '🔍';
    }
  };

  const t = {
    searchPlaceholder: placeholder || (isAr ? 'ابحث عن الدورات...' : 'Search courses...'),
    recentSearches: isAr ? 'عمليات البحث الأخيرة' : 'Recent Searches',
    suggestions: isAr ? 'اقتراحات' : 'Suggestions',
  };

  return (
    <div className={`enhanced-search ${isAr ? 'rtl' : ''}`} ref={searchRef}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          placeholder={t.searchPlaceholder}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          🔍
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
              <div className="suggestion-content">
                <div className="suggestion-title">{suggestion.title}</div>
                {suggestion.category && (
                  <div className="suggestion-meta">{suggestion.category}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;