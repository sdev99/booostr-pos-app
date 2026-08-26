import { createSlice } from "@reduxjs/toolkit";
import { resetAllStates } from "./resetSlice";

const initialState = {
  orderList: "[]",
  loading: false,
  error: false,
};

const orderListSlice = createSlice({
  name: "orderList",
  initialState,
  reducers: {
    setupOrderListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    setupOrderListSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    setupOrderListError: (state) => {
      state.loading = false;
      state.error = true;
    },
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
    removeOrderFromOrderListStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    removeOrderFromOrderListSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    removeOrderFromOrderListError: (state) => {
      state.loading = false;
      state.error = true;
    },
    increaseItemInOrderStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    increaseItemInOrderSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    increaseItemInOrderError: (state) => {
      state.loading = false;
      state.error = true;
    },
    decreaseItemInOrderStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    decreaseItemInOrderSuccess: (state, action) => {
      state.orderList = action.payload;
      state.loading = false;
      state.error = false;
    },
    decreaseItemInOrderError: (state) => {
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
      state.orderList = "[]";
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
  setupOrderListStart,
  setupOrderListSuccess,
  setupOrderListError,
  addToOrderListStart,
  addToOrderListSuccess,
  addToOrderListError,
  removeOrderFromOrderListStart,
  removeOrderFromOrderListSuccess,
  removeOrderFromOrderListError,
  increaseItemInOrderStart,
  increaseItemInOrderSuccess,
  increaseItemInOrderError,
  decreaseItemInOrderStart,
  decreaseItemInOrderSuccess,
  decreaseItemInOrderError,
  removeItemFromOrderStart,
  removeItemFromOrderSuccess,
  removeItemFromOrderError,
  resetOrderList,
} = orderListSlice.actions;

export const setupOrderList = (orders) => async (dispatch, getState) => {
  try {
    if (JSON.parse(getState().orderList.orderList) == "") {
      dispatch(setupOrderListStart());
      dispatch(setupOrderListSuccess(JSON.stringify(orders)));
    }
  } catch (error) {
    dispatch(addToOrderListError());
    console.log(error);
  }
};

export const addToOrderList = (order) => async (dispatch, getState) => {
  try {
    dispatch(addToOrderListStart());

    const orderList = JSON.parse(getState().orderList.orderList);
    const updatedOrderList = orderList ? [...orderList, order] : [order];

    dispatch(addToOrderListSuccess(JSON.stringify(updatedOrderList)));
    return "success";
  } catch (error) {
    dispatch(addToOrderListError());
    console.log(error);
    return error.toString();
  }
};

export const removeOrderFromOrderList = (order) => async (dispatch, getState) => {
  try {
    dispatch(removeOrderFromOrderListStart());

    const orderList = JSON.parse(getState().orderList.orderList);
    const updatedOrderList = orderList.filter((item, index) => index !== order);
   
    dispatch(removeOrderFromOrderListSuccess(JSON.stringify(updatedOrderList)));
  } catch (error) {
    dispatch(removeOrderFromOrderListError());
    console.log(error);
  }
};

export const increaseItemInOrder = (orderIndex, itemIndex) => async (dispatch, getState) => {
  try {
    dispatch(increaseItemInOrderStart());

    let updatedOrderList = [...JSON.parse(getState().orderList.orderList)];
    updatedOrderList[orderIndex].items[itemIndex].cart_quantity += 1;

    dispatch(increaseItemInOrderSuccess(JSON.stringify(updatedOrderList)));
  } catch (error) {
    dispatch(increaseItemInOrderError());
    console.log(error);
  }
};

export const decreaseItemInOrder = (orderIndex, itemIndex) => async (dispatch, getState) => {
  try {
    dispatch(decreaseItemInOrderStart());

    let updatedOrderList = [...JSON.parse(getState().orderList.orderList)];

    if (updatedOrderList[orderIndex].items[itemIndex].cart_quantity === 1) {
      updatedOrderList[orderIndex].items = updatedOrderList[orderIndex].items.filter(
        (item, index) => index !== itemIndex,
      );
    } else {
      updatedOrderList[orderIndex].items[itemIndex].cart_quantity -= 1;
    }

    dispatch(decreaseItemInOrderSuccess(JSON.stringify(updatedOrderList)));
    if (updatedOrderList[orderIndex].items.length === 0) {
      dispatch(removeOrderFromOrderList(orderIndex));
      return 0;
    }
  } catch (error) {
    dispatch(decreaseItemInOrderError());
    console.log(error);
  }
};

export const removeItemFromOrder = (orderIndex, productId) => async (dispatch, getState) => {
  try {
    dispatch(removeItemFromOrderStart());

    let updatedOrderList = [...JSON.parse(getState().orderList.orderList)];
    updatedOrderList[orderIndex].items = updatedOrderList[orderIndex].items.filter(
      (item) => item.id !== productId,
    );

    dispatch(removeItemFromOrderSuccess(JSON.stringify(updatedOrderList)));
  } catch (error) {
    dispatch(removeItemFromOrderError());
    // console.log(error);
  }
};

export default orderListSlice.reducer;
