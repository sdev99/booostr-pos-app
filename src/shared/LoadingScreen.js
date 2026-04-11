import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const LoadingScreen = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#00c0ff" />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default LoadingScreen;
