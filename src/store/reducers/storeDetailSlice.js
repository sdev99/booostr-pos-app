import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { resetAllStates } from "./resetSlice";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const initialState = {
  storeData: "",
  loading: false,
  error: false,
};

const storeDataSlice = createSlice({
  name: "storeData",
  initialState,
  reducers: {
    fetchStoreDataStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    fetchStoreDataSuccess: (state, action) => {
      state.storeData = action.payload;
      state.loading = false;
      state.error = false;
    },
    fetchStoreDataError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetStoreData: (state) => {
      state.storeData = "";
      state.error = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAllStates, (state) => {
      return { ...initialState };
    });
  },
});

export const {
  fetchStoreDataStart,
  fetchStoreDataSuccess,
  fetchStoreDataError,
  resetStoreData,
} = storeDataSlice.actions;

export const fetchStoreData = (club) => async (dispatch) => {
  try {
    club = club ? club : JSON.parse(AsyncStorage.getItem("club"));
    if (club?.post_slug) {
      dispatch(fetchStoreDataStart());
      const response = await axios.post(
        `${POS_STORE_API_URL}/pos-get-store-details`,
        {},
        {
          headers: {
            Apitoken: POS_API_TOKEN,
            "X-Tenant": club?.post_slug,
          },
        }
      );
      if (response?.data?.result) {
        dispatch(fetchStoreDataSuccess(JSON.stringify(response.data.result)));
      } else {
        throw new Error({ message: response?.data?.message });
      }
    }
  } catch (error) {
    dispatch(fetchStoreDataError());
    Alert.alert(
      "Alert!",
      error.response?.data?.message ?? error.message,
      [
        {
          text: "OK",
          onPress: () => console.log("OK Pressed"),
        },
      ],
      { cancelable: true }
    );
  }
};

export default storeDataSlice.reducer;
