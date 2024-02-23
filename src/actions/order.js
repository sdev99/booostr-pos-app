import orderService from "../api/order";
import { addToOrderList } from "../store/reducers/orderListSlice";

// export const processCashOrder = (order) => (dispatch) => {
//   const response = dispatch(addToOrderList(order))
//   if( response === 'success' ){
//     // dispatch(addOrder(order));
//     return response;
//   }else{
//     return response;
//   }
// };

export const processOrder = (order, club) => (dispatch) => {
  return orderService.processOrder(order, club)
    .then(
      (response) => {
        if (response?.status === "success") {
          // dispatch(addToOrderList(order))
          return Promise.resolve(response);
        }else{
          return Promise.reject(response);
        }
      },
      (error) => {
        return Promise.reject(error.toString());
      }
    )
    .catch((error) => {
      return Promise.reject(error.toString());
    });
};

// export const syncOrder = () => (dispatch) => {};