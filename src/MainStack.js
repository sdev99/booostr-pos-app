import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "./screens/DashboardScreen";
import OrdersScreen from "./screens/OrdersScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import CashScreen from "./screens/CashScreen";
import CashReceiptScreen from "./screens/CashReceiptScreen";
import PaymentSuccessScreen from "./screens/PaymentSuccessScreen";
import SettingsScreen from "./screens/SettingsScreen";
import OnlineOrderScreen from "./screens/OnlineOrderScreen";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import CompletedOrderDetailScreen from "./screens/CompletedOrderDetailScreen";
import BottomBar from "./screens/BottomBar";
import { useStripeTerminal } from "@stripe/stripe-terminal-react-native";
import { useEffect } from "react";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  const { initialize } = useStripeTerminal();

  useEffect(() => {
    initialize({
      // logLevel: 'verbose',
    });
  }, [initialize]);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
      <Stack.Screen
        name="CompletedOrderDetail"
        component={CompletedOrderDetailScreen}
      />
      <Stack.Screen name="BottomBar" component={BottomBar} />
    </Stack.Navigator>
  );
};

export default MainStack;
