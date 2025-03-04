import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {AuthContext,AuthProvider} from '../../context/auth/authContext';

const Home = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (authContext.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authContext.isAuthenticated, navigate]);

  return (
    <div className="home-container">
      <div className="text-center">
        <h1 className="x-large">Secure File Sharing</h1>
        <p className="lead">
          Share your files securely with end-to-end encryption
        </p>
        <div className="buttons">
          <a href="/register" className="btn btn-primary">
            Register
          </a>
          <a href="/login" className="btn btn-light">
            Login
          </a>
        </div>
      </div>
      <div className="grid-3 my-2">
        <div className="card bg-light p-2">
          <h3>End-to-End Encryption</h3>
          <p>
            Your files are encrypted before transmission and only decrypted by the recipient
          </p>
        </div>
        <div className="card bg-light p-2">
          <h3>Self-Destructing Files</h3>
          <p>
            Files automatically delete after being downloaded or reaching expiration
          </p>
        </div>
        <div className="card bg-light p-2">
          <h3>Secure Sharing</h3>
          <p>
            Generate secure links to share your files with anyone
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;