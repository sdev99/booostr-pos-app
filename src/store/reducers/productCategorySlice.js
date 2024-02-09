import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { resetAllStates } from "./resetSlice";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../../config";

const initialState = {
  categoryList: '',
  loading: false,
  error: false,
};

const productCategoryListSlice = createSlice({
  name: "productCategoryList",
  initialState,
  reducers: {
    fetchProductCategoryListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    fetchProductCategoryListSuccess: (state, action) => {
      state.categoryList = action.payload;
      state.loading = false;
      state.error = false;
    },
    fetchProductCategoryListError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetProductCategoryList: (state) => {
      state.categoryList = null;
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
  fetchProductCategoryListStart,
  fetchProductCategoryListSuccess,
  fetchProductCategoryListError,
  resetProductCategoryList
} = productCategoryListSlice.actions;

export const fetchProductCategoryList = (club) => async (dispatch) => {
  try {
    dispatch(fetchProductCategoryListStart());
    const response = await axios.post(
      `${POS_STORE_API_URL}/get_pos_category_list`,
      {},
      {
        headers: {
          'Apitoken': POS_API_TOKEN,
          'X-Tenant': club
        },
      }
    );
    if( response?.data?.result?.categories ){
      dispatch(fetchProductCategoryListSuccess(JSON.stringify(response.data.result.categories)));
    }else{
      dispatch(fetchProductCategoryListError());
    }
  } catch (error) {
    dispatch(fetchProductCategoryListError());
    // console.log(error);
  }
};

export default productCategoryListSlice.reducer;