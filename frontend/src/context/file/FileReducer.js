import {
    GET_FILES,
    ADD_FILE,
    DELETE_FILE,
    FILE_ERROR,
    SET_LOADING,
    CLEAR_FILES
  } from '../types';
  
  export default (state, action) => {
    switch (action.type) {
      case GET_FILES:
        return {
          ...state,
          files: action.payload,
          loading: false
        };
      case ADD_FILE:
        return {
          ...state,
          files: [action.payload, ...state.files],
          loading: false
        };
      case DELETE_FILE:
        return {
          ...state,
          files: state.files.filter(file => file.id !== action.payload),
          loading: false
        };
      case CLEAR_FILES:
        return {
          ...state,
          files: [],
          loading: false
        };
      case FILE_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      case SET_LOADING:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  };