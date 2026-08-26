import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";

const processOrder = async (order, club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-make-order`,
      order,
      {
        // const response = await axios.post(`http://192.168.1.50/projects/booostr-ecomm/api/pos-make-order`,order,{
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club.post_slug,
        },
      },
    );
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

const refundPayment = async (refundData, club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-refund-payment`,
      refundData,
      {
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club?.post_slug,
        },
      },
    );
    return {
      ...response.data,
      status: "success",
    };
  } catch (error) {
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

const quickSaleRefundPayment = async (refundData, club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-refund-payment`,
      refundData,
      {
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club?.post_slug,
        },
      },
    );
    return {
      ...response.data,
      status: "success",
    };
  } catch (error) {
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

export default {
  refundPayment,
  quickSaleRefundPayment,
  processOrder,
};
