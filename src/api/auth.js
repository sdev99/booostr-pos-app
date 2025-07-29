import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { POS_API_URL } from "../config";
const logIn = async (user) => {
  try {
    const response = await axios.post(`${POS_API_URL}/pos-login`, {
      username: user.username,
      password: user.password,
    });
    if (response && response?.data?.data) {
      const userdata = response.data.data;

      if (userdata && userdata !== null && userdata?.post_author) {
        await AsyncStorage.setItem(
          "user_id",
          JSON.stringify(userdata?.post_author)
        );
        return {
          status: "success",
          message: "You are being redirecting to the club list page",
          userdata: JSON.stringify(userdata),
        };
      } else {
        alert("Login failed. Please try again later.");
      }
    } else {
      alert("Login failed. Please try again later.");
    }
  } catch (error) {
    alert("Login failed. Please try again later.");
  } finally {
  }
};

const logOut = async (CurrentUserID) => {
  try {
    // const response = await axios.post(`${POS_API_URL}/logout`, {
    //   user_id: CurrentUserID,
    // });
    // AsyncStorage.clear();
    AsyncStorage.removeItem("user_id");
    AsyncStorage.removeItem("club");
    return {
      status: "success",
      message: "You are logged out",
    };
  } catch (error) {
    throw error;
  }
};

// const getUserDataById = async (userId) => {
//   try {
//     const response = await axios.get(
//       `${POS_API_URL}/pos_get_user_info?user_id=${userId}`
//     );
//     return {
//       status: "success",
//       message: "You are redirecting to the home page",
//       data: JSON.stringify(response.data),
//     };
//   } catch (error) {
//     throw error;
//   }
// };

export default {
  logIn,
  logOut,
  // getUserDataById,
};
