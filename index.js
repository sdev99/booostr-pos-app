import React from 'react';
// import {AppRegistry} from 'react-native';
import App from './App';
import registerRootComponent from 'expo/build/launch/registerRootComponent';

import {Provider} from 'react-redux';

import store from './src/store/configureStore';

const ReduxApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

registerRootComponent(ReduxApp);
// AppRegistry.registerComponent('main', () => ReduxApp);