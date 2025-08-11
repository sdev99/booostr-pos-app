import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";

export const getProductVariations = async (productId, club) => {
  try {
    const response = await axios.get(
      `${POS_STORE_API_URL}/product/${productId}`,
      {
        // const response = await axios.post(`http://192.168.1.50/projects/booostr-ecomm/api/pos-make-order`,order,{
        headers: {
          Apitoken: POS_API_TOKEN,
          "X-Tenant": club.post_slug,
        },
      }
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

export const getItemPrice = (item) => {
  let price = item.max_price;
  if (item.is_variation === 1 && item?.variation_price_object) {
    price = item?.variation_price_object.price;
  }
  return price;
};

export const getVariationsNames = (item) => {
  let options;
  if (item.variation_price_object) {
    options = item.variation_price_object; // this is for cart items
  } else {
    options = item; // this is for info object from api 
  }

  return options.varition_options?.map((option) => {
    const matchingVariation = options.varitions.find(
      (v) => v.pivot.productoption_id === option.id
    );

    return `${option.category.name}: ${matchingVariation?.name}`;
  });
};
