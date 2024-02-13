import { createSelector } from "reselect";

const selectJsonData = (state) => {
  try {
    return JSON.parse(state);
  } catch (error) {
    return [];
  }
};

const selectUserData = (state) => state.auth.userData || '';
const selectEulaContent = (state) => state.eula.eulaContent || '';
const selectClubList = (state) => state.clubList.clubList || '';
const selectProductCategoryList = (state) => state.productCategoryList.categoryList || '';
const selectProductList = (state) => state.productList.productList || '{}';
const selectOrderList = (state) => state.orderList.orderList || '[]';

export const memoizedUserData = createSelector(
  [selectUserData],
  (userData) => { return selectJsonData(userData)}
);
export const memoizedEulaContent = createSelector(
  [selectEulaContent],
  (eulaContent) => { return selectJsonData(eulaContent)}
);
export const memoizedClubList = createSelector(
  [selectClubList],
  (clubList) => { return selectJsonData(clubList)}
);
export const memoizedProductCategoryList = createSelector(
  [selectProductCategoryList],
  (categoryList) => { return selectJsonData(categoryList)}
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
  (orderList) => { return selectJsonData(orderList)}
);