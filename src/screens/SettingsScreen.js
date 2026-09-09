import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Modal,
  Platform,
  Alert,
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
import QuickSaleSettingModal from "./Modal/QuickSaleSettingModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [club, setClub] = useState(null);

  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [isReadersModalVisible, setReadersModalVisible] = useState(false);
  const [discoverReaderErrorMsg, setDiscoverReaderErrorMsg] = useState("");
  const [discoveryMethod, setDiscoveryMethod] = useState("");
  const [isQuickSaleModalVisible, setQuickSaleModalVisible] = useState(false);

  const loading = useSelector((state) => state.auth.loading);
  const userData = useSelector(memoizedUserData);
  const [readerBatteryLevel, setReaderBatteryLevel] = useState(null);

  const [firmwareUpdate, setFirmwareUpdate] = useState(null);
  const [isUpdatingFirmware, setIsUpdatingFirmware] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const {
    getLocations,
    discoverReaders,
    connectReader,
    discoveredReaders,
    connectedReader,
    cancelDiscovering,
    disconnectReader,
    supportsReadersOfType,
    installAvailableUpdate, // <-- Extract this
  } = useStripeTerminal({
    // Callbacks for Stripe Terminal events
    onUpdateDiscoveredReaders: (readers) => {
      console.log("Discovered readers:", JSON.stringify(readers, null, 2));
    },

    onDidUpdateBatteryLevel: (batteryLevel) => {
      console.log("========== READER BATTERY ==========");
      console.log("Battery:", batteryLevel);
      console.log("Battery Type:", typeof batteryLevel);
      console.log("====================================");

      if (
        batteryLevel !== null &&
        batteryLevel !== undefined &&
        Number.isFinite(Number(batteryLevel))
      ) {
        setReaderBatteryLevel(Number(batteryLevel));
      }
    },

    onDidReportLowBatteryWarning: () => {
      console.log("Stripe reported low battery warning");
    },

    // Firmware Update Listeners
    onDidReportAvailableUpdate: (update) => {
      console.log("Firmware Update Available:", update);
      setFirmwareUpdate(update);
    },

    onDidStartInstallingUpdate: () => {
      setIsUpdatingFirmware(true);
      setUpdateProgress(0);
    },

    onDidReportReaderSoftwareUpdateProgress: (progress) => {
      // progress value comes as 0.0 to 1.0
      setUpdateProgress(Math.round(progress * 100));
    },

    onDidFinishInstallingUpdate: ({ error }) => {
      setIsUpdatingFirmware(false);
      setFirmwareUpdate(null);
      if (error) {
        Alert.alert("Update Failed", error.message);
      } else {
        Alert.alert("Success", "Reader firmware updated successfully!");
      }
    },
  });

  //
  useEffect(() => {
    if (!connectedReader) {
      setReaderBatteryLevel(null);
    }
  }, [connectedReader]);

  // Handle requiredAt logic when firmwareUpdate is reported
  useEffect(() => {
    if (firmwareUpdate) {
      handleFirmwareUpdatePrompt(firmwareUpdate);
    }
  }, [firmwareUpdate]);

  const handleFirmwareUpdatePrompt = (update) => {
    const { requiredAt } = update;

    let isRequired = false;
    let title = "Software Update Available";
    let message = "A new firmware update is available for your reader.";

    if (requiredAt) {
      const requiredDate = new Date(requiredAt);
      const now = new Date();
      const formattedDate = `${requiredDate.toLocaleDateString()} ${requiredDate.toLocaleTimeString()}`;

      if (requiredDate <= now) {
        // STATE 3: Mandatory / Expired Date
        isRequired = true;
        title = "Required Firmware Update";
        message = `A mandatory update is required to continue using the reader. (Deadline: ${formattedDate})`;
      } else {
        // STATE 2: Optional with Upcoming Date
        title = "Upcoming Firmware Update";
        message = `A new update is available. This update will become mandatory on ${formattedDate}.`;
      }
    }

    const startUpdate = async () => {
      try {
        const { error } = await installAvailableUpdate();
        if (error) {
          Alert.alert("Update Error", error.message);
        }
      } catch (err) {
        Alert.alert("Update Error", err.message);
      }
    };

    if (isRequired) {
      // Blocking Alert (No Skip option)
      Alert.alert(
        title,
        message,
        [
          {
            text: "Update Now",
            onPress: startUpdate,
          },
        ],
        { cancelable: false },
      );
    } else {
      // Non-blocking Alert (Skip allowed)
      Alert.alert(title, message, [
        {
          text: "Skip / Later",
          style: "cancel",
          onPress: () => setFirmwareUpdate(null),
        },
        {
          text: "Update Now",
          onPress: startUpdate,
        },
      ]);
    }
  };
  // ========================================
  // FETCH CLUB
  // ========================================
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const clubStr = await AsyncStorage.getItem("club");

        if (clubStr) {
          setClub(JSON.parse(clubStr));
        }
      } catch (error) {
        console.error("Error fetching club data:", error);
      }
    };

    fetchClub();
  }, []);

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
      console.error("Error opening URL:", error),
    );
  };

  const toggleAccountModal = () => {
    setAccountModalVisible(!isAccountModalVisible);
  };

  const handleQuickSaleSettings = async () => {
    setQuickSaleModalVisible(true);
  };

  const toggleReadersModal = () => {
    if (isReadersModalVisible) cancelDiscoveringReader();
    setReadersModalVisible(!isReadersModalVisible);
  };

  const handleAgreementSupport = () => {
    navigation.navigate("Agrement", { onlyView: true });
  };

  // --- NEW: Handle Tap to Pay (Local Mobile Reader) ---
  const handleConnectTapToPay = async () => {
    setDiscoverReaderErrorMsg("");
    const { readerSupportResult, error } = await supportsReadersOfType({
      deviceType: "tapToPay",
      discoveryMethod: "tapToPay",
      simulated: STRIPE_TERMINAL_SIMULATE_MODE,
    });

    if (error) {
      alert("Tap to Pay check error:" + error.message);
      return;
    }

    if (readerSupportResult) {
      console.log("Initializing Tap to Pay on Device");
      await startDiscoverReaders("tapToPay");
    } else {
      alert("Tap to Pay NOT supported on this device");
    }
  };

  // --- UPDATED: Handle External Bluetooth Readers ---
  const handleConnectBluetoothReader = async () => {
    console.log("Scanning for Bluetooth readers");
    setDiscoverReaderErrorMsg("");
    await startDiscoverReaders("bluetoothScan");
  };

  const startDiscoverReaders = async (discoveryMethodName) => {
    setDiscoveryMethod(discoveryMethodName);

    if (Platform.OS === "android") {
      try {
        const granted = await requestNeededAndroidPermissions({
          accessFineLocation: {
            title: "Location Permission",
            message: "Location access is required in order to accept payments.",
            buttonPositive: "Accept",
          },
        });
        if (!granted) {
          console.error(
            "Location and BT services are required to connect to a reader.",
          );
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    setDiscoverReaderErrorMsg("");
    toggleReadersModal(); // Open modal to show list

    const { error } = await discoverReaders({
      discoveryMethod: discoveryMethodName,
      simulated: STRIPE_TERMINAL_SIMULATE_MODE,
    });

    if (error) {
      console.log("Stripe Error:", error);

      // ✅ REQUIRED: Handle iOS version not supported
      if (
        Platform.OS === "ios" &&
        (error.code === "osVersionNotSupported" ||
          error.code === "PaymentCardReaderError.osVersionNotSupported")
      ) {
        Alert.alert(
          "Not Supported!",
          "Please update your iOS to use Tap to Pay.",
        );
        return;
      }

      if (error.code !== "Canceled") {
        setDiscoverReaderErrorMsg(error.message);
      }
    }
  };

  const cancelDiscoveringReader = async () => {
    const { error } = await cancelDiscovering();
    if (error) {
      console.log("cancel discover error", error);
      return;
    }
  };

  const disconnectFromReader = async () => {
    const { error } = await disconnectReader();
    if (error) {
      console.log("disconnect error", error);
      alert("Unable to disconnect from the reader.");
      return;
    }
  };

  // Helper to determine icon based on reader type
  const getConnectedReaderIcon = () => {
    if (!connectedReader) return "contactless-payment-circle";
    // Check if the connected device is a smartphone vs physical hardware
    console.log("connectedReader.deviceType::", connectedReader.deviceType);
    if (
      connectedReader.deviceType === "tapToPay" ||
      connectedReader.deviceType === "appleBuiltIn" ||
      connectedReader.deviceType === "cotsDevice"
    ) {
      return "credit-card-outline";
    }
    return "bluetooth-settings";
  };

  const getBatteryPercentage = (battery) => {
    if (
      battery === null ||
      battery === undefined ||
      !Number.isFinite(Number(battery))
    ) {
      return null;
    }

    const numericBattery = Number(battery);

    return Math.round(
      numericBattery <= 1 ? numericBattery * 100 : numericBattery,
    );
  };
  const getBatteryIcon = (battery) => {
    if (battery <= 10) return "battery-10";
    if (battery <= 20) return "battery-20";
    if (battery <= 30) return "battery-30";
    if (battery <= 40) return "battery-40";
    if (battery <= 50) return "battery-50";
    if (battery <= 60) return "battery-60";
    if (battery <= 70) return "battery-70";
    if (battery <= 80) return "battery-80";
    if (battery <= 90) return "battery-90";

    return "battery";
  };

  const getBatteryColor = (battery) => {
    if (battery <= 20) return "red";
    if (battery <= 50) return "orange";

    return "green";
  };

  // Detect if Tap to Pay is connected
  const isTapToPayConnected = () => {
    if (!connectedReader) return false;

    return (
      connectedReader.deviceType === "tapToPay" ||
      connectedReader.deviceType === "appleBuiltIn" ||
      connectedReader.deviceType === "cotsDevice"
    );
  };

  // Detect if Bluetooth Reader is connected
  const isBluetoothReaderConnected = () => {
    if (!connectedReader) return false;

    return !isTapToPayConnected();
  };

  return (
    <View style={styles.container}>
      <Header clubName={club?.post_title} onLogout={handleLogout} />
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
              {/* Account */}
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

              {/* Quick Sale Settings */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleQuickSaleSettings}
              >
                <Icon
                  name="flash"
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>Quick Sale Settings</Text>
              </TouchableOpacity>

              {/* Reader Connections */}
              {connectedReader && (
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={disconnectFromReader}
                >
                  <Icon
                    name={getConnectedReaderIcon()}
                    size={24}
                    color="#00c0ff" // Highlighted blue to show active connection
                    style={styles.settingIcon}
                  />
                  <View style={{ flex: 1 }}>
                    {connectedReader.deviceType === "tapToPay" ||
                    connectedReader.deviceType === "appleBuiltIn" ||
                    connectedReader.deviceType === "cotsDevice" ? (
                      <>
                        <Text style={styles.settingTitle}>
                          Tap to Pay Connected
                        </Text>
                        <View style={styles.deviceIdDetailContainer}>
                          <Text style={styles.deviceIdLabel}>ID: </Text>
                          <Text style={styles.deviceIdText}>
                            {connectedReader.serialNumber ||
                              connectedReader.deviceId ||
                              "N/A"}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.settingTitle}>
                          {connectedReader.serialNumber || "Reader Connected"}
                        </Text>

                        {getBatteryPercentage(readerBatteryLevel) !== null && (
                          <View style={styles.connectedBatteryContainer}>
                            <Icon
                              name={getBatteryIcon(
                                getBatteryPercentage(readerBatteryLevel),
                              )}
                              size={20}
                              color={getBatteryColor(
                                getBatteryPercentage(readerBatteryLevel),
                              )}
                            />

                            <Text
                              style={[
                                styles.connectedBatteryText,
                                {
                                  color: getBatteryColor(
                                    getBatteryPercentage(readerBatteryLevel),
                                  ),
                                },
                              ]}
                            >
                              {getBatteryPercentage(readerBatteryLevel)}%
                            </Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                  <View style={styles.disconnectReader}>
                    <View style={styles.disconnectReaderTextWrap}>
                      <Text style={styles.disconnectReaderText}>
                        Disconnect
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              <>
                {/* Option 1: Tap to Pay (Local Phone) */}
                {(!connectedReader || !isTapToPayConnected()) && (
                  <TouchableOpacity
                    style={[
                      styles.settingItem,
                      isBluetoothReaderConnected() && { opacity: 0.4 },
                    ]}
                    onPress={() => {
                      if (isBluetoothReaderConnected()) {
                        alert("Disconnect reader first to use Tap to Pay");
                        return;
                      }
                      handleConnectTapToPay();
                    }}
                  >
                    <Icon
                      name="credit-card-outline"
                      size={24}
                      color="#000"
                      style={styles.settingIcon}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingTitle}>
                        Tap to Pay on{" "}
                        {Platform.OS === "ios" ? "iPhone" : "Android"}
                      </Text>
                      {Platform.OS === "ios" && (
                        <Text
                          style={{ fontSize: 12, color: "#555", marginTop: 4 }}
                        >
                          Accept Apple Pay, contactless cards (tap card on
                          iPhone), and digital wallets with Tap to Pay on
                          iPhone. Customers may need to enter their PIN on
                          iPhone. Accessibility features like VoiceOver are
                          supported.
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                {/* Option 2: External Bluetooth Reader */}
                {(!connectedReader || isTapToPayConnected()) && (
                  <TouchableOpacity
                    style={[
                      styles.settingItem,
                      isTapToPayConnected() && { opacity: 0.4 },
                    ]}
                    onPress={() => {
                      if (isTapToPayConnected()) {
                        alert("Disconnect Tap to Pay first to use Reader");
                        return;
                      }
                      handleConnectBluetoothReader();
                    }}
                  >
                    <Icon
                      name="bluetooth"
                      size={24}
                      color="#000"
                      style={styles.settingIcon}
                    />
                    <Text style={styles.settingTitle}>
                      Connect Bluetooth Reader
                    </Text>
                  </TouchableOpacity>
                )}
              </>

              {/* Help & Support */}
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

              {/* EULA */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleAgreementSupport}
              >
                <Icon
                  name="file-document-outline"
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>
                  End-user License Agreement
                </Text>
              </TouchableOpacity>

              {/* Logout */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleLogout}
              >
                <Icon
                  name="logout"
                  size={24}
                  color="red"
                  style={styles.settingIcon}
                />
                <Text style={[styles.settingTitle, { color: "red" }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* SettingsScreen JSX me Loader section add karein */}
      <Modal visible={isUpdatingFirmware} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#00c0ff" />
            <Text
              style={[
                styles.modalTitle,
                { marginTop: 15, textAlign: "center" },
              ]}
            >
              Updating Reader Firmware...
            </Text>
            <Text style={{ textAlign: "center", marginTop: 10, fontSize: 16 }}>
              {updateProgress}% Completed
            </Text>
            <Text
              style={{
                textAlign: "center",
                marginTop: 5,
                color: "#666",
                fontSize: 12,
              }}
            >
              Please do not turn off the reader or close the app.
            </Text>
          </View>
        </View>
      </Modal>
      {/*============================================*/}
      {/* Quick Sale Settings Modal */}

      <QuickSaleSettingModal
        club={club}
        visible={isQuickSaleModalVisible}
        onRequestClose={() => {
          setQuickSaleModalVisible(false);
        }}
      />

      {/*============================================*/}

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
        discoveryMethod={discoveryMethod}
        discoverReaderErrorMsg={discoverReaderErrorMsg}
        onRequestClose={toggleReadersModal}
        discoveredReaders={discoveredReaders}
        getLocations={getLocations}
        connectReader={connectReader}
        batteryLevel={readerBatteryLevel}
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
  deviceIdDetailContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  deviceIdLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  deviceIdText: {
    fontSize: 10,
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
    flexDirection: "row",
    justifyContent: "flex-end",
    marginLeft: 5,
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
  connectedBatteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  connectedBatteryText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
});

export default SettingsScreen;
