import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sendReceipt = async (order) => {
  try {
    const club = await AsyncStorage.getItem("club");
    if( club ){
      const response = await axios.post(`${POS_STORE_API_URL}/pos-email-send`,order,{
        headers: {
          'Apitoken': POS_API_TOKEN,
          'X-Tenant': JSON.parse(club).post_slug
        },
      });
      if(!response?.data?.error){
        return {
          status: "success",
        };
      }else if(response?.data?.message){
        return response?.data?.message;
      }else{
        return "kindly try after some time.";
      }
    }
  } catch (error) {
    return error.toString();
  }
};

export default {
  sendReceipt
};
