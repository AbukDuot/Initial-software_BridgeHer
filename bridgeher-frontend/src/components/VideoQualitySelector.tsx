import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import '../styles/videoQualitySelector.css';

interface VideoSource {
  quality: string;
  url: string;
  label: string;
}

interface VideoQualitySelectorProps {
  sources: VideoSource[];
  onQualityChange: (quality: string, url: string) => void;
  className?: string;
}

const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
  sources,
  onQualityChange,
  className = ''
}) => {
  const { language } = useLanguage();
  const isAr = language === 'Arabic';
  const [selectedQuality, setSelectedQuality] = useState(sources[0]?.quality || '720p');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQualitySelect = (quality: string, url: string) => {
    setSelectedQuality(quality);
    setShowDropdown(false);
    onQualityChange(quality, url);
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case '1080p': return '🔥';
      case '720p': return '⚡';
      case '480p': return '📱';
      case '360p': return '💾';
      default: return '📺';
    }
  };

  const t = {
    quality: isAr ? 'الجودة' : 'Quality',
    auto: isAr ? 'تلقائي' : 'Auto',
  };

  return (
    <div className={`video-quality-selector ${isAr ? 'rtl' : ''} ${className}`} ref={dropdownRef}>
      <button
        className="quality-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={t.quality}
      >
        <span className="quality-icon">⚙️</span>
        <span className="quality-text">{selectedQuality}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {showDropdown && (
        <div className="quality-dropdown">
          <div className="dropdown-header">
            <span>{t.quality}</span>
          </div>
          {sources.map((source) => (
            <button
              key={source.quality}
              className={`quality-option ${selectedQuality === source.quality ? 'selected' : ''}`}
              onClick={() => handleQualitySelect(source.quality, source.url)}
            >
              <span className="quality-icon">{getQualityIcon(source.quality)}</span>
              <span className="quality-label">{source.label}</span>
              {selectedQuality === source.quality && (
                <span className="selected-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoQualitySelector;