import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";

const processOrder = async (order, club) => {
  try {
    const response = await axios.post(`${POS_STORE_API_URL}/pos-make-order`, order, {
      // const response = await axios.post(`http://192.168.1.50/projects/booostr-ecomm/api/pos-make-order`,order,{
      headers: {
        Apitoken: POS_API_TOKEN,
        "X-Tenant": club.post_slug,
      },
    });
    if (response?.data?.status) {
      return {
        ...response?.data,
        status: "success",
      };
    } else if (response?.data?.message) {
      return response?.data?.message;
    } else {
      return "kindly try after some time.";
    }
  } catch (error) {
    if (error?.response?.data?.message) return error.response.data.message;
    return error.toString();
  }
};

const fullRefund = async (refundData, club) => {
  try {
    // console.log("Refund API URL:", POS_STORE_API_URL);
    // console.log("Refund Data:", refundData);
    // console.log("Tenant:", club?.post_slug);

    const response = await axios.post(`${POS_STORE_API_URL}/pos-refund-payment`, refundData, {
      headers: {
        Apitoken: POS_API_TOKEN,
        "X-Tenant": club?.post_slug,
      },
    });

    console.log("Refund API status:", response.status);
    console.log("Refund API response:", response.data);

    return {
      ...response.data,
      status: "success",
    };
  } catch (error) {
    console.log("Refund API status:", error?.response?.status);
    console.log("Refund API data:", error?.response?.data);
    console.log("Refund API error:", error?.message);

    if (error?.response?.data) {
      return {
        status: "failed",
        message: error.response.data.message,
      };
    }

    return {
      status: "failed",
      message: error.toString(),
    };
  }
};

const refundItem = async (refundData, club) => {
  try {
    const response = await axios.post(`${POS_STORE_API_URL}/pos-refund-payment`, refundData, {
      headers: {
        Apitoken: POS_API_TOKEN,
        "X-Tenant": club.post_slug,
      },
    });

    return response.data;
  } catch (error) {
    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      status: false,
      message: error.toString(),
    };
  }
};

export default {
  fullRefund,
  processOrder,
  refundItem,
};
