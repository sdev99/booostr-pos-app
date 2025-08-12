import axios from "axios";
import { STRIPE_TERMINAL_API_URL } from "../config";
import { Buffer } from "buffer";

export const createStripeLocation = async (gateways, clubAddress) => {
  try {
    if (!gateways || !clubAddress) {
      return;
    }
    // get relevant key of stripe
    let secretKey = "";

    const stripGateway = gateways.find(
      (item) => item.name.toLowerCase() === "stripe"
    );
    if (!stripGateway) {
      return;
    }
    const gatewayCredential = JSON.parse(stripGateway.data);
    secretKey =
      stripGateway.test_mode === 1
        ? gatewayCredential.test_secret_key
        : gatewayCredential.secret_key;

    const postData = {
      display_name: clubAddress.store_legal_name,
      "address[line1]": clubAddress.store_legal_address,
      "address[city]": clubAddress.store_legal_city,
      "address[country]": clubAddress.country.substring(0, 2),
      "address[state]": clubAddress.state,
      "address[postal_code]": clubAddress.post_code,
    };

    const response = await axios.post(
      `${STRIPE_TERMINAL_API_URL}/locations`,
      postData,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString(
            "base64"
          )}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("response::", response);
    if (response?.status === 200) {
      const result = response?.data;
      const locationId = result.id;

      return {
        status: "success",
        locationId,
      };
    } else if (response?.data?.message) {
      return {
        status: "error",
        message: response?.data?.message,
      };
    } else {
      return {
        status: "error",
        message: "Something went wrong",
      };
    }
  } catch (error) {
    if (error?.response?.data?.message) {
      return {
        status: "error",
        message: error.response.data.message,
      };
    }
    return {
      status: "error",
      message: error.toString(),
    };
  }
};
