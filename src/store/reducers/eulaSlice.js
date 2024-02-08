import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { resetAllStates } from "./resetSlice";
import { POS_API_URL } from "../../config";

const initialState = {
  eulaContent: '',
  eulaContentLoading: true,
  eulaConsent: false,
  loading: true,
  error: false,
};

const eulaSlice = createSlice({
  name: "eula",
  initialState,
  reducers: {
    fetchEulaStart: (state) => {
      state.eulaContentLoading = true;
      state.error = false;
    },
    fetchEulaSuccess: (state, action) => {
      state.eulaContent = action.payload;
      state.eulaContentLoading = false;
      state.error = false;
    },
    fetchEulaError: (state) => {
      state.eulaContentLoading = false;
      state.error = true;
    },
    fetchEulaUpdateStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    fetchEulaUpdateSuccess: (state) => {
      state.loading = false;
      state.error = false;
    },
    fetchEulaUpdateError: (state) => {
      state.loading = false;
      state.error = true;
    },
    eulaConsent: (state) => {
      state.eulaConsent = true;
      state.error = false;
      state.loading = false;
    },
    resetEulaConsent: (state) => {
      state.eulaConsent = false;
      state.error = false;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllStates, (state) => {
      return { ...initialState };
    });
  },
});

export const {
  fetchEulaStart,
  fetchEulaSuccess,
  fetchEulaError,
  fetchEulaUpdateStart,
  fetchEulaUpdateSuccess,
  fetchEulaUpdateError,
  eulaConsent,
  resetEulaConsent,
} = eulaSlice.actions;

export const fetchEula = () => async (dispatch) => {
  try {
    dispatch(fetchEulaStart());
    const response = await axios.get(
      `${POS_API_URL}/pos-get-eula?time=${Date.now()}`
    );
    if( response?.data?.data?.data ){
      dispatch(fetchEulaSuccess(JSON.stringify(response.data.data.data)));
    }else{
      dispatch(fetchEulaError());
    }
  } catch (error) {
    dispatch(fetchEulaError());
    // console.log(error);
  }
};

export const fetchEulaUpdate = (userId) => async (dispatch) => {
  try {
    dispatch(fetchEulaUpdateStart());
    const response = await axios.get(
      `${POS_API_URL}/pos-eula-check-update?user_id=${userId}&time=${Date.now()}`
    );
    const storedEulaConsents = await AsyncStorage.getItem("eula_consent");
    let storedEulaConsentsParsed = storedEulaConsents ? JSON.parse(storedEulaConsents) : false;

    if( response?.data?.data?.eula_updated || !storedEulaConsentsParsed.includes(userId) ){
      dispatch(resetEulaConsent());
    }else{
      dispatch(fetchEulaUpdateSuccess());
      dispatch(eulaConsent());
    }
    dispatch(fetchEulaUpdateError());
  } catch (error) {
    // console.log(error);
  }
};

export const eulaAccept = (payload) => async (dispatch) => {
  try {
    const response = await axios.post(
      `${POS_API_URL}/pos-eula-accept?time=${Date.now()}`,
      payload
    );

    dispatch(eulaConsent());
  } catch (error) {
    // console.log(error);
  }
};

export default eulaSlice.reducer;