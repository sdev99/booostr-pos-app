import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  Platform,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../actions/auth";
import { memoizedUserData } from "../store/selectors";
import Header from "./Header";
import BottomBar from "./BottomBar";
import {
  requestNeededAndroidPermissions,
  useStripeTerminal,
} from "@stripe/stripe-terminal-react-native";
import StripeReaderModal from "./Modal/StripReaderModal";
import { STRIPE_TERMINAL_SIMULATE_MODE } from "../config";

const CustomModal = ({ isVisible, onClose, title, content }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            <Text style={styles.modalText}>{content}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const stripeReaderModalRef = useRef();

  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [isReadersModalVisible, setReadersModalVisible] = useState(false);
  const [discoverReaderErrorMsg, setDiscoverReaderErrorMsg] = useState("");
  const loading = useSelector((state) => state.auth.loading);
  const userData = useSelector(memoizedUserData);
  const {
    getLocations,
    discoverReaders,
    connectReader,
    discoveredReaders,
    connectedReader,
    cancelDiscovering,
    disconnectReader,
  } = useStripeTerminal({
    didUpdateDiscoveredReaders: (readers) => {
      // After the SDK discovers a reader, your app can connect to it.
      // Here, we're automatically connecting to the first discovered reader.
      // handleConnectBluetoothReader(readers[0].id);
      console.log("Discovered readers: ");
      // console.log(discoveredReaders);
    },
  });

  const handleLogout = () => {
    dispatch(logout(userData.user_id)).then((response) => {
      if (response.status === "success") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    });
  };

  const handleHelpAndSupport = () => {
    Linking.openURL("https://support.booostr.co").catch((error) =>
      console.error("Error opening URL:", error)
    );
  };

  const toggleAccountModal = () => {
    setAccountModalVisible(!isAccountModalVisible);
  };

  const toggleReadersModal = () => {
    if (isReadersModalVisible) cancelDiscoveringReader();
    setReadersModalVisible(!isReadersModalVisible);
  };

  const handleAgreementSupport = () => {
    navigation.navigate("Agrement", { onlyView: true });
  };

  const handleDiscoverReaders = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await requestNeededAndroidPermissions({
          accessFineLocation: {
            title: "Location Permission",
            message: "Location access is required in order to accept payments.",
            buttonPositive: "Accept",
          },
        });
        if (granted) {
          // Initialize the SDK
        } else {
          console.error(
            "Location and BT services are required to connect to a reader."
          );
        }
      } catch {}
    }
    // The list of discovered readers is reported in the `didUpdateDiscoveredReaders` method
    // within the `useStripeTerminal` hook.
    setDiscoverReaderErrorMsg("");
    const { error } = await discoverReaders({
      discoveryMethod: "bluetoothScan",
      simulated: STRIPE_TERMINAL_SIMULATE_MODE,
    });

    if (error) {
      if (error.code != "Canceled") {
        setDiscoverReaderErrorMsg(error.message);
      }
    }
  };

  const cancelDiscoveringReader = async () => {
    const { error } = await cancelDiscovering();

    if (error) {
      console.log("connectReader error", error);
      // alert(`Error cancelling scan: ${error.message}`);
      return;
    }
  };

  const handleConnectReader = () => {
    console.log("scanning for readers");
    toggleReadersModal();
    handleDiscoverReaders();
  };

  const disconnectFromReader = async () => {
    const { reader, error } = await disconnectReader();

    if (error) {
      console.log("connectBluetoothReader error", error);
      alert("Unable to disconnect from the reader.");
      return;
    }
  };

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {loading ? (
        <View style={styles.containerLoader}>
          <ActivityIndicator size="medium" color="#00c0ff" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.settingsWrap}>
            <View style={styles.allItems}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={toggleAccountModal}
              >
                <Icon
                  name="account"
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>Account</Text>
              </TouchableOpacity>
              {connectedReader ? (
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={disconnectFromReader}
                >
                  <Icon
                    name="contactless-payment-circle"
                    size={24}
                    color="#000"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>
                    {connectedReader.serialNumber}
                  </Text>
                  <View style={styles.disconnectReader}>
                    <View style={styles.disconnectReaderTextWrap}>
                      <Text style={styles.disconnectReaderText}>
                        Disconnect
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={handleConnectReader}
                >
                  <Icon
                    name="contactless-payment-circle"
                    size={24}
                    color="#000"
                    style={styles.settingIcon}
                  />
                  <Text style={styles.settingTitle}>Connect Reader</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleHelpAndSupport}
              >
                <Icon
                  name="help-circle"
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>Help and Support</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleAgreementSupport}
              >
                <Icon
                  name="help-circle"
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>
                  End-user License Agreement
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleLogout}
              >
                <Icon
                  name="logout"
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Account Modal */}
      <CustomModal
        isVisible={isAccountModalVisible}
        onClose={toggleAccountModal}
        title="Account Information"
        content={`User Name: ${userData?.first_name} ${userData?.last_name}\nEmail Address: ${userData.user_email}`}
      />

      {/* Readers Modal */}
      <StripeReaderModal
        ref={stripeReaderModalRef}
        visible={isReadersModalVisible}
        discoverReaderErrorMsg={discoverReaderErrorMsg}
        onRequestClose={toggleReadersModal}
        discoveredReaders={discoveredReaders}
        getLocations={getLocations}
        connectReader={connectReader}
      />

      <View style={styles.bottomBar}>
        <BottomBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingBottom: 80,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  allItems: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  settingsWrap: {
    padding: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: "#00c0ff",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  containerLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectReader: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  disconnectReaderTextWrap: {
    backgroundColor: "red",
    borderRadius: 5,
  },
  disconnectReaderText: {
    padding: 6,
    paddingHorizontal: 10,
    color: "white",
  },
});

export default SettingsScreen;
