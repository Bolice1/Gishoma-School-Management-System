import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import api, { setApiStore } from '../api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

setApiStore(store);
