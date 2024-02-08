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

export const memoizedEulaContent = selectEulaContent;