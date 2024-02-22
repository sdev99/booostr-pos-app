import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";

const addOrder = async (user) => {
  try {
    const response = await axios.post(`${POS_API_URL}/pos-login`, {
      username: user.username,
      password: user.password,
    });
    if (response && response?.data?.data) {
      const userdata = response.data.data;
    } else {
      console.log('Error submitting order to server.')
    }
  } catch (error) {
    console.error('Error submitting order to server: ', error);
  } finally {
  }
};

const processOrder = async (order, club) => {
  try {
    // const response = await axios.post(`${POS_STORE_API_URL}/pos-make-order`,order,{
    const response = await axios.post(`http://192.168.1.37/projects/booostr-ecomm/api/pos-make-order`,order,{
      headers: {
        'Apitoken': POS_API_TOKEN,
        'X-Tenant': club.post_slug
      },
    });
    console.log(response.data);
    if(response?.data?.status){
      return {
        status: "success",
      };
    }else if(response?.data?.message){
      return response?.data?.message;
    }else{
      return "kindly try after some time.";
    }
  } catch (error) {
    if( error?.response?.data?.message ) return error.response.data.message;
    return error.toString();
  }
};

export default {
  addOrder,
  processOrder,
  // getUserDataById,
};
