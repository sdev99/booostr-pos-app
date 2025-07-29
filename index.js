import React, { useEffect } from 'react';
// import {AppRegistry} from 'react-native';
import App from './App';
import { registerRootComponent } from 'expo';
import {Provider} from 'react-redux';
import store from './src/store/configureStore';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "./src/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ReduxApp = () => {
  //get connection token for stripe reader
  const fetchTokenProvider = async () => {
    try {
      club = await AsyncStorage.getItem("club");
      if( JSON.parse(club)?.post_slug ){
        const response = await axios.get(
          `${POS_STORE_API_URL}/pos-stripe-reader-connection-token`,
          // `https://phplaravel-1180784-4531756.cloudwaysapps.com/api/stripe-reader-connection-token`,
          {
            headers: {
              'Apitoken': POS_API_TOKEN,
              'X-Tenant': JSON.parse(club)?.post_slug
            },
          }
        );
        if( response?.data?.secret?.secret ){
          return response.data.secret.secret;
        }else{
          alert('Unable to receive connection token from the store API');
        }
      }
    } catch (error) {
      alert('Unable to receive connection token from the store API');
    }
    // return 'pst_test_YWNjdF8xTzBIWnRHbjZYQTlqYW9zLG5Kcm9SNDFxVUQ2SmdTbFpqc0VlajR0MVNMdUZ3U2o_00JY6Wa4sO';
  };

  return (
    <Provider store={store}>
      <StripeTerminalProvider
        logLevel="verbose"
        tokenProvider={fetchTokenProvider}
      >
        <App />
      </StripeTerminalProvider>
    </Provider>
  );
};

registerRootComponent(ReduxApp);
// AppRegistry.registerComponent('main', () => ReduxApp);