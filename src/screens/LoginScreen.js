import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ImageBackground
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { Button as PaperButton } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import bgImg from "../assets/chat-bg.png";
import { login } from "../actions/auth";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();
  const handleLogin = () => {
    if (!email || !password) {
      // Check if email or password is empty
      alert("Please enter both email/username and password.");
      return;
    }

    if (!email) {
      // Check if email is empty
      alert("Please enter your email or username.");
      return;
    }

    if (!password) {
      // Check if password is empty
      alert("Please enter your password.");
      return;
    }

    let user = {
      username: email,
      password: password,
    };
    dispatch(login(user))
      .then((response) => {
        if (response.status == "success") {
          navigation.navigate("Agrement");
        }
      })
      .catch((error) => {});
  };

  const imgProps = Image.resolveAssetSource(bgImg).uri;
  const image = { uri: imgProps };

  return (
    <View style={[styles.top_main]}>
      <ImageBackground style={styles.img_top} source={image} resizeMode="cover">
        <View style={styles.container}>
          
          <View style={styles.logoBox}>
            {/*<Image source={require("../assets/logo.png")} style={styles.logo} />*/}
            <Text style={styles.title}>Booostr POS</Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.smallText, styles.forText]}>
              Login to Booostr POS application
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
            {loading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="medium" color="#00c0ff" />
              </View>
            ) : (
              <PaperButton
                mode="contained"
                style={styles.button}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Login</Text>
              </PaperButton>
            )}
          </View>
          <View style={styles.BottomText}>
            <Text style={[styles.smallText, styles.ForWidth]}>
              To access Booostr POS App, you need to have enabled the Store Tool on Booostr for your organization’s Booostr Profile. In order to enable the Store Tool feature in Booostr, you must have a Booostr user account that is a profile manager of an organization with an approved, live profile on Booostr.
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
    maxWidth: 650,
    alignItems: "center",
  },
  BlueText: {
    color: "#00b0ef",
    textDecorationLine: "underline",
  },
  card: {
    width: "80%",
    maxWidth: 650,
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
    maxWidth: 650,
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
