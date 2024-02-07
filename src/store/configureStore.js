import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import resetReducer from "./reducers/resetSlice";
import authReducer from "./reducers/authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  reset: resetReducer
});

const store = configureStore({
  reducer: rootReducer
});

export default store;