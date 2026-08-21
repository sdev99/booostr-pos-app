// FullScreenLoader.js
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  addDescriptors,
  deleteDescriptors,
  getDescriptors,
  updateDescriptors,
} from "../../api/descriptors";
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
  ActivityIndicator,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FullScreenLoader from "./FullScreenLoader";
import { useSelector } from "react-redux";
import { memoizedStoreData } from "../../store/selectors";
import { createStripeLocation } from "../../api/stripe";

const uniqueId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const fixedDescriptorItem = {
  name: "Miscellaneous Item",
  is_default: false,
  isFixed: true,
  sort_order: 1,
  text_input_id: uniqueId(), // it is for local use only, not for API
};

const QuickSaleSettingModal = forwardRef(
  ({ visible, club, onRequestClose }, ref) => {
    const loaderRef = useRef();
    const scrollViewRef = useRef(null);
    const inputRefs = useRef({});

    const storeData = useSelector(memoizedStoreData);

    const [isLoading, setIsLoading] = useState(false);
    const [descriptorsFromApi, setDescriptorsFromApi] = useState(false);

    const [descriptors, setDescriptors] = useState([fixedDescriptorItem]);

    useImperativeHandle(ref, () => ({
      // show: () => {},
      // hide: () => {},
    }));

    useEffect(() => {
      if (visible && club) {
        getDescriptorsData();
      }
    }, [visible, club]);

    const getDescriptorsData = async () => {
      setIsLoading(true);
      try {
        const response = await getDescriptors(club);
        if (
          response?.status === "success" &&
          Array.isArray(response.descriptors)
        ) {
          // Map API response keys to component state keys
          const descriptorsFromApi = response.descriptors;
          // Keep original API response for diffing
          setDescriptorsFromApi(descriptorsFromApi);

          // Add local-only ID for UI
          const getedItems = descriptorsFromApi.map((item, index) => ({
            ...item,
            text_input_id: uniqueId(),
          }));

          const fixedItem = getedItems.find(
            (item) => item.name === fixedDescriptorItem.name,
          );

          if (fixedItem) {
            fixedItem.isFixed = true;
          }
          // Default Fixed item fallback checks
          if (!fixedItem) {
            setDescriptors([fixedDescriptorItem, ...getedItems]);
          } else {
            setDescriptors(getedItems);
          }
        } else if (typeof response === "string") {
          Alert.alert("Notice", response);
        }
      } catch (error) {
        console.log("FETCH ERROR:", error);
        Alert.alert("Error", "Failed to fetch descriptors.");
      } finally {
        setIsLoading(false);
      }
    };

    const getDescriptorChanges = () => {
      // Ignore fixed/local-only descriptor
      const originalItems = descriptorsFromApi.filter(
        (item) => item.name !== fixedDescriptorItem.name,
      );

      const currentItems = descriptors.filter(
        (item) => !item.isFixed && item.name && item.name.trim() !== "",
      );

      // -------------------------
      // ADD
      // -------------------------
      const added = currentItems.filter(
        (currentItem) =>
          !currentItem.id ||
          !originalItems.some(
            (originalItem) => originalItem.id === currentItem.id,
          ),
      );

      // -------------------------
      // UPDATE
      // -------------------------
      const updated = currentItems.filter((currentItem) => {
        if (!currentItem.id) {
          return false;
        }

        const originalItem = originalItems.find(
          (item) => item.id === currentItem.id,
        );

        if (!originalItem) {
          return false;
        }

        return (
          originalItem.name !== currentItem.name.trim() ||
          Boolean(originalItem.is_default) !==
            Boolean(currentItem.is_default) ||
          originalItem.sort_order !== currentItem.sort_order
        );
      });

      // -------------------------
      // DELETE
      // -------------------------
      const deleted = originalItems.filter(
        (originalItem) =>
          !currentItems.some(
            (currentItem) => currentItem.id === originalItem.id,
          ),
      );

      return {
        added,
        updated,
        deleted,
      };
    };

    const handleSaveAndUpdate = async () => {
      const { added, updated, deleted } = getDescriptorChanges();

      if (added.length === 0 && updated.length === 0 && deleted.length === 0) {
        Alert.alert("Notice", "No changes detected.");
        return;
      }

      try {
        setIsLoading(true);
        // -------------------------
        // ADD
        // -------------------------
        if (added.length > 0) {
          const addPayload = {
            descriptors: added.map((item, index) => ({
              name: item.name.trim(),
              is_default: item.is_default,
              sort_order: item.sort_order ?? index + 1,
            })),
          };

          console.log("ADD PAYLOAD:", addPayload);

          const addResponse = await addDescriptors(addPayload, club);

          console.log("ADD RESPONSE:", addResponse);

          if (addResponse?.status !== "success") {
            throw new Error(
              addResponse?.message || "Failed to add descriptors.",
            );
          }
        }

        // -------------------------
        // UPDATE
        // -------------------------
        if (updated.length > 0) {
          const updatePayload = {
            descriptors: updated.map((item) => ({
              id: item.id,
              name: item.name.trim(),
              is_default: item.is_default,
              sort_order: item.sort_order,
            })),
          };

          console.log("UPDATE PAYLOAD:", updatePayload);

          const updateResponse = await updateDescriptors(updatePayload, club);

          console.log("UPDATE RESPONSE:", updateResponse);

          if (updateResponse?.status !== "success") {
            throw new Error(
              updateResponse?.message || "Failed to update descriptors.",
            );
          }
        }

        // -------------------------
        // DELETE
        // -------------------------
        if (deleted.length > 0) {
          const deletePayload = {
            ids: deleted.map((item) => item.id),
          };

          console.log("DELETE PAYLOAD:", deletePayload);

          const deleteResponse = await deleteDescriptors(deletePayload, club);

          console.log("DELETE RESPONSE:", deleteResponse);

          if (deleteResponse?.status !== "success") {
            throw new Error(
              deleteResponse?.message || "Failed to delete descriptors.",
            );
          }
        }

        // Refresh original/current state after successful save
        await getDescriptorsData();
        Alert.alert("Success", "Descriptors updated successfully.");

        onRequestClose();
      } catch (error) {
        console.log("SAVE DESCRIPTORS ERROR:", error);

        Alert.alert("Error", error?.message || "Unable to update descriptors.");
      } finally {
        setIsLoading(false);
      }
    };

    const handleSelectDefault = (text_input_id) => {
      setDescriptors((prev) =>
        prev.map((item) => ({
          ...item,
          is_default: item.text_input_id === text_input_id,
        })),
      );
    };

    const handleDeleteDescriptor = (text_input_id) => {
      if (descriptors.length <= 1) {
        Alert.alert("Alert!", "At least one descriptor must always remain.");
        return;
      }
      setDescriptors((prev) =>
        prev.filter((item) => item.text_input_id !== text_input_id),
      );
    };

    const handleTextChange = (text_input_id, newText) => {
      setDescriptors((prev) =>
        prev.map((item) =>
          item.text_input_id === text_input_id
            ? { ...item, name: newText }
            : item,
        ),
      );
    };

    const handleAddDescriptor = () => {
      const newTextInputId = uniqueId();
      setDescriptors((prev) => [
        ...prev,
        {
          name: "",
          is_default: false,
          sort_order: prev.length + 1,
          text_input_id: newTextInputId,
        },
      ]);
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
        inputRefs.current[newTextInputId]?.focus();
      }, 300);
    };
    if (!visible) return null;
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
                <Text
                  style={[styles.qsHeaderLabelText, { textAlign: "center" }]}
                >
                  Default{"\n"}Choice
                </Text>
              </View>

              {/* Input List ScrollView */}
              <ScrollView
                ref={scrollViewRef}
                style={{ maxHeight: 60 * descriptors.length }}
              >
                <View style={{ opacity: isLoading ? 0.1 : 1 }}>
                  {descriptors.map((item) => (
                    <View key={item.text_input_id} style={styles.qsInputRow}>
                      {/* Input Box */}
                      <TextInput
                        style={[
                          styles.qsTextInput,
                          item.isFixed && styles.qsDisabledInput,
                        ]}
                        ref={(ref) => {
                          inputRefs.current[item.text_input_id] = ref;
                        }}
                        value={item.name}
                        editable={!item.isFixed}
                        onChangeText={(text) =>
                          handleTextChange(item.text_input_id, text)
                        }
                      />

                      {/* Checkbox */}
                      <TouchableOpacity
                        style={[
                          styles.qsCheckbox,
                          item.is_default && styles.qsCheckboxChecked,
                        ]}
                        onPress={() => handleSelectDefault(item.text_input_id)}
                      >
                        {item.is_default && (
                          <Icon name="check" size={20} color="#FFF" />
                        )}
                      </TouchableOpacity>

                      {/* Delete Button (Fixed item ke liye hidden) */}
                      {!item.isFixed ? (
                        <TouchableOpacity
                          style={styles.qsDeleteBtn}
                          onPress={() =>
                            handleDeleteDescriptor(item.text_input_id)
                          }
                        >
                          <Icon
                            name="trash-can-outline"
                            size={20}
                            color="#E53935"
                          />
                        </TouchableOpacity>
                      ) : (
                        /* 👈 Alignment sahi rakhne ke liye invisible box */
                        <View style={{ width: 38, height: 38 }} />
                      )}
                    </View>
                  ))}
                </View>

                {isLoading && <FullScreenLoader show />}
              </ScrollView>
            </View>

            {/* Footer Actions */}
            <View style={styles.qsFooterRow}>
              <TouchableOpacity onPress={onRequestClose}>
                <Text style={styles.qsCloseText}>Close</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                style={styles.qsAddBtn}
                onPress={handleAddDescriptor}
              >
                <Text style={styles.qsAddBtnText}>+Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qsSaveBtn}
                onPress={handleSaveAndUpdate}
              >
                <Text style={styles.qsSaveBtnText}>Save & Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

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
    overflow: "hidden",
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
