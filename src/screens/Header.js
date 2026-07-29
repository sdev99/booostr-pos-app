// Header.js
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, Image, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetOrderList } from "../store/reducers/orderListSlice";
import { resetCart } from "../store/reducers/cartSlice";
import { memoizedCart } from "../store/selectors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Header = ({ clubName }) => {
  const insets = useSafeAreaInsets();

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [club, setClub] = useState(null);
  const cart = useSelector(memoizedCart);

  // Fetch Club Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const club = await AsyncStorage.getItem("club");
        if (club) {
          setClub(JSON.parse(club));
        }
      } catch (error) {
        console.error("Error fetching club data:", error);
      }
    };

    fetchData();
  }, [clubName]);

  const handleNewOrder = () => {
    // Navigate to the OrderScreen when the "New Order" button is pressed
    navigation.navigate("Orders");
  };

  const handleLogout = async () => {
    try {
      try {
        AsyncStorage.removeItem("club");
        dispatch(resetOrderList());
        dispatch(resetCart());
      } catch (error) {
        console.error("Error changing club:", error);
      }
      navigation.navigate("Club");
    } catch (error) {
      console.error("Error changing club:", error);
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.leftContainer}>
        {/*<Image source={require("../assets/logo.png")} style={styles.clubImage} />*/}
        <Text style={styles.clubName} onPress={handleLogout}>
          {club?.post_title}
        </Text>
      </View>
      <TouchableOpacity style={styles.rightContainer} onPress={handleNewOrder}>
        <Text style={styles.newOrderButton}>
          {cart?.length ? "Continue Order" : "New Order"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS == "ios" ? 55 : 20,
    backgroundColor: "#00c0ff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  newOrderButton: {
    color: "#fff",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#fff",
    padding: 5,
    borderRadius: 5,
  },
  clubImage: {
    width: 100,
    height: 50,
    marginRight: 10,
    objectFit: "contain",
  },
  clubName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  rightContainer: {
    padding: 5,
  },
};

export default Header;
