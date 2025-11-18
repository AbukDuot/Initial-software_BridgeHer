import React, { useState, useRef } from 'react';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowFileUpload?: boolean;
  onFileUpload?: (files: File[]) => void;
}

const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content...",
  allowFileUpload = false,
  onFileUpload
}) => {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) {
          formattedText = `[${selectedText || 'Link text'}](${url})`;
        } else {
          return;
        }
        break;
      }
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Update active formats
    setActiveFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      if (onFileUpload) {
        onFileUpload(files);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      if (onFileUpload) {
        onFileUpload(files);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="enhanced-rich-editor">
      <div className="rich-editor-toolbar">
        <button
          type="button"
          className={`toolbar-btn ${activeFormats.includes('bold') ? 'active' : ''}`}
          onClick={() => formatText('bold')}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          className={`toolbar-btn ${activeFormats.includes('italic') ? 'active' : ''}`}
          onClick={() => formatText('italic')}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          className={`toolbar-btn ${activeFormats.includes('code') ? 'active' : ''}`}
          onClick={() => formatText('code')}
          title="Code"
        >
          Code
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatText('link')}
          title="Link"
        >
          Link
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatText('quote')}
          title="Quote"
        >
          Quote
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => formatText('list')}
          title="List"
        >
          List
        </button>
        {allowFileUpload && (
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload File"
          >
            File
          </button>
        )}
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rich-editor-textarea"
        rows={6}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
      
      {allowFileUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="file-remove"
                    onClick={() => removeFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedRichTextEditor;