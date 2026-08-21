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
export const addDescriptors = async (payload, club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-add-descriptor`,
      payload,
      {
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club.post_slug,
        },
      },
    );
    console.log("response::", response.data);
    if (response?.data?.descriptors) {
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
    console.log("response::", error?.response?.data);

    if (error?.response?.data?.message) return error.response.data.message;
    return error.toString();
  }
};

export const updateDescriptors = async (payload, club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-update-descriptor`,
      payload,
      {
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club.post_slug,
        },
      },
    );
    console.log("response::", response.data);
    if (response?.data?.descriptors) {
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
    console.log("response::", error?.response?.data);

    if (error?.response?.data?.message) return error.response.data.message;
    return error.toString();
  }
};

export const deleteDescriptors = async (deletePayload, club) => {
  try {
    const response = await axios.post(
      `${POS_STORE_API_URL}/pos-quick-sale-delete-descriptor`,
      deletePayload,
      {
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club.post_slug,
        },
      },
    );
    if (response?.data?.deleted_ids) {
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
