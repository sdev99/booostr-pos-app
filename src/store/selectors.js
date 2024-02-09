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