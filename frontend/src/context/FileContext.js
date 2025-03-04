import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { uploadFile, getUserFiles, deleteFile, getDownloadUrl } from '../utils/api';
import { AuthContext } from './AuthContext';

// Create context
export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useContext(AuthContext);

  // Load user's files when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [isAuthenticated]);

  // Load all files for the current user
  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await getUserFiles();
      setFiles(res.data);
    } catch (err) {
      const message = err.response?.data?.msg || 'Failed to load files';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Upload a file
  const handleUpload = async (file) => {
    try {
      setLoading(true);
      const res = await uploadFile(file);
      
      // Add new file to state
      setFiles(prevFiles => [
        {
          id: res.data.file.id,
          filename: res.data.file.filename,
          downloadLink: res.data.file.downloadLink,
          expiresAt: res.data.file.expiresAt,
          createdAt: new Date().toISOString()
        },
        ...prevFiles
      ]);
      
      toast.success('File uploaded successfully!');
      return res.data.file;
    } catch (err) {
      const message = err.response?.data?.msg || 'Upload failed';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a file
  const handleDelete = async (fileId) => {
    try {
      setLoading(true);
      await deleteFile(fileId);
      
      // Remove file from state
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
      
      toast.success('File deleted successfully');
      return true;
    } catch (err) {
      const message = err.response?.data?.msg || 'Delete failed';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get download URL
  const getFileDownloadUrl = (downloadLink) => {
    return getDownloadUrl(downloadLink);
  };

  return (
    <FileContext.Provider
      value={{
        files,
        loading,
        error,
        loadFiles,
        uploadFile: handleUpload,
        deleteFile: handleDelete,
        getFileDownloadUrl
      }}
    >
      {children}
    </FileContext.Provider>
  );
};