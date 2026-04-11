import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StripeTerminalProvider, useStripeTerminal } from "@stripe/stripe-terminal-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { POS_STORE_API_URL, POS_API_TOKEN } from "./config";
import MainStack from "./MainStack"; // 👈 we create next

import { memoizedStoreData } from "./store/selectors";
import LoadingScreen from "./shared/LoadingScreen";

const AppWithStripe = () => {
  const storeData = useSelector(memoizedStoreData);
  const [publishableKey, setPublishableKey] = useState("");

  useEffect(() => {
    if (storeData) {
      try {
        const getways = storeData?.Getway;
        const stripGateway = getways.find(
          (item) => item.name.toLowerCase() === "stripe",
        );

        const gatewayCredential = JSON.parse(stripGateway.data);

        setPublishableKey(
          stripGateway.test_mode === 1
            ? gatewayCredential.test_publishable_key
            : gatewayCredential.publishable_key,
        );
      } catch (error) {
        console.log("Stripe key error", error);
      }
    }
  }, [storeData]);

  const fetchTokenProvider = async () => {
    try {
      const club = await AsyncStorage.getItem("club");

      if (JSON.parse(club)?.post_slug) {
        const response = await axios.get(
          `${POS_STORE_API_URL}/pos-stripe-reader-connection-token`,
          {
            headers: {
              Apitoken: POS_API_TOKEN,
              "X-Tenant": JSON.parse(club)?.post_slug,
            },
          },
        );

        if (response?.data?.secret?.secret) {
          return response.data.secret.secret;
        }
      }
    } catch (error) {
      alert("Unable to receive connection token");
    }
  };

  

  console.log("publishableKey", publishableKey);

  // ⛔ wait for stripe key
  if (!publishableKey) return <LoadingScreen />;

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.booostr.posapp"
      urlScheme="booostrpos"
    >
      <StripeTerminalProvider tokenProvider={fetchTokenProvider}>
        <MainStack />
      </StripeTerminalProvider>
    </StripeProvider>
  );
};

export default AppWithStripe;
