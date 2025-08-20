import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import authReducer from "./reducers/authSlice";
import storeDataReducer from "./reducers/storeDetailSlice";
import eulaReducer from "./reducers/eulaSlice";
import clubListReducer from "./reducers/clubListSlice";
import productCategoryListReducer from "./reducers/productCategorySlice";
import productListReducer from "./reducers/productSlice";
import orderListReducer from "./reducers/orderListSlice";
import cartReducer from "./reducers/cartSlice";
import resetReducer from "./reducers/resetSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  storeData: storeDataReducer,
  eula: eulaReducer,
  clubList: clubListReducer,
  productCategoryList: productCategoryListReducer,
  productList: productListReducer,
  orderList: orderListReducer,
  cart: cartReducer,
  reset: resetReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;
export const persistor = persistStore(store);
