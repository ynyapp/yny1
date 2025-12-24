import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { restaurantService } from '../../services/restaurantService';
import { collectionService } from '../../services/collectionService';

export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchRestaurants',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurants(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurantDetail = createAsyncThunk(
  'restaurant/fetchRestaurantDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch restaurant details');
    }
  }
);

export const searchRestaurants = createAsyncThunk(
  'restaurant/searchRestaurants',
  async (params, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurants(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Search failed');
    }
  }
);

export const fetchNearbyRestaurants = createAsyncThunk(
  'restaurant/fetchNearbyRestaurants',
  async ({ lat, lng, maxDistance = 5 }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurants({ lat, lng, max_distance: maxDistance });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch nearby restaurants');
    }
  }
);

export const fetchCollections = createAsyncThunk(
  'restaurant/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionService.getCollections();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch collections');
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    restaurants: [],
    selectedRestaurant: null,
    collections: [],
    loading: false,
    error: null,
    searchResults: [],
    nearbyRestaurants: [],
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload.items || action.payload;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Restaurant Detail
      .addCase(fetchRestaurantDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRestaurant = action.payload;
      })
      .addCase(fetchRestaurantDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Restaurants
      .addCase(searchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.items || action.payload;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Nearby Restaurants
      .addCase(fetchNearbyRestaurants.fulfilled, (state, action) => {
        state.nearbyRestaurants = action.payload.items || action.payload;
      })
      // Fetch Collections
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      });
  },
});

export const { clearError, clearSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
