import emailService from "../api/email";

export const sendReceipt = (order) => (dispatch) => {
  return emailService.sendReceipt(order)
    .then(
      (response) => {
        if (response?.status === "success") {
          Promise.resolve();
          return response;
        }else{
          Promise.reject();
          return response;
        }
      },
      (error) => {
        Promise.reject();
        return error.toString();
      }
    )
    .catch((error) => {
      return error.toString();
    });
};