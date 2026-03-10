import React, { useEffect, useState } from "react";
// import {AppRegistry} from 'react-native';
import App from "./App";
import { registerRootComponent } from "expo";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./src/store/configureStore";
import { StripeTerminalProvider } from "@stripe/stripe-terminal-react-native";
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "./src/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider } from "@stripe/stripe-react-native";
import { memoizedStoreData } from "./src/store/selectors";

const AppWrap = () => {
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
      } catch (error) {}
    }
  }, [storeData]);

  //get connection token for stripe reader
  const fetchTokenProvider = async () => {
    try {
      club = await AsyncStorage.getItem("club");
      if (JSON.parse(club)?.post_slug) {
        const response = await axios.get(
          `${POS_STORE_API_URL}/pos-stripe-reader-connection-token`,
          // `https://phplaravel-1180784-4531756.cloudwaysapps.com/api/stripe-reader-connection-token`,
          {
            headers: {
              Apitoken: POS_API_TOKEN,
              "X-Tenant": JSON.parse(club)?.post_slug,
            },
          },
        );
        if (response?.data?.secret?.secret) {
          return response.data.secret.secret;
        } else {
          alert("Unable to receive connection token from the store API");
        }
      }
    } catch (error) {
      alert("Unable to receive connection token from the store API");
    }
    // return 'pst_test_YWNjdF8xTzBIWnRHbjZYQTlqYW9zLG5Kcm9SNDFxVUQ2SmdTbFpqc0VlajR0MVNMdUZ3U2o_00JY6Wa4sO';
  };

  return (
    <>
      {publishableKey ? (
        <StripeProvider
          key={publishableKey} // 👈 IMPORTANT FOR DYNAMIC publishableKey
          publishableKey={publishableKey}
          merchantIdentifier="merchant.com.booostr.posapp"
          urlScheme="booostrpos"
        >
          <StripeTerminalProvider
            logLevel="verbose"
            tokenProvider={fetchTokenProvider}
          >
            <App />
          </StripeTerminalProvider>
        </StripeProvider>
      ) : (
        <App />
      )}
    </>
  );
};

const ReduxApp = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrap />
      </PersistGate>
    </Provider>
  );
};

registerRootComponent(ReduxApp);
// AppRegistry.registerComponent('main', () => ReduxApp);
