import addOrder from "../api/order";
import { addToOrderList } from "../store/reducers/orderListSlice";

export const processCashOrder = (order) => (dispatch) => {
  const response = dispatch(addToOrderList(order))
  if( response === 'success' ){
    // dispatch(addOrder(order));
    return response;
  }else{
    return response;
  }
};

// export const syncOrder = () => (dispatch) => {};