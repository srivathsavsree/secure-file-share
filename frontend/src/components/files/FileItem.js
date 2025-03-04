import React, { useContext, useState } from 'react';
import { FileContext } from '../../context/file/fileContext';
import Spinner from '../layout/Spinner';
import FileItem from './FileItem';

const FileList = () => {
  const { files, loading } = useContext(FileContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <h2 className="file-list-title">Your Secure Files</h2>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {files.length === 0 ? (
        <div className="no-files-message">
          <p>You haven't uploaded any files yet.</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="no-files-message">
          <p>No files match your search.</p>
        </div>
      ) : (
        <div className="file-grid">
          {filteredFiles.map(file => (
            <FileItem key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;