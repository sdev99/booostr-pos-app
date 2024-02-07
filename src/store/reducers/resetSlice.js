import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const resetSlice = createSlice({
  name: "reset",
  initialState,
  reducers: {
    resetAllStates: (state) => {
      return true
    },
  },
});

export const { resetAllStates } = resetSlice.actions;
export default resetSlice.reducer;