import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Button as PaperButton } from "react-native-paper";
import bgImg from "../assets/chat-bg.png";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    navigation.navigate('Agrement');
  };

  const imgProps = Image.resolveAssetSource(bgImg).uri;
  const image = { uri: imgProps };

  return (
    <View style={[styles.top_main]}>
      <ImageBackground style={styles.img_top} source={image} resizeMode="cover">
        <View style={styles.container}>
          
          <View style={styles.logoBox}>
            {/*<Image source={require("../assets/logo.png")} style={styles.logo} />*/}
            <Text style={styles.title}>Hello Tester Club</Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.smallText, styles.forText]}>
              Login to POS application
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email or Username"
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
            <PaperButton
              mode="contained"
              style={styles.button}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Login</Text>
            </PaperButton>
          </View>
          <View style={styles.BottomText}>
            <Text style={[styles.smallText, styles.ForWidth]}>
            To access the Team Chat feature for your organization using the POS system, you must possess a user account on the POS system. If you don't already have an account but require connectivity with a club or nonprofit using the POS system's Team Chat, you can create a new user account on the POS system platform.
             {/*} <Text
                style={styles.BlueText}
                onPress={() => Linking.openURL("https://example.com")}
              >
                create a free user account on Booostr.co.
              </Text>*/}
             
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  img_top: {
    height: "100%",
  },
  logo: {
    width: 130,
    height: 40,
  },
  smallText: {
    color: "#a9a9a9",
    textAlign: "center",
    marginVertical: 20,
  },
  BottomText: {
    width: "80%",
    alignItems: "center",
  },
  BlueText: {
    color: "#00b0ef",
    textDecorationLine: "underline",
  },
  card: {
    width: "80%",
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
    backgroundColor: "white",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  logoBox: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00b0ef",
    width: "80%",
    padding: 20,
    textAlign: "center",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
    textTransform: "capitalize",
    color: "#fff",
  },
  input: {
    width: "100%",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 13,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    fontStyle: "normal",
    color: "#515151",
    maxWidth: "100%",
    padding: 13,
  },
  button: {
    width: "100%",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#00c0ff",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#00c0ff",
    textTransform: "uppercase",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
  forgotPasswordMain: {
    color: "#a9a9a9",
    fontSize: 18,
    marginVertical: 15,
  },
  forgotPassword: {
    color: "#a9a9a9",
    fontSize: 16,
  },
  top_main: {
    flex: 1,
  },
  forText: {
    fontSize: 13,
  },
  loader: {
    marginTop: 10,
  },
});

export default LoginScreen;
