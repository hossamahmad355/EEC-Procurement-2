import { configureStore } from '@reduxjs/toolkit';
import procurementReducer from './procurementSlice';

export const store = configureStore({
  reducer: {
    procurement: procurementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
