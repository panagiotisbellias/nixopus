import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Server } from '@/redux/types/server';

interface ServerState {
  activeServer: Server | null;
  activeServerId: string | null;
}

const initialState: ServerState = {
  activeServer: null,
  activeServerId: null
};

export const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {
    setActiveServer: (state, action: PayloadAction<Server | null>) => {
      state.activeServer = action.payload;
      state.activeServerId = action.payload?.id || null;
    },
    setActiveServerId: (state, action: PayloadAction<string | null>) => {
      state.activeServerId = action.payload;
      if (action.payload === null) {
        state.activeServer = null;
      }
    },
    clearActiveServer: (state) => {
      state.activeServer = null;
      state.activeServerId = null;
    }
  }
});

export const { setActiveServer, setActiveServerId, clearActiveServer } = serverSlice.actions;

export default serverSlice.reducer;
