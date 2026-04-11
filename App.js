import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import { Buffer } from "buffer";
import AppWithStripe from "./src/AppWithStripe";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AgreementScreen from "./src/screens/Agreement";
import ClubList from "./src/screens/ClubList";
import { fetchUserData } from "./src/store/reducers/authSlice";
import { fetchEulaUpdate } from "./src/store/reducers/eulaSlice";
import { memoizedStoreData } from "./src/store/selectors";
import * as SQLite from "expo-sqlite";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

const Stack = createNativeStackNavigator();

const App = () => {
  const dispatch = useDispatch();
  const storeData = useSelector(memoizedStoreData);
  const isEula = useSelector((state) => state.eula.eulaConsent);
  const [club, setClub] = useState(null);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const db = SQLite.openDatabaseSync("pos.db");

  useEffect(() => {
    const fetchData = async () => {
      const storedUserId = await AsyncStorage.getItem("user_id");
      if (storedUserId) {
        dispatch(fetchUserData(parseInt(JSON.parse(storedUserId))));
        dispatch(fetchEulaUpdate(parseInt(JSON.parse(storedUserId))));
      }
    };

    fetchData(); // Call the async function
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const club = await AsyncStorage.getItem("club");
        if (club) setClub(JSON.parse(club));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
      }
    };
    fetchData();
  }, [isLoggedIn, storeData]);

  useEffect(() => {
    if (!isLoggedIn) {
      setClub(null);
    }
  }, [isLoggedIn]);

  // AsyncStorage.clear();
  // AsyncStorage.removeItem('eula_consent');

  // Setup Order Database
  // useEffect(() => {
  //   const setupDb = async () => {
  //       console.log('starting db setup');
  //       if( club ){
  //         db.transaction((tx) => {
  //           tx.executeSql(
  //             'DROP TABLE IF EXISTS onHoldOrders;',
  //             [],
  //             () => {
  //               console.log('Table deleted successfully');
  //             },
  //             (_, error) => {
  //               console.error('Error deleting table:', error);
  //             }
  //           );
  //         });
  //       }
  //   }

  //   setupDb();
  // }, [club]);

  return (
    <SafeAreaProvider style={styles.container}>
      <NavigationContainer
        key={`nav-${isLoggedIn}${isEula}${club ? club.id : ""}`}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={
            isLoggedIn
              ? !isEula
                ? "Agreement"
                : !club
                  ? "Club"
                  : "MainApp"
              : "Login"
          }
        >
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Agreement" component={AgreementScreen} />
            <Stack.Screen name="Club" component={ClubList} />
            <Stack.Screen name="MainApp" component={AppWithStripe} />
          </>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
