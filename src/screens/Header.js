// Header.js
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Header = ({ title, clubName }) => {
  const navigation = useNavigation();

  const handleNewOrder = () => {
    // Navigate to the OrderScreen when the "New Order" button is pressed
    navigation.navigate("Orders");
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        {/*<Image source={require("../assets/logo.png")} style={styles.clubImage} />*/}
        <Text style={styles.clubName}>{clubName}</Text>
      </View>
      <TouchableOpacity style={styles.rightContainer} onPress={handleNewOrder}>
        <Text style={styles.newOrderButton}>New Order</Text>
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
