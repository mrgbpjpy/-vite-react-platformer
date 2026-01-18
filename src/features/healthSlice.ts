import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type HealthState = {
  max: number;
  current: number;
};

const initialState: HealthState = {
  max: 3,
  current: 3,
};

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    damage(state, action: PayloadAction<number>) {
      state.current = Math.max(0, state.current - action.payload);
    },
    heal(state, action: PayloadAction<number>) {
      state.current = Math.min(state.max, state.current + action.payload);
    },
    resetHealth(state) {
      state.current = state.max;
    },
    setMaxHealth(state, action: PayloadAction<number>) {
      state.max = Math.max(1, action.payload);
      state.current = Math.min(state.current, state.max);
    },
  },
});

export const { damage, heal, resetHealth, setMaxHealth } = healthSlice.actions;
export default healthSlice.reducer;
