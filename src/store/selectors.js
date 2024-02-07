import { createSelector } from "reselect";

const selectJsonData = (state) => {
  try {
    return JSON.parse(state);
  } catch (error) {
    return null;
  }
};

const SelectclubList = (state) => selectJsonData(state.clubList.clubs) || [];

export const memoizedSelectclubList = createSelector(
  [SelectclubList],
  (clubs) => clubs
);