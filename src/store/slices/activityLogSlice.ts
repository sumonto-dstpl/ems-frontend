import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import activityLogService from '../../services/activityLogService';
import { 
  ActivityLog, 
  ActivityLogRequest, 
  ActivityLogSummary, 
  PageResponse 
} from '../../types/activityLog';

// Define the state interface
interface ActivityLogState {
  activityLogs: ActivityLog[];
  currentActivityLog: ActivityLog | null;
  summary: ActivityLogSummary | null;
  loading: boolean;
  error: string | null;
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasMore: boolean;
}

// Initial state
const initialState: ActivityLogState = {
  activityLogs: [],
  currentActivityLog: null,
  summary: null,
  loading: false,
  error: null,
  // Pagination initial values
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalElements: 0,
  hasMore: false,
};

// Pagination request parameters
interface FetchLogsParams {
  page?: number;
  size?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

// Async thunks
export const fetchPaginatedActivityLogs = createAsyncThunk<
  PageResponse<ActivityLog>,
  FetchLogsParams,
  { rejectValue: string }
>(
  'activityLog/fetchPaginated',
  async (params, { rejectWithValue }) => {
    try {
      return await activityLogService.getActivityLogs(
        params.page,
        params.size,
        params.status,
        params.fromDate,
        params.toDate
      );
    } catch (error) {
      return rejectWithValue('Failed to fetch activity logs');
    }
  }
);

// Keeping this for backwards compatibility
export const fetchAllActivityLogs = createAsyncThunk(
  'activityLog/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await activityLogService.getAllActivityLogs();
    } catch (error) {
      return rejectWithValue('Failed to fetch activity logs');
    }
  }
);

export const fetchActivityLogById = createAsyncThunk(
  'activityLog/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await activityLogService.getActivityLogById(id);
    } catch (error) {
      return rejectWithValue('Failed to fetch activity log');
    }
  }
);

export const fetchActivityLogByDate = createAsyncThunk(
  'activityLog/fetchByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      return await activityLogService.getActivityLogByDate(date);
    } catch (error) {
      return rejectWithValue('Failed to fetch activity log for the specified date');
    }
  }
);

export const createActivityLog = createAsyncThunk(
  'activityLog/create',
  async (data: ActivityLogRequest, { rejectWithValue }) => {
    try {
      return await activityLogService.createActivityLog(data);
    } catch (error) {
      return rejectWithValue('Failed to create activity log');
    }
  }
);

export const updateActivityLog = createAsyncThunk(
  'activityLog/update',
  async ({ id, data }: { id: number; data: ActivityLogRequest }, { rejectWithValue }) => {
    try {
      return await activityLogService.updateActivityLog(id, data);
    } catch (error) {
      return rejectWithValue('Failed to update activity log');
    }
  }
);

export const deleteActivityLog = createAsyncThunk(
  'activityLog/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await activityLogService.deleteActivityLog(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete activity log');
    }
  }
);

export const submitActivityLog = createAsyncThunk(
  'activityLog/submit',
  async (id: number, { rejectWithValue }) => {
    try {
      return await activityLogService.submitActivityLog(id);
    } catch (error) {
      return rejectWithValue('Failed to submit activity log');
    }
  }
);

export const fetchActivityLogSummary = createAsyncThunk(
  'activityLog/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await activityLogService.getActivityLogSummary();
    } catch (error) {
      return rejectWithValue('Failed to fetch activity log summary');
    }
  }
);

// Create the slice
const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    resetActivityLogError(state) {
      state.error = null;
    },
    clearCurrentActivityLog(state) {
      state.currentActivityLog = null;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchPaginatedActivityLogs
      .addCase(fetchPaginatedActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaginatedActivityLogs.fulfilled, (state, action: PayloadAction<PageResponse<ActivityLog>>) => {
        state.loading = false;
        state.activityLogs = action.payload.content;
        state.currentPage = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.hasMore = !action.payload.last;
      })
      .addCase(fetchPaginatedActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
      // Handle fetchAllActivityLogs (for backward compatibility)
      .addCase(fetchAllActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllActivityLogs.fulfilled, (state, action: PayloadAction<ActivityLog[]>) => {
        state.loading = false;
        state.activityLogs = action.payload;
      })
      .addCase(fetchAllActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Handle fetchActivityLogById
      .addCase(fetchActivityLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogById.fulfilled, (state, action: PayloadAction<ActivityLog>) => {
        state.loading = false;
        state.currentActivityLog = action.payload;
      })
      .addCase(fetchActivityLogById.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchActivityLogByDate
      .addCase(fetchActivityLogByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogByDate.fulfilled, (state, action: PayloadAction<ActivityLog | null>) => {
        state.loading = false;
        state.currentActivityLog = action.payload;
      })
      .addCase(fetchActivityLogByDate.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle createActivityLog
      .addCase(createActivityLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivityLog.fulfilled, (state, action: PayloadAction<ActivityLog>) => {
        state.loading = false;
        state.activityLogs.push(action.payload);
        state.currentActivityLog = action.payload;
      })
      .addCase(createActivityLog.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateActivityLog
      .addCase(updateActivityLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivityLog.fulfilled, (state, action: PayloadAction<ActivityLog>) => {
        state.loading = false;
        const index = state.activityLogs.findIndex(log => log.id === action.payload.id);
        if (index !== -1) {
          state.activityLogs[index] = action.payload;
        }
        state.currentActivityLog = action.payload;
      })
      .addCase(updateActivityLog.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle deleteActivityLog
      .addCase(deleteActivityLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivityLog.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.activityLogs = state.activityLogs.filter(log => log.id !== action.payload);
        if (state.currentActivityLog && state.currentActivityLog.id === action.payload) {
          state.currentActivityLog = null;
        }
      })
      .addCase(deleteActivityLog.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle submitActivityLog
      .addCase(submitActivityLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitActivityLog.fulfilled, (state, action: PayloadAction<ActivityLog>) => {
        state.loading = false;
        const index = state.activityLogs.findIndex(log => log.id === action.payload.id);
        if (index !== -1) {
          state.activityLogs[index] = action.payload;
        }
        state.currentActivityLog = action.payload;
      })
      .addCase(submitActivityLog.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchActivityLogSummary
      .addCase(fetchActivityLogSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogSummary.fulfilled, (state, action: PayloadAction<ActivityLogSummary>) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchActivityLogSummary.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  resetActivityLogError, 
  clearCurrentActivityLog,
  setPageSize,
  setCurrentPage
} = activityLogSlice.actions;
export default activityLogSlice.reducer;