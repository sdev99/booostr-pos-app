import {
  loginSuccess,
  loginError,
  loginRequest,
  resetLogin,
  logoutRequest
} from "../store/reducers/authSlice";

import AuthService from "../api/auth";

export const login = (user) => (dispatch) => {
  dispatch(loginRequest());
  return AuthService.logIn(user)
    .then(
      (response) => {
        if (response.status === "success") {
          let userdata = response.userdata;
          dispatch(loginSuccess(userdata));
          Promise.resolve();
          return response;
        }
      },
      (error) => {
        const message = error.toString();
        dispatch(loginError());
        Promise.reject();
        return message;
      }
    )
    .catch((err) => {
      dispatch(loginError());
      reject(err);
    });
};
export const logout = (CurrentUserID) => (dispatch) => {
  dispatch(logoutRequest());
  return AuthService.logOut(CurrentUserID).then((response) => {
    if (response.status === "success") {
      dispatch(resetLogin());
      return response;
    }
  });
};

export const getUserData = (user_id) => (dispatch) => {
  return AuthService.getUserDataById(user_id).then((response) => {
    if (response.status === "success") {
      Promise.resolve();
      return response;
    }
  });
};