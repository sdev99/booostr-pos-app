import { createSlice } from "@reduxjs/toolkit";
import { resetAllStates } from "./resetSlice";

const initialState = {
  cart: '[]',
  loading: false,
  error: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProductToCartStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    addProductToCartSuccess: (state, action) => {
      state.cart = action.payload;
      state.loading = false;
      state.error = false;
    },
    addProductToCartError: (state) => {
      state.loading = false;
      state.error = true;
    },
    decreaseProductFromCartStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    decreaseProductFromCartSuccess: (state, action) => {
      state.cart = action.payload;
      state.loading = false;
      state.error = false;
    },
    decreaseProductFromCartError: (state) => {
      state.loading = false;
      state.error = true;
    },
    removeProductFromCartStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    removeProductFromCartSuccess: (state, action) => {
      state.cart = action.payload;
      state.loading = false;
      state.error = false;
    },
    removeProductFromCartError: (state) => {
      state.loading = false;
      state.error = true;
    },
    resetCart: (state) => {
      state.cart = '[]';
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
  addProductToCartStart,
  addProductToCartSuccess,
  addProductToCartError,
  decreaseProductFromCartStart,
  decreaseProductFromCartSuccess,
  decreaseProductFromCartError,
  removeProductFromCartStart,
  removeProductFromCartSuccess,
  removeProductFromCartError,
  resetCart
} = cartSlice.actions;

export const addProductToCart = (product) => async (dispatch, getState) => {
  try {
    dispatch(addProductToCartStart());

    const cart = JSON.parse(getState().cart.cart);
    const index = cart.findIndex(obj => JSON.stringify(obj) === JSON.stringify(product));
    if( index !== -1 ){
      let updatedCart = [...cart];
      updatedCart[index].cart_quantity += 1;
      dispatch(addProductToCartSuccess(JSON.stringify(updatedCart)));
    }else{
      product['cart_quantity'] = 1;
      dispatch(addProductToCartSuccess(JSON.stringify([...cart, product])));
    }
  } catch (error) {
    dispatch(addProductToCartError());
    console.log(error);
  }
};

export const decreaseProductFromCart = (productIndex) => async (dispatch, getState) => {
  try {
    dispatch(decreaseProductFromCartStart());

    const cart = JSON.parse(getState().cart.cart);
    let updatedCart = '[]';
    if( cart[productIndex].cart_quantity > 1 ){
      updatedCart = [...cart];
      updatedCart[productIndex].cart_quantity -= 1;
    }else{
      updatedCart = cart.filter((item, index) => index!=productIndex);
    }
  
    dispatch(decreaseProductFromCartSuccess(JSON.stringify(updatedCart)));

    return updatedCart.length;
  } catch (error) {
    dispatch(decreaseProductFromCartError());
    console.log(error);
  }
};

export const removeProductFromCart = (productIndex) => async (dispatch, getState) => {
  try {
    dispatch(removeProductFromCartStart());

    const cart = JSON.parse(getState().cart.cart);
    updatedCart = cart.filter((item, index) => index!=productIndex);
  
    dispatch(removeProductFromCartSuccess(JSON.stringify(updatedCart)));
  } catch (error) {
    dispatch(removeProductFromCartError());
    console.log(error);
  }
};

export default cartSlice.reducer;