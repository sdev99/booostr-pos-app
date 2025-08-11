import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../actions/auth";
import { memoizedUserData } from "../store/selectors";
import Header from "./Header";
import BottomBar from "./BottomBar";
import { useStripeTerminal } from "@stripe/stripe-terminal-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FullScreenLoader from "./Modal/FullScreenLoader";

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
  const loaderRef = useRef();

  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [isReadersModalVisible, setReadersModalVisible] = useState(false);
  const [discoverReaderErrorMsg, setDiscoverReaderErrorMsg] = useState("");
  const loading = useSelector((state) => state.auth.loading);
  const userData = useSelector(memoizedUserData);
  const {
    getLocations,
    discoverReaders,
    connectReader: connectBluetoothReader,
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
    // The list of discovered readers is reported in the `didUpdateDiscoveredReaders` method
    // within the `useStripeTerminal` hook.
    setDiscoverReaderErrorMsg("");
    const { error } = await discoverReaders({
      discoveryMethod: "bluetoothScan",
      // simulated: true,
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
      console.log("connectBluetoothReader error", error);
      // alert(`Error cancelling scan: ${error.message}`);
      return;
    }
  };

  const handleConnectBluetoothReader = async (selectedReader) => {
    // Get locations
    let locationId = selectedReader.locationId;
    try {
      loaderRef.current?.show(`Connecting Reader\n(${selectedReader.serialNumber})`);

      const club = await AsyncStorage.getItem("club");
      const clubData = JSON.parse(club);

      const response = await getLocations(); // get locations from stripe
      if (response.locations?.length > 0) {
        const locationData = response.locations.find(
          (location) =>
            location.displayName.toLowerCase() ===
            clubData.post_title.toLowerCase()
        );
        if (locationData) {
          locationId = locationData.id;
        } else {
          locationId = response.locations[0].id;
        }
      }
    } catch (error) {}

    try {
      if (!locationId) {
        loaderRef.current?.hide();
        Alert.alert(
          "Location Not Found!",
          "Please create location on the stripe dashboard for your club."
        );
        return;
      }
      const { reader, error } = await connectBluetoothReader(
        {
          reader: selectedReader,
          // Since the simulated reader is not associated with a real location, we recommend
          // specifying its existing mock location.
          locationId,
        },
        "bluetoothScan"
      );

      if (error) {
        loaderRef.current?.hide();
        console.log("connectBluetoothReader error", error.message);
        Alert.alert("Connect Error!", error.message);
        return;
      } else {
        loaderRef.current?.hide();
        setReadersModalVisible(false);
        Alert.alert("Success!", "Reader connected successfully.");
      }
    } catch (error) {
      loaderRef.current?.hide();
      console.error("Error while fetching connected reader:", error);
      Alert.alert("Connect Error!", `Throw: ${error.message}`);
    }
  };

  const connectReader = () => {
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
                  onPress={connectReader}
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
      <Modal
        transparent={true}
        animationType="slide"
        visible={isReadersModalVisible}
        onRequestClose={toggleReadersModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {discoveredReaders?.length > 0
                ? "Found Stripe Reader"
                : "Stripe Reader Discover"}
            </Text>
            <ScrollView style={styles.readerList}>
              {discoverReaderErrorMsg ? (
                <Text style={styles.scanning}>{discoverReaderErrorMsg}</Text>
              ) : (
                <>
                  {discoveredReaders.map((reader, index) => {
                    return (
                      <View key={index} style={styles.reader}>
                        <Text style={styles.readerText}>
                          {reader.serialNumber}
                        </Text>
                        <TouchableOpacity
                          style={styles.readerConnect}
                          onPress={() => handleConnectBluetoothReader(reader)}
                        >
                          <Text style={styles.readerConnectText}>Connect</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {discoveredReaders.length === 0 && (
                    <Text style={styles.scanning}>Scanning...</Text>
                  )}
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={toggleReadersModal}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FullScreenLoader ref={loaderRef} />
      </Modal>

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
  readerList: {
    marginVertical: 20,
  },
  reader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  readerText: {
    alignSelf: "center",
    fontSize: 16,
  },
  readerConnect: {
    backgroundColor: "#34c759",
    padding: 8,
    borderRadius: 5,
    color: "white",
  },
  readerConnectText: {
    color: "white",
  },
  scanning: {
    alignSelf: "center",
    marginTop: 10,
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
