import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import {AuthContext,AuthProvider} from '../../context/auth/authContext';
import Spinner from '../layout/Spinner';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext;

  if (loading) return <Spinner />;
  
  if (isAuthenticated) {
    return <Component {...rest} />;
  } else {
    return <Navigate to='/login' />;
  }
};

export default PrivateRoute;