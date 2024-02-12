import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { resetAllStates } from "./resetSlice";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../../config";

const initialState = {
  productList: '{}',
  currentPage: '{}',
  totalPages: '{}',
  loading: false,
  error: false,
};

const productListSlice = createSlice({
  name: "productList",
  initialState,
  reducers: {
    fetchProductListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    fetchProductListSuccess: (state, action) => {
      state.productList = JSON.stringify(action.payload.productList);
      state.currentPage = JSON.stringify(action.payload.currentPage);
      state.totalPages = JSON.stringify(action.payload.totalPages);
      state.loading = false;
      state.error = false;
    },
    fetchProductListError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetProductList: (state) => {
      state.productList = null;
      state.currentPage = 1;
      state.totalPages = 1;
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
  fetchProductListStart,
  fetchProductListSuccess,
  fetchProductListError,
  resetProductList
} = productListSlice.actions;

export const fetchProductList = (club, category, productList, currentPage, totalPages) => async (dispatch) => {
  try {
    dispatch(fetchProductListStart());
    let url = '';
    let payload = {};
    if( category==0 ){
      let page = currentPage[category] && currentPage[category] > 1 ? `?page=${currentPage[category]}` : '';
      url = `${POS_STORE_API_URL}/get_pos_product_list${page}`;
    }else{
      let page = currentPage[category] && currentPage[category] > 1 ? `?page=${currentPage[category]}` : '';
      url = `${POS_STORE_API_URL}/pos-parent-category-product${page}`;
      payload = {"category_id": category};
    }
    const response = await axios.post(
      url,
      payload,
      {
        headers: {
          'Apitoken': POS_API_TOKEN,
          'X-Tenant': club
        },
      }
    );
    if( response?.data?.result ){
      productList[category] = productList[category] != undefined && productList[category]!='' ? [...productList[category], ...response.data.result.data] : response.data.result.data;
      currentPage[category] = currentPage[category] != undefined && currentPage[category]!='' ? currentPage[category] : 1;
      totalPages[category] = response.data.result.last_page;
      dispatch(fetchProductListSuccess({productList: productList, currentPage: currentPage, totalPages: totalPages}));
    }else{
      dispatch(fetchProductListError());
    }
  } catch (error) {
    dispatch(fetchProductListError());
    console.log(error);
  }
};

export default productListSlice.reducer;