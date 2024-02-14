import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { resetAllStates } from "./resetSlice";

const initialState = {
  orderList: '[]',
  loading: false,
  error: false,
};

const orderListSlice = createSlice({
  name: "orderList",
  initialState,
  reducers: {
    addToOrderListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    addToOrderListSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    addToOrderListError: (state) => {
      state.loading = false;
      state.error = true;
    },
    removeFromOrderListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    removeFromOrderListSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    removeFromOrderListError: (state) => {
      state.loading = false;
      state.error = true;
    },
    removeItemFromOrderStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    removeItemFromOrderSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    removeItemFromOrderError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetOrderList: (state) => {
      state.orderList = '[]';
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
  addToOrderListStart,
  addToOrderListSuccess,
  addToOrderListError,
  removeFromOrderListStart,
  removeFromOrderListSuccess,
  removeFromOrderListError,
  removeItemFromOrderStart,
  removeItemFromOrderSuccess,
  removeItemFromOrderError,
  resetOrderList
} = orderListSlice.actions;

export const addToOrderList = (order) => async (dispatch, getState) => {
  try {
    dispatch(addToOrderListStart());

    const orderList = JSON.parse(getState().orderList.orderList);
    const updatedOrderList = orderList ? [...orderList, order] : [order];
    
    dispatch(addToOrderListSuccess(JSON.stringify(updatedOrderList)));
  } catch (error) {
    dispatch(addToOrderListError());
    console.log(error);
  }
};

export const removeFromOrderList = (order) => async (dispatch, getState) => {
  try {
    dispatch(removeFromOrderListStart());

    const orderList = JSON.parse(getState().orderList.orderList);
    const updatedOrderList = orderList.filter((item, index) => index !== order);
    
    dispatch(removeFromOrderListSuccess(JSON.stringify(updatedOrderList)));
  } catch (error) {
    dispatch(removeFromOrderListError());
    console.log(error);
  }
};

export const removeItemFromOrder = (orderIndex, productId) => async (dispatch, getState) => {
  try {
    dispatch(removeItemFromOrderStart());
    
    let updatedOrderList = [...JSON.parse(getState().orderList.orderList)];
    updatedOrderList[orderIndex].items = updatedOrderList[orderIndex].items.filter((item) => item.id !== productId);
    
    dispatch(removeItemFromOrderSuccess(JSON.stringify(updatedOrderList)));
  } catch (error) {
    dispatch(removeItemFromOrderError());
    // console.log(error);
  }
};

export default orderListSlice.reducer;