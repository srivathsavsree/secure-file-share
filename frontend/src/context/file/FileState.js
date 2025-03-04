import React, { useReducer } from 'react';
import axios from 'axios';
import {FileContext,FileProvider} from './fileContext';
import fileReducer from './FileReducer';
import {
  GET_FILES,
  ADD_FILE,
  DELETE_FILE,
  FILE_ERROR,
  SET_LOADING,
  CLEAR_FILES
} from '../type';

const FileState = props => {
  const initialState = {
    files: [],
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(fileReducer, initialState);

  // Get Files
  const getFiles = async () => {
    setLoading();

    try {
      const res = await axios.get('/api/files');

      dispatch({
        type: GET_FILES,
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: FILE_ERROR,
        payload: err.response.data.msg
      });
    }
  };

  // Upload File
  const uploadFile = async formData => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    setLoading();

    try {
      const res = await axios.post('/api/files/upload', formData, config);

      dispatch({
        type: ADD_FILE,
        payload: res.data.file
      });

      return res.data.file;
    } catch (err) {
      dispatch({
        type: FILE_ERROR,
        payload: err.response.data.msg
      });
      return null;
    }
  };

  // Delete File
  const deleteFile = async id => {
    try {
      await axios.delete(`/api/files/${id}`);

      dispatch({
        type: DELETE_FILE,
        payload: id
      });
    } catch (err) {
      dispatch({
        type: FILE_ERROR,
        payload: err.response.data.msg
      });
    }
  };

  // Set Loading
  const setLoading = () => dispatch({ type: SET_LOADING });

  // Clear Files
  const clearFiles = () => dispatch({ type: CLEAR_FILES });

  return (
    <FileContext.Provider
      value={{
        files: state.files,
        loading: state.loading,
        error: state.error,
        getFiles,
        uploadFile,
        deleteFile,
        clearFiles
      }}
    >
      {props.children}
    </FileContext.Provider>
  );
};

export default FileState;