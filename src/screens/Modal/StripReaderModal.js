// FullScreenLoader.js
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import FullScreenLoader from "./FullScreenLoader";
import { useSelector } from "react-redux";
import { memoizedStoreData } from "../../store/selectors";
import { createStripeLocation } from "../../api/stripe";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DEFAULT_BATTERY_LEVEL_SIMULAT = 100;

const StripeReaderModal = forwardRef(
  (
    {
      visible,
      getLocations,
      discoverReaderErrorMsg,
      discoveryMethod,
      connectReader,
      discoveredReaders,
      onRequestClose,
      batteryLevel,
    },
    ref,
  ) => {
    const loaderRef = useRef();
    const storeData = useSelector(memoizedStoreData);

    useImperativeHandle(ref, () => ({
      // show: () => {},
      // hide: () => {},
    }));

    if (!visible) return null;

    const handleConnectBluetoothReader = async (selectedReader) => {
      // Get locations
      let locationId, locationName;
      try {
        const clubAddress = storeData?.club_address;
        if (!clubAddress) {
          Alert.alert("Alert!", "Club address not found");
          return;
        }
        locationName = clubAddress.store_legal_name;

        // if (!STRIPE_TERMINAL_SIMULATE_MODE && selectedReader.locationId) {
        //   locationId = selectedReader.locationId;
        // } else {
        loaderRef.current?.show(`Fetching Locations`);
        const response = await getLocations({}); // get locations from stripe

        if (response.locations?.length > 0) {
          const locationData = response.locations.find(
            (location) =>
              location.displayName.toLowerCase() ===
              clubAddress.store_legal_name.toLowerCase(),
          );
          if (locationData) {
            locationId = locationData.id;
          }
        }
        // }

        // If no location found in the stripe dashboard , create new location
        if (!locationId) {
          loaderRef.current?.show(`Location Creating`);

          const getways = storeData?.Getway;
          const locationRes = await createStripeLocation(getways, clubAddress);
          if (locationRes.status === "success") {
            locationId = locationRes.locationId;
          } else {
            loaderRef.current?.hide();
            Alert.alert(
              "Error!",
              `Unable to create location for club. Error: ${locationRes.message}`,
            );
            return;
          }
        }

        loaderRef.current?.show(
          discoveryMethod === "tapToPay"
            ? "Connecting Tap to Pay, Please wait"
            : "Connecting Reader, Please wait",
        );
      } catch (error) {
        loaderRef.current?.hide();
        Alert.alert("Error!", `Location error: ${error.message}`);
      }

      try {
        const { reader, error } = await connectReader({
          reader: selectedReader,
          // Since the simulated reader is not associated with a real location, we recommend
          // specifying its existing mock location.
          locationId: locationId,
          discoveryMethod: discoveryMethod,
        });

        if (error) {
          loaderRef.current?.hide();
          console.log("connectReader error", error.message);

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

          Alert.alert("Connect Error!", error.message);
          return;
        } else {
          loaderRef.current?.hide();
          Alert.alert(
            "Success!",
            discoveryMethod === "tapToPay"
              ? "Tap to Pay connected successfully."
              : "Reader connected successfully.",
          );
          onRequestClose();
        }
      } catch (error) {
        loaderRef.current?.hide();
        console.error("Error while fetching connected reader:", error);

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
        Alert.alert("Connect Error!", `Throw: ${error.message}`);
      }
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
      if (battery <= 10) return "red";
      if (battery <= 20) return "red";
      if (battery <= 50) return "orange";

      return "green";
    };

    // Dynamic battery level extraction
    const parseBatteryLevel = (reader) => {
      const isSimulated =
        reader?.serialNumber?.toUpperCase().includes("SIMULATOR") ||
        reader?.simulated;

      let rawBattery = reader?.batteryLevel;

      if (
        (rawBattery === undefined ||
          rawBattery === null ||
          Number.isNaN(Number(rawBattery))) &&
        isSimulated
      ) {
        rawBattery = DEFAULT_BATTERY_LEVEL_SIMULAT / 100;
      }

      if (
        rawBattery === undefined ||
        rawBattery === null ||
        Number.isNaN(Number(rawBattery))
      ) {
        return null;
      }

      const parsedPercentage =
        rawBattery <= 1 ? Math.round(rawBattery * 100) : Math.round(rawBattery);

      return parsedPercentage;
    };

    // All battery tier checks before connecting
    const handleConnectClick = (reader) => {
      const battery = parseBatteryLevel(reader);

      if (battery !== null) {
        if (battery <= 10) {
          Alert.alert(
            "Low Battery",
            `The reader battery is ${battery}%. The reader cannot connect until it has at least an 11% charge. Please charge the reader.`,
          );
          return;
        }

        if (battery <= 20) {
          Alert.alert(
            "Low Battery Warning",
            `Battery is at ${battery}%. We strongly urge you to charge the reader.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Connect Anyway",
                onPress: () => handleConnectBluetoothReader(reader),
              },
            ],
          );
          return;
        }

        if (battery <= 50) {
          Alert.alert(
            "Battery Notice",
            `Battery is at ${battery}%. The reader will need to be charged soon.`,
            [
              {
                text: "Connect",
                onPress: () => handleConnectBluetoothReader(reader),
              },
            ],
          );
          return;
        }

        Alert.alert(
          "Strong Charge",
          `Battery is at ${battery}%. Confirming strong charge, please always monitor battery level.`,
          [
            {
              text: "Connect",
              onPress: () => handleConnectBluetoothReader(reader),
            },
          ],
        );

        return;
      }

      // Battery unavailable → don't block connection
      handleConnectBluetoothReader(reader);
    };
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={visible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {discoveredReaders?.length > 0 ? (
                <>
                  {discoveryMethod == "tapToPay"
                    ? "Connect Tap to Pay"
                    : "Found Stripe Reader"}
                </>
              ) : (
                <>
                  {discoveryMethod == "tapToPay"
                    ? "Tap to Pay Discover"
                    : "Stripe Reader Discover"}
                </>
              )}
            </Text>
            <View style={{ flex: 1 }}>
              <ScrollView style={styles.readerList}>
                {discoverReaderErrorMsg ? (
                  <Text style={styles.scanning}>{discoverReaderErrorMsg}</Text>
                ) : (
                  <>
                    {discoveredReaders.map((reader, index) => {
                      const battery = parseBatteryLevel(reader);
                      return (
                        <View key={index} style={styles.reader}>
                          <View style={styles.readerInfo}>
                            <Text style={styles.readerText}>
                              <Text style={styles.readerLabel}>
                                Reference ID:
                              </Text>
                              {reader.serialNumber}
                            </Text>

                            <View style={styles.batteryContainer}>
                              <MaterialCommunityIcons
                                name={
                                  battery === null
                                    ? "battery-unknown"
                                    : getBatteryIcon(battery)
                                }
                                size={20}
                                color={
                                  battery === null
                                    ? "gray"
                                    : getBatteryColor(battery)
                                }
                              />

                              <Text style={styles.batteryText}>
                                {battery === null ? "--" : `${battery}%`}
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.readerConnect}
                            onPress={() => handleConnectClick(reader)}
                          >
                            <Text style={styles.readerConnectText}>
                              Connect
                            </Text>
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
              <FullScreenLoader ref={loaderRef} />
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onRequestClose}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
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
    minHeight: 220,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
    fontSize: 12,
    flex: 1,
    paddingRight: 8,
  },
  readerLabel: {
    fontWeight: "600",
  },
  readerConnect: {
    backgroundColor: "#34c759",
    padding: 8,
    borderRadius: 5,
    color: "white",
    alignSelf: "center",
  },
  readerConnectText: {
    color: "white",
  },
  scanning: {
    alignSelf: "center",
    marginTop: 10,
  },

  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  batteryText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  readerInfo: {
    flex: 1,
    justifyContent: "center",
  },
});

export default StripeReaderModal;
