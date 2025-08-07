import React, { useImperativeHandle, useState, forwardRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { APP_BUTTON_COLOR, APP_DISABLED_BUTTON_COLOR } from "../../color";

export const ProductVariantModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);

  const [product, setProduct] = useState();
  const [sizeOptions, setSizeOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Expose open/close methods to parent
  useImperativeHandle(ref, () => ({
    open: ({ product, sizeOptions, colorOptions, selectedOptions }) => {
      setProduct(product);
      setSizeOptions(sizeOptions);
      setColorOptions(colorOptions);
      setSelectedSize(selectedOptions?.size);
      setSelectedColor(selectedOptions?.color);
      setQuantity(selectedOptions?.quantity || 1);
      setVisible(true);
    },
    close: () => setVisible(false),
  }));

  if (!visible) return null;

  const shouldDisable = () => {
    return !selectedColor || !selectedSize;
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.title}>{product?.title}</Text>
            <Text style={styles.subtitle}>
              Select product attributes below, then add to order.
            </Text>

            <Text style={styles.sectionLabel}>Choose Size</Text>
            <View style={styles.optionRow}>
              {sizeOptions.map((size) => {
                const isSelected = size === selectedSize;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Choose Color</Text>
            <View style={styles.optionRow}>
              {colorOptions.map((color) => {
                const isSelected = color === selectedColor;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {color}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.quantityRow}>
              <Text style={[styles.sectionLabel, styles.quantitySectionLabel]}>
                Quantity
              </Text>
              <View style={styles.quantityBtnsContainer}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={[
                    styles.circleButton,
                    shouldDisable() && styles.circleButtonDisabled,
                  ]}
                  disabled={shouldDisable()}
                >
                  <Text style={styles.circleButtonText}>–</Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.quantityText,
                    shouldDisable() && styles.quantityTextDisabled,
                  ]}
                >
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => setQuantity(quantity + 1)}
                  style={[
                    styles.circleButton,
                    shouldDisable() && styles.circleButtonDisabled,
                  ]}
                  disabled={shouldDisable()}
                >
                  <Text style={styles.circleButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                shouldDisable() && styles.addButtonDisabled,
              ]}
              disabled={shouldDisable()}
              onPress={() => {
                if (props.onConfirm) {
                  props.onConfirm(
                    {
                      ...product,
                      cart_color: selectedColor,
                      cart_size: selectedSize,
                    },
                    quantity
                  );
                }
                setVisible(false);
              }}
            >
              <Text style={styles.addButtonText}>Add to Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginTop: 12,
  },
  quantitySectionLabel: {
    position: "absolute",
    left: 0,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: APP_BUTTON_COLOR,
    borderColor: APP_BUTTON_COLOR,
  },
  optionText: {
    color: "#333",
  },
  optionTextSelected: {
    color: "#FFF",
    fontWeight: "bold",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  quantityBtnsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: APP_BUTTON_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  circleButtonDisabled: {
    backgroundColor: APP_DISABLED_BUTTON_COLOR,
  },
  circleButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityTextDisabled: {
    color: APP_DISABLED_BUTTON_COLOR,
  },
  addButton: {
    marginTop: 12,
    backgroundColor: APP_BUTTON_COLOR,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: APP_DISABLED_BUTTON_COLOR,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelLink: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
  },
});
