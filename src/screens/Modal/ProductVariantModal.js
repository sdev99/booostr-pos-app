import React, {
  useImperativeHandle,
  useState,
  forwardRef,
  Fragment,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { APP_BUTTON_COLOR, APP_DISABLED_BUTTON_COLOR } from "../../color";
import { getProductVariations } from "../../api/product";

export const ProductVariantModal = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);

  const [product, setProduct] = useState();
  const [variations, setVariations] = useState([]);
  const [variationsPrices, setVariationsPrices] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});

  const [fetchingVariations, setFetchingVariations] = useState(false);
  const [variationError, setVariationError] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Expose open/close methods to parent
  useImperativeHandle(ref, () => ({
    open: ({ product, club, sizeOptions, colorOptions, selectedOptions }) => {
      setProduct(product);
      setQuantity(selectedOptions?.quantity || 1);
      setVisible(true);

      // reset states
      setSelectedVariations({});
      setVariationError("");
      setFetchingVariations(false);
      setVariationsPrices([]);
      setVariations([]);

      getVariations(product, club);
    },
    close: () => setVisible(false),
  }));

  const findPriceBySelectedVariations = (prices, selectedVariations) => {
    // selectedVariations will be something like:
    // { 46: 47, 20: 21 }  // categoryId: variationId

    return prices.find((priceObj) => {
      // Extract variation IDs from priceObj
      const variationIds = priceObj.varitions.map((v) => v.id);

      // Check if all selected variation IDs are present
      return Object.values(selectedVariations).every((id) =>
        variationIds.includes(id)
      );
    });
  };

  const getVariations = async (product, club) => {
    setFetchingVariations(true);
    const response = await getProductVariations(product.id, club);
    setFetchingVariations(false);

    if (response.status === "success") {
      // Extract variation from product detail
      setVariations(response.result.optionwithcategories);
      setVariationsPrices(response.result.prices);
    } else {
      setVariationError(response);
    }
  };

  if (!visible) return null;

  const shouldDisable = () => {
    return Object.keys(selectedVariations).length < (variations.length || 1);
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

            {fetchingVariations ? (
              <View style={styles.containerLoader}>
                <ActivityIndicator size="medium" color="#00c0ff" />
              </View>
            ) : (
              <>
                {variations?.length > 0 ? (
                  variations.map((variation, key) => {
                    return (
                      <Fragment key={key}>
                        <Text style={styles.sectionLabel}>
                          {variation.category.name}
                        </Text>
                        <View style={styles.optionRow}>
                          {variation.priceswithvaritions.map((item) => {
                            const isSelected =
                              selectedVariations[variation.category.id] ===
                              item.id;
                            return (
                              <TouchableOpacity
                                key={item.id}
                                style={[
                                  styles.optionButton,
                                  isSelected && styles.optionButtonSelected,
                                ]}
                                onPress={() =>
                                  setSelectedVariations({
                                    ...selectedVariations,
                                    [variation.category.id]: item.id,
                                  })
                                }
                              >
                                <Text
                                  style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextSelected,
                                  ]}
                                >
                                  {item.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </Fragment>
                    );
                  })
                ) : (
                  <Text style={styles.errorMessage}>{variationError}</Text>
                )}
              </>
            )}

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
                  const variationPrice = findPriceBySelectedVariations(
                    variationsPrices,
                    selectedVariations
                  );
                  props.onConfirm(
                    {
                      ...product,
                      variation_id: variationPrice.id,
                      variation_price_object: variationPrice, // remove it before submit to api in make order api.
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
  containerLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  errorMessage: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#444",
    width: "100%",
    textAlign: "center",
  },
});
