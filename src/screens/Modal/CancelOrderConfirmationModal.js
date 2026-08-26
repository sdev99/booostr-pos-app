// FullScreenLoader.js
import React, { forwardRef } from "react";

import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";

const CancelOrderConfirmationModal = forwardRef(
  ({ visible, onConfirm, onRequestClose }, ref) => {
    if (!visible) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              You have chosen to CANCEL an order in progress. If you wish to
              CANCEL this current order, please click CONFIRM CANCELLATION
              below. If you chose this by error, please click CANCEL
              CANCELLATION.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
              >
                <Text style={styles.modalButtonText}>CONFIRM CANCELLATION</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onRequestClose}
              >
                <Text style={styles.modalButtonText}>CANCEL CANCELLATION</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 6,
    width: "90%",
    maxWidth: 500,
    marginHorizontal: "auto",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#777",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#00c0ff",
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CancelOrderConfirmationModal;
