import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { DataSet } from '../types';

export interface StoreData {
    sales: DataSet[],
    group: string
}

export interface DataState {
  data: StoreData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DataState = {
  data: {
    sales: [],
    group: ''
  },
  status: 'idle',
  error: null,
};

export const fetchData = createAsyncThunk<StoreData, string>(
  'data/fetchData',
  async (category: string) => {
    const response = await axios.get(`http://localhost:3000/api/sales?groupBy=${category}`);
    return response.data;
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.group = action.payload.group;
        state.data.sales = action.payload.sales;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch data';
      });
  },
});

export default dataSlice.reducer;
