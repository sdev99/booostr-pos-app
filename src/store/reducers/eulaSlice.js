import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { resetAllStates } from "./resetSlice";
import { POS_API_URL } from "../../config";

const initialState = {
  eulaContent: null,
  eulaConsent: false,
  loading: true,
  error: false,
};

const eulaSlice = createSlice({
  name: "eula",
  initialState,
  reducers: {
    getEula: (state) => {
      state.loading = true;
      state.error = false;
    },
    getEulaSuccess: (state, action) => {
      state.eulaContent = action.payload;
      state.loading = false;
      state.error = false;
    },
    getEulaError: (state) => {
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
  getEula,
  getEulaSuccess,
  getEulaError,
  eulaConsent,
  resetEulaConsent,
} = eulaSlice.actions;

export const fetchEula = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${POS_API_URL}/pos-get-eula?time=${Date.now()}`
    );
    if( response?.data?.data?.data ){
      dispatch(getEulaSuccess(JSON.stringify(response.data.data.data)));
    }else{
      dispatch(getEulaError());
    }
  } catch (error) {
    // console.log(error);
  }
};

export const fetchEulaUpdate = (userId) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${POS_API_URL}/pos-eula-check-update?user_id=${userId}&time=${Date.now()}`
    );
    if( response?.data?.data?.eula_updated ){
      dispatch(resetEulaConsent());
    }else{
      dispatch(eulaConsent());
    }
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
    
    let storedEulaConsents = await AsyncStorage.getItem("eula_consent");
    storedEulaConsents = JSON.parse(storedEulaConsents);
    let updatedEulaConsents = storedEulaConsents?.length > 0 ? [...storedEulaConsents, CurrentUserID] : [CurrentUserID];
    await AsyncStorage.setItem(
      "eula_consent",
      JSON.stringify(updatedEulaConsents)
    );

    dispatch(eulaConsent());
  } catch (error) {
    // console.log(error);
  }
};

export default eulaSlice.reducer;