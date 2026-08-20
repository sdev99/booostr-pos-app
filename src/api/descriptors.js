import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";

export const getDescriptors = async (club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-get-descriptors`,
      {},
      {
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club.post_slug,
        },
      },
    );
    console.log("response", response.data);
    if (response?.data?.descriptors) {
      return {
        ...response?.data,
        status: "success",
      };
    } else if (response?.data?.error) {
      return response?.data?.message;
    } else {
      return "kindly try after some time.";
    }
  } catch (error) {
    if (error?.response?.data?.message) return error.response.data.message;
    return error.toString();
  }
};
export const addDescriptors = async (club, data) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-add-descriptor`,
      data,
      {
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
export const deleteDescriptors = async (club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-delete-descriptor`,
      {},
      {
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
export const updateDescriptors = async (club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-update-descriptor`,
      {},
      {
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
