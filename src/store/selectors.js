import { createSelector } from "reselect";

const selectJsonData = (state) => {
  try {
    return JSON.parse(state);
  } catch (error) {
    return state;
  }
};

const selectUserData = (state) => state.auth.userData || "";
const selectStoreData = (state) => state.storeData.storeData || "";
const selectEulaContent = (state) => state.eula.eulaContent || "";
const selectClubList = (state) => state.clubList.clubList || "";
const selectProductCategoryList = (state) =>
  state.productCategoryList.categoryList || "";
const selectProductList = (state) => state.productList.productList || "{}";
const selectOrderList = (state) => state.orderList.orderList || "[]";
const selectCartData = (state) => state.cart.cart || "[]";

export const memoizedUserData = createSelector([selectUserData], (userData) => {
  return selectJsonData(userData);
});
export const memoizedStoreData = createSelector(
  [selectStoreData],
  (storeData) => {
    return selectJsonData(storeData);
  }
);
export const memoizedEulaContent = createSelector(
  [selectEulaContent],
  (eulaContent) => {
    return selectJsonData(eulaContent);
  }
);
export const memoizedClubList = createSelector([selectClubList], (clubList) => {
  return selectJsonData(clubList);
});
export const memoizedProductCategoryList = createSelector(
  [selectProductCategoryList],
  (categoryList) => {
    return selectJsonData(categoryList);
  }
);
export const memoizedProductList = createSelector(
  [selectProductList],
  (productList) => {
    try {
      return JSON.parse(productList);
    } catch (error) {
      return {};
    }
  }
);
export const memoizedOrderList = createSelector(
  [selectOrderList],
  (orderList) => {
    return selectJsonData(orderList);
  }
);
export const memoizedCart = createSelector([selectCartData], (cart) => {
  return selectJsonData(cart);
});
