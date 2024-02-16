import axios from "axios";
import { POS_API_URL } from "../config";

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

export default addOrder;
