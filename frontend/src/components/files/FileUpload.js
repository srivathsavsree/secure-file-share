import React, { useState, useContext, useRef } from 'react';
import { FileContext } from '../../context/file/fileContext';
import Spinner from '../layout/Spinner';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadFile, loading } = useContext(FileContext);

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Simulate upload progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      await uploadFile(selectedFile);
      setUploadProgress(100);
      
      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading && uploadProgress >= 90) {
    return <Spinner />;
  }

  return (
    <div className="file-upload-container">
      <h2 className="upload-title">Upload Secure File</h2>
      
      <div 
        className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileInput}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileSelect} 
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div className="selected-file">
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
          </div>
        ) : (
          <p className="drop-message">
            Drop file here or click to select
          </p>
        )}
      </div>
      
      {selectedFile && uploadProgress > 0 && (
        <div className="upload-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}
      
      {selectedFile && (
        <button 
          className="btn btn-primary upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload & Encrypt'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;