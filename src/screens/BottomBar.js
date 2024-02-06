import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const BottomBar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const isActive = (screenName) => route.name === screenName;

  // Disable the Online Order menu
  const isOnlineOrderDisabled = false; // Set this to true to disable, or false to enable

  const handleNavigation = (screenName) => {
    if (!isOnlineOrderDisabled || screenName !== "OnlineOrder") {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.shadowContainer}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            isActive("Dashboard") && styles.activeNavItem,
          ]}
          onPress={() => handleNavigation("Dashboard")}
        >
          <MaterialIcons
            name="dashboard"
            size={24}
            color={isActive("Dashboard") ? "#fff" : "#000"}
          />
          <Text style={[styles.iconText, isActive("Dashboard") && styles.activeText]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            isActive("OnlineOrder") && !isOnlineOrderDisabled && styles.activeNavItem,
            isOnlineOrderDisabled && styles.disabledNavItem,
          ]}
          onPress={() => handleNavigation("OnlineOrder")}
          disabled={isOnlineOrderDisabled}
        >
         <MaterialIcons
  name="receipt"
  size={24}
  color={isOnlineOrderDisabled ? "#000" : (isActive("OnlineOrder") ? "#fff" : "#000")}
/>
          <Text style={[styles.iconText, isActive("OnlineOrder") && styles.activeText, isOnlineOrderDisabled && styles.disabledText]}>
            Manage Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            isActive("Settings") && styles.activeNavItem,
          ]}
          onPress={() => handleNavigation("Settings")}
        >
          <MaterialIcons
            name="settings"
            size={24}
            color={isActive("Settings") ? "#fff" : "#000"}
          />
          <Text style={[styles.iconText, isActive("Settings") && styles.activeText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  disabledNavItem: {
    backgroundColor: "#ccc", // Use a gray color or any other color for the disabled state
    borderRadius: 6,
  },
  disabledText: {
    color: "#000", // Set the text color to black for the disabled state
  },
  container: {
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
  
  },
  shadowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "transparent",
   
    paddingBottom:10
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 6,
  },
  iconText: {
    fontSize: 11,
    marginTop: 5,
    color: "#000",
  },
  activeNavItem: {
    backgroundColor: "#00c0ff",
    borderRadius: 6,
  },
  activeText: {
    color: "#fff",
  },
});

export default BottomBar;
