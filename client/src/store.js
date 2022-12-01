import { configureStore } from '@reduxjs/toolkit';
import auth from './features/authSlice';
import activate from "./features/activateSlice"

export const store = configureStore({
    reducer: {
        auth,
        activate
    },
});