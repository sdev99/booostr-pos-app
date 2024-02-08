import { createSelector } from "reselect";

const selectJsonData = (state) => {
  try {
    return JSON.parse(state);
  } catch (error) {
    return [];
  }
};

// const selectUserData = (state) => selectJsonData(state.auth.userData) || [];
const selectEulaContent = (state) => state.eula.eulaContent || '';
const selectClubList = (state) => {console.log(state.clubList.clubList); return selectJsonData(state.clubList.clubList);};

export const memoizedEulaContent = selectEulaContent;
export const memoizedClubList = selectClubList;