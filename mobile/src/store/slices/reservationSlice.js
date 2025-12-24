import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reservationService } from '../../services/reservationService';

export const createReservation = createAsyncThunk(
  'reservation/createReservation',
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await reservationService.createReservation(reservationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create reservation');
    }
  }
);

export const fetchReservations = createAsyncThunk(
  'reservation/fetchReservations',
  async (status = null, { rejectWithValue }) => {
    try {
      const response = await reservationService.getUserReservations(status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch reservations');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservation/cancelReservation',
  async (reservationId, { rejectWithValue }) => {
    try {
      const response = await reservationService.cancelReservation(reservationId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to cancel reservation');
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservation',
  initialState: {
    reservations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.unshift(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Reservation
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      });
  },
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;
