import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import eulaReducer from "./reducers/eulaSlice";
import clubListReducer from "./reducers/clubListSlice";
import productCategoryListReducer from "./reducers/productCategorySlice";
import productListReducer from "./reducers/productSlice";
import orderListReducer from "./reducers/orderListSlice";
import cartReducer from "./reducers/cartSlice";
import resetReducer from "./reducers/resetSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  eula: eulaReducer,
  clubList: clubListReducer,
  productCategoryList: productCategoryListReducer,
  productList: productListReducer,
  orderList: orderListReducer,
  cart: cartReducer,
  reset: resetReducer
});

const store = configureStore({
  reducer: rootReducer
});

export default store;