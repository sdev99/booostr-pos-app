import { createSelector } from "reselect";

const selectJsonData = (state) => {
  try {
    return JSON.parse(state);
  } catch (error) {
    return null;
  }
};

const selectUserData = (state) => selectJsonData(state.auth.userData) || [];
const SelectEulaContent = (state) => selectJsonData(state.eula.eulaContent) || [];

export const memoizedCurrentUserData = createSelector(
  [selectUserData],
  (userData) => userData
);
export const memoizedEulaContent = createSelector(
  [SelectEulaContent],
  (eulaContent) => eulaContent
);