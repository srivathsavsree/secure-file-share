import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FileContext } from '../../context/FileContext';
import FileUpload from '../files/FileUpload';
import FileList from '../files/FileList';
import Spinner from '../layout/Spinner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { loading: fileLoading, loadFiles } = useContext(FileContext);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Reload files when dashboard mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated, loadFiles]);

  if (authLoading || fileLoading) {
    return <Spinner />;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">Welcome, {user?.username}</p>
      
      <div className="dashboard-content">
        <FileUpload />
        <FileList />
      </div>
    </div>
  );
};

export default Dashboard;