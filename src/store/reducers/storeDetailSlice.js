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
    club = club ? club : JSON.parse(await AsyncStorage.getItem("club"));
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
        },
      );
      if (response?.data?.result) {
        await AsyncStorage.setItem("club", JSON.stringify(club));
        dispatch(fetchStoreDataSuccess(JSON.stringify(response.data.result)));
        return { success: true, data: response.data.result }; // ✅
      } else {
        return { success: false, message: response?.data?.message }; // ✅
      }
    }
    return { success: false, message: "Invalid club" }; // ✅
  } catch (error) {
    dispatch(fetchStoreDataError());
    const errMessage = error.response?.data?.message ?? error.message;

    console.log(`pos-get-store-details:${errMessage}`);
    return { success: false, message: errMessage }; // ✅ IMPORTANT (don’t throw)
  }
};

export default storeDataSlice.reducer;
