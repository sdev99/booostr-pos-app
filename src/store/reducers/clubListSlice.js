import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { resetAllStates } from "./resetSlice";
import { POS_API_URL } from "../../config";

const initialState = {
  clubList: [],
  loading: false,
  error: false,
};

const clubListSlice = createSlice({
  name: "clubList",
  initialState,
  reducers: {
    fetchClubListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    fetchClubListSuccess: (state, action) => {
      state.clubList = action.payload;
      state.loading = false;
      state.error = false;
    },
    fetchClubListError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetClubList: (state) => {
      state.clubList = null;
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
  fetchClubListStart,
  fetchClubListSuccess,
  fetchClubListError,
  resetClubList
} = clubListSlice.actions;

export const fetchClubList = (user) => async (dispatch) => {
  try {
    dispatch(fetchClubListStart());
    const response = await axios.get(
      `${POS_API_URL}/get-club-list?user_id=${user}&time=${Date.now()}`
    );
    console.log(response?.data);
    if( response?.data?.clubs ){
      dispatch(fetchClubListSuccess(JSON.stringify(response.data.clubs)));
    }else{
      dispatch(fetchClubListError());
    }
  } catch (error) {
    dispatch(fetchClubListError());
    console.log(error);
  }
};

export default clubListSlice.reducer;