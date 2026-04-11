import { createSlice } from "@reduxjs/toolkit";
import { resetAllStates } from "./resetSlice";
import axios from "axios";
import { POS_API_URL } from "../../config";

const initialState = {
  isLoggedIn: false,
  userData: "",
  loading: false,
  error: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.isLoggedIn = false;
      state.error = false;
    },
    loginSuccess: (state) => {
      state.loading = false;
      state.isLoggedIn = true;
      state.error = false;
    },
    loginError: (state) => {
      state.loading = false;
      state.isLoggedIn = false;
      state.error = true;
    },
    logoutRequest: (state) => {
      state.loading = true;
    },
    CurrentUserRequest: (state) => {
      state.loading = true;
      state.error = false;
    },
    CurrentUserSuccess: (state, action) => {
      state.userData = action.payload;
      state.isLoggedIn = true;
      state.loading = false;
    },
    CurrentUserError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetLogin: (state, action) => {
      state.isLoggedIn = false;
      state.userData = null;
      state.loading = false;
      state.error = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllStates, (state) => {
      return { ...initialState };
    });
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginError,
  CurrentUserRequest,
  CurrentUserSuccess,
  CurrentUserError,
  setCurrentUseData,
  resetLogin,
  logoutRequest,
} = authSlice.actions;

export const fetchUserData = (userId) => async (dispatch) => {
  try {
    dispatch(CurrentUserRequest());
    const response = await axios.get(
      `${POS_API_URL}/get-user-info?user_id=${userId}&time=${Date.now()}`,
    );
    dispatch(CurrentUserSuccess(JSON.stringify(response.data)));
  } catch (error) {
    dispatch(CurrentUserError());
  }
};

export default authSlice.reducer;
