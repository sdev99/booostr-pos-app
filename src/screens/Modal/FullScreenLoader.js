// FullScreenLoader.js
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const FullScreenLoader = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useImperativeHandle(ref, () => ({
    show: (text = "") => {
      setVisible(true);
      setMessage(text);
    },
    updateMessage: (text = "") => {
      setMessage(text);
    },
    hide: () => setVisible(false),
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#fff" />
        {message ? <Text style={styles.text}>{message}</Text> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // make sure it's on top
    elevation: 9999, // Android
    padding: 16,
  },
  loaderBox: {
    alignItems: "center",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});

export default FullScreenLoader;
