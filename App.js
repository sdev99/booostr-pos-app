import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from './src/screens/LoginScreen';
import { fetchEulaUpdate, fetchEula } from './src/store/reducers/eulaSlice';
import OrdersScreen from './src/screens/OrdersScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BottomBar from './src/screens/BottomBar';
import SettingsScreen from './src/screens/SettingsScreen';
import OnlineOrderScreen from './src/screens/OnlineOrderScreen';
import ClubList from './src/screens/ClubList';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import AgreementScreen from './src/screens/Agreement';
import CashScreen from './src/screens/CashScreen';
import CashReceiptScreen from './src/screens/CashReceiptScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn ] = useState(false);
  const isEula = useSelector((state) => state.eula.eulaConsent);
  const isEulaLoading = useSelector((state) => state.eula.loading);
  // AsyncStorage.clear();
  
  useEffect(() => {
    const fetchData = async () => {
      const storedUserId = parseInt(JSON.parse(await AsyncStorage.getItem("user_id")));
      if (storedUserId){
        setIsLoggedIn(true);
        dispatch(fetchEulaUpdate(storedUserId));
      }
      setLoading(false);
    };

    fetchData(); // Call the async function
    
  }, [dispatch]);

  if ( (loading && !isLoggedIn) || (isLoggedIn && isEulaLoading) )
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#00c0ff" />
      </View>
    );
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={isLoggedIn && isEula ? "Club" : isLoggedIn && !isEula ? "Agrement" : "Login"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Agrement" component={AgreementScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Club" component={ClubList} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Cash" component={CashScreen} />
            <Stack.Screen name="CashReceipt" component={CashReceiptScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="OnlineOrder" component={OnlineOrderScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="BottomBar" component={BottomBar} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
      
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;