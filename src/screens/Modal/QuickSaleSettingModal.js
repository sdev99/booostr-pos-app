// FullScreenLoader.js
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { addDescriptors } from "../../api/descriptors";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import FullScreenLoader from "./FullScreenLoader";
import { useSelector } from "react-redux";
import { memoizedStoreData } from "../../store/selectors";
import { createStripeLocation } from "../../api/stripe";

const QuickSaleSettingModal = forwardRef(({ visible, onRequestClose }, ref) => {
  const loaderRef = useRef();
  const storeData = useSelector(memoizedStoreData);
  const [descriptors, setDescriptors] = useState([
    { id: 1, text: "Miscellaneous Item", isDefault: true, isFixed: true },
  ]);

  useImperativeHandle(ref, () => ({
    // show: () => {},
    // hide: () => {},
  }));

  const scrollViewRef = useRef(null);

  if (!visible) return null;

  const handleSaveAndUpdate = async () => {
    const club = storeData?.club || storeData?.id;

    // 1. Array Formatting (Price = 0, is_default = boolean)
    const itemsToSend = descriptors
      .filter((item) => item.text && item.text.trim() !== "")
      .map((item, index) => ({
        name: item.text.trim(),
        price: Number(item.price) || 0,
        is_default: Boolean(item.isDefault),
        sort_order: index + 1,
      }));

    if (itemsToSend.length === 0) {
      Alert.alert("Notice", "Please enter at least one descriptor name.");
      return;
    }

    const payload = {
      descriptors: itemsToSend,
    };

    try {
      console.log("SENDING PAYLOAD:", JSON.stringify(payload, null, 2));

      // 2. Safe API Call (Club fallback ke saath)
      const response = club ? await addDescriptors(club, payload) : await addDescriptors(payload);

      console.log("API RESPONSE:", response);

      if (response?.status === "success") {
        Alert.alert("Success", "Descriptors updated successfully.");
        onRequestClose();
      } else {
        Alert.alert(
          "Error",
          response?.message || response?.error || "Failed to update descriptors.",
        );
      }
    } catch (error) {
      console.log("BULK ADD ERROR:", error);
      Alert.alert("Error", "Unable to save descriptors.");
    }
  };

  const handleSelectDefault = (id) => {
    setDescriptors((prev) => prev.map((item) => ({ ...item, isDefault: item.id === id })));
  };

  const handleTextChange = (id, newText) => {
    setDescriptors((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: newText } : item)),
    );
  };

  const handleDeleteDescriptor = (id) => {
    setDescriptors((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddDescriptor = () => {
    setDescriptors((prev) => [
      ...prev,
      { id: Date.now(), text: "", isDefault: false, isFixed: false },
    ]);
    setTimeout(() => {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }, 300);
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.qsModalOverlay}>
        <View style={styles.qsModalCard}>
          <View style={styles.qsModalTopContent}>
            <Text style={styles.qsTitle}>Quick Sale Settings</Text>
            <Text style={styles.qsSubtitle}>
              Add custom item descriptors to identify your quick sale items.
            </Text>

            {/* Table Header */}
            <View style={styles.qsHeaderRow}>
              <Text style={styles.qsHeaderLabelText}>Descriptor</Text>
              <Text style={[styles.qsHeaderLabelText, { textAlign: "center" }]}>
                Default{"\n"}Choice
              </Text>
            </View>

            {/* Input List ScrollView */}
            <ScrollView ref={scrollViewRef} style={{ maxHeight: 60 * descriptors.length }}>
              {descriptors.map((item) => (
                <View key={item.id} style={styles.qsInputRow}>
                  {/* Input Box */}
                  <TextInput
                    style={[styles.qsTextInput, item.isFixed && styles.qsDisabledInput]}
                    value={item.text}
                    editable={!item.isFixed}
                    onChangeText={(text) => handleTextChange(item.id, text)}
                  />

                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[styles.qsCheckbox, item.isDefault && styles.qsCheckboxChecked]}
                    onPress={() => handleSelectDefault(item.id)}
                  >
                    {item.isDefault && <Icon name="check" size={20} color="#FFF" />}
                  </TouchableOpacity>

                  {/* Delete Button (Fixed item ke liye hidden) */}
                  {!item.isFixed ? (
                    <TouchableOpacity
                      style={styles.qsDeleteBtn}
                      onPress={() => handleDeleteDescriptor(item.id)}
                    >
                      <Icon name="trash-can-outline" size={20} color="#E53935" />
                    </TouchableOpacity>
                  ) : (
                    /* 👈 Alignment sahi rakhne ke liye invisible box */
                    <View style={{ width: 38, height: 38 }} />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Footer Actions */}
          <View style={styles.qsFooterRow}>
            <TouchableOpacity onPress={onRequestClose}>
              <Text style={styles.qsCloseText}>Close</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.qsAddBtn} onPress={handleAddDescriptor}>
              <Text style={styles.qsAddBtnText}>+Add</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.qsSaveBtn} onPress={handleSaveAndUpdate}>
              <Text style={styles.qsSaveBtnText}>Save & Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  /* Quick Sale Modal Styles */
  qsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },
  qsModalCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
  },
  qsModalTopContent: {
    paddingHorizontal: 12,
    marginTop: 20,
    maxHeight: 260,
  },
  qsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  qsSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  qsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  qsHeaderLabelText: {
    flex: 1,

    fontSize: 12,
    fontWeight: "500",
    color: "#000",
  },
  qsInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 8,
  },
  qsTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: "#333",
  },
  qsDisabledInput: {
    backgroundColor: "#E5E5E5",
    color: "#666",
  },
  qsCheckbox: {
    width: 38,
    height: 38,

    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qsCheckboxChecked: {
    backgroundColor: "#00B0FF",

    borderColor: "#00B0FF",
  },
  qsDeleteBtn: {
    width: 38,
    height: 38,
    backgroundColor: "#FFEBEE",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  qsAddBtn: {
    backgroundColor: "#39dd99",
    borderRadius: 8,
    height: 40,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  qsAddBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  qsFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
  },
  qsCloseText: {
    fontSize: 15,
    color: "#000",
  },
  qsSaveBtn: {
    backgroundColor: "#00B0FF",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
  },
  qsSaveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default QuickSaleSettingModal;
