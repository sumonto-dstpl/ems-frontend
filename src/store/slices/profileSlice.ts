import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import profileService from '../../services/profileService';
import { UserProfile, ProfileUpdateRequest } from '../../types/profile';

// Define the state interface
interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCurrentUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>(
  'profile/fetchCurrentUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getCurrentUserProfile();
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  number,
  { rejectValue: string }
>(
  'profile/fetchUserProfile',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await profileService.getUserProfile(userId);
    } catch (error) {
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  UserProfile,
  ProfileUpdateRequest,
  { rejectValue: string }
>(
  'profile/updateUserProfile',
  async (data: ProfileUpdateRequest, { rejectWithValue }) => {
    try {
      return await profileService.updateProfile(data);
    } catch (error) {
      return rejectWithValue('Failed to update user profile');
    }
  }
);

// Create the slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfileError: (state: ProfileState) => {
      state.error = null;
    },
    clearProfile: (state: ProfileState) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCurrentUserProfile
      .addCase(fetchCurrentUserProfile.pending, (state: ProfileState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserProfile.fulfilled, (state: ProfileState, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCurrentUserProfile.rejected, (state: ProfileState, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle fetchUserProfile
      .addCase(fetchUserProfile.pending, (state: ProfileState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state: ProfileState, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state: ProfileState, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle updateUserProfile
      .addCase(updateUserProfile.pending, (state: ProfileState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state: ProfileState, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state: ProfileState, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProfileError, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;