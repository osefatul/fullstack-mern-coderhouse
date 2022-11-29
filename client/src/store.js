import { configureStore } from '@reduxjs/toolkit';
import auth from './features/authSlice';

export const store = configureStore({
    reducer: {
        auth,
    },
});