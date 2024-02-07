import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import eulaReducer from "./reducers/eulaSlice";
import resetReducer from "./reducers/resetSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  eula: eulaReducer,
  reset: resetReducer
});

const store = configureStore({
  reducer: rootReducer
});

export default store;