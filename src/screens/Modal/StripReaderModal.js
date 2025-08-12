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
} from "react-native";
import FullScreenLoader from "./FullScreenLoader";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StripeReaderModal = forwardRef(
  (
    {
      visible,
      getLocations,
      discoverReaderErrorMsg,
      connectReader,
      discoveredReaders,
      onRequestClose,
    },
    ref
  ) => {
    const loaderRef = useRef();
    const [connectionStateMsg, setConnectionStateMsg] = useState("");

    useImperativeHandle(ref, () => ({
      // show: () => {},
      // hide: () => {},
    }));

    if (!visible) return null;

    const handleConnectBluetoothReader = async (selectedReader) => {
      // Get locations
      let locationId = selectedReader.locationId;
      try {
        loaderRef.current?.show(
          `Fetching Locations\n(${selectedReader.serialNumber})`
        );

        const club = await AsyncStorage.getItem("club");
        const clubData = JSON.parse(club);

        const response = await getLocations(); // get locations from stripe

        if (response.locations?.length > 0) {
          const locationData = response.locations.find(
            (location) =>
              location.displayName.toLowerCase() ===
              clubData.post_title.toLowerCase()
          );
          let locationName;
          if (locationData) {
            locationId = locationData.id;
            locationName = locationData.displayName;
          } else {
            locationId = response.locations[0].id;
            locationName = response.locations[0].displayName;
          }
          loaderRef.current?.updateMessage(
            `${locationName}\n(${locationId})  \nConnecting Reader\n(${selectedReader.serialNumber})`
          );
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
        const { reader, error } = await connectReader(
          {
            reader: selectedReader,
            // Since the simulated reader is not associated with a real location, we recommend
            // specifying its existing mock location.
            locationId: locationId,
          },
          "bluetoothScan"
        );

        if (error) {
          loaderRef.current?.hide();
          console.log("connectReader error", error.message);

          Alert.alert("Connect Error!", error.message);
          return;
        } else {
          loaderRef.current?.hide();
          Alert.alert("Success!", "Reader connected successfully.");
          onRequestClose();
        }
      } catch (error) {
        loaderRef.current?.hide();
        console.error("Error while fetching connected reader:", error);
        Alert.alert("Connect Error!", `Throw: ${error.message}`);
      }
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
              {discoveredReaders?.length > 0
                ? "Found Stripe Reader"
                : "Stripe Reader Discover"}
            </Text>
            <View>
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
  }
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
});

export default StripeReaderModal;
