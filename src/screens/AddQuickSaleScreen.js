import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from "react-native";
import { useDispatch } from "react-redux";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { memoizedCart } from "../store/selectors";
import { getDescriptors } from "../api/descriptors";
import { addProductToCart, addToCart } from "../store/reducers/cartSlice";
import { useSelector } from "react-redux";

import Header from "./Header";
import { getCartTotalPrice } from "../api/product";
import NumericKeyboard from "./Components/NumericKeyboard";

const AddQuickSaleScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const cart = useSelector(memoizedCart);

  // ========================================
  // CLUB DATA
  // ========================================
  const [club, setClub] = useState(null);

  // ========================================
  // DESCRIPTOR
  // ========================================
  const [descriptors, setDescriptors] = useState([]);
  const [selectedDescriptor, setSelectedDescriptor] = useState(null);

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // ========================================
  // DOLLAR AMOUNT
  //
  // 0  = $0.00
  // 5  = $5.00
  // 10 = $10.00
  // 20 = $20.00
  // ========================================
  const [rawAmount, setRawAmount] = useState("0");

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

  useEffect(() => {
    const getDescriptorsData = async () => {
      if (club) {
        try {
          const descriptorsData = await getDescriptors(club);
          if (descriptorsData?.descriptors) {
            const defaultDescriptor = descriptorsData.descriptors.find((d) => d.is_default);
            setSelectedDescriptor(defaultDescriptor.id || descriptorsData.descriptors[0].id);

            setDescriptors(
              descriptorsData.descriptors.map((descriptor) => ({
                ...descriptor,
                value: descriptor.id,
                label: descriptor.name,
              })),
            );
          }
        } catch (error) {
          console.error("Error fetching descriptors:", error);
        }
      }
    };

    getDescriptorsData();
  }, [club]);

  // ========================================
  // FORMAT AMOUNT
  // ========================================
  const getFormattedAmount = () => {
    const amount = parseInt(rawAmount || "0", 10) / 100;
    return `$${amount.toFixed(2)}`;
  };

  // ========================================
  // AMOUNT VALIDATION
  // ========================================
  const isAmountValid = parseFloat(rawAmount || "0") > 0;

  const canAddToCart = isAmountValid;

  // ========================================
  // KEYPAD
  // ========================================
  const handleNumericPress = (digit) => {
    setRawAmount((prev) => {
      const currentAmount = parseInt(prev || "0", 10);
      const numericDigit = parseInt(digit, 10);
      const multiplyBy = digit === "00" ? 100 : 10;
      return String(currentAmount * multiplyBy + numericDigit);
    });
  };

  // ========================================
  // BACKSPACE
  // ========================================
  const handleBackspace = () => {
    setRawAmount((prev) => {
      if (!prev || prev.length <= 1) {
        return "0";
      }

      return prev.slice(0, -1);
    });
  };

  // ========================================
  // PRESET AMOUNT
  // ========================================
  const handlePresetPress = (amount) => {
    setRawAmount((prev) => {
      const currentCents = parseInt(prev || "0", 10);
      const presetCents = Number(amount) * 100;

      return String(currentCents + presetCents);
    });
  };

  // ========================================
  // ADD TO CART
  // ========================================
  const handleAddToCart = () => {
    try {
      const product = {
        type: "quick_sale",
        descriptor_id: selectedDescriptor,
        descriptor: descriptors.find((d) => d.id === selectedDescriptor)?.name,
        amount: parseFloat(rawAmount),
        cart_quantity: 1,
      };
      console.log("Adding product to cart:", product);
      dispatch(addProductToCart(product, 1)).catch((error) => {
        console.error("Error adding product to cart:", error);
      });
      setRawAmount("0");
      setSelectedDescriptor(descriptors.find((d) => d.is_default)?.id || descriptors[0]?.id);
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  // ========================================
  // CHECKOUT
  // ========================================
  const handleCheckout = () => {
    if (cart.length > 0) {
      navigation.navigate("Cart");
    } else {
      alert("Your cart is empty. Add items to your cart before checkout.");
    }
  };

  return (
    <View style={styles.container}>
      {/* ==================================
          SAME HEADER AS NEW ORDER
      ================================== */}
      <Header clubName={club?.post_title} />

      {/* ==================================
          QUICK SALE TITLE HEADER
      ================================== */}
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" size={30} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Quick Sale</Text>
        </View>

        <TouchableOpacity
          style={styles.titleCancel}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.titleCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* ==================================
          CONTENT
      ================================== */}
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          {/* ==================================
              DESCRIPTOR
          ================================== */}
          <Text style={styles.fieldLabel}>Select Item Descriptor*</Text>

          <DropDownPicker
            open={isDropdownVisible}
            value={selectedDescriptor}
            items={descriptors}
            setOpen={setIsDropdownVisible}
            setValue={setSelectedDescriptor}
            setItems={setDescriptors}
          />

          <ScrollView>
            {/* ==================================
              ITEM AMOUNT
          ================================== */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Item{"\n"}Amount</Text>

              <View style={styles.amountDisplayBox}>
                <Text style={styles.amountDisplayText}>{getFormattedAmount()}</Text>
              </View>
            </View>

            <NumericKeyboard
              selectionButtons={[
                { label: "$5", value: "5" },
                { label: "$10", value: "10" },
                { label: "$20", value: "20" },
              ]}
              handleNumericButtonPress={(value) => handleNumericPress(value.toString())}
              handleClearPress={handleBackspace}
              handleSelectionButtonPress={(value) => handlePresetPress(parseFloat(value))}
            />
          </ScrollView>
        </View>
      </View>

      {/* ==================================
          FOOTER BUTTONS
      ================================== */}
      <View style={styles.footerContainer}>
        {/* ==================================
            ADD TO CART
        ================================== */}
        <TouchableOpacity
          style={[styles.addToCartBtn, !canAddToCart && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={!canAddToCart}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={28} color="#FFF" style={styles.plusIcon} />

          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        {/* ==================================
            CHECKOUT
        ================================== */}
        <TouchableOpacity
          style={[styles.checkoutBtn, cart.length === 0 && styles.disabledBtn]}
          onPress={handleCheckout}
          disabled={cart.length === 0}
          activeOpacity={0.8}
        >
          <View style={styles.checkoutTextContainer}>
            <Text style={styles.checkoutTotalText}>Total: ${getCartTotalPrice(cart)}</Text>

            <View style={styles.checkoutSubRow}>
              <Text style={styles.checkoutTitleText}>Checkout</Text>

              <Icon name="chevron-right" size={28} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ========================================
  // MAIN CONTAINER
  // ========================================
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  // ========================================
  // TITLE HEADER
  // Same style as New Order
  // ========================================
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F2F2",
  },

  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },

  titleCancel: {
    backgroundColor: "#C7C8C7",
    borderWidth: 1,
    borderColor: "#C7C8C7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },

  titleCancelText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  // ========================================
  // CONTENT
  // ========================================
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  // ========================================
  // DESCRIPTOR
  // ========================================
  fieldLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 20,
  },

  dropdownText: {
    fontSize: 15,
    color: "#333",
  },

  // ========================================
  // AMOUNT
  // ========================================
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  amountLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 20,
  },

  amountDisplayBox: {
    borderWidth: 2,
    borderColor: "#00B0FF",
    backgroundColor: "#EBF8FF",
    borderRadius: 6,

    paddingHorizontal: 20,
    paddingVertical: 15,

    minWidth: 160,

    alignItems: "flex-start",
  },

  amountDisplayText: {
    fontSize: 18,
    // fontWeight: "500",
    color: "#333",
  },

  // ========================================
  // FOOTER
  // ========================================
  footerContainer: {
    flexDirection: "row",
    paddingHorizontal: 28,
    paddingVertical: 18,
    gap: 16,
    backgroundColor: "#F4F6F8",
  },

  // ========================================
  // ADD TO CART BUTTON
  // ========================================
  addToCartBtn: {
    flex: 1,
    minHeight: 78,
    backgroundColor: "#39dd99",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  plusIcon: {
    marginRight: 8,
  },

  addToCartText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  // ========================================
  // CHECKOUT BUTTON
  // ========================================
  checkoutBtn: {
    flex: 1.5,
    minHeight: 78,
    backgroundColor: "#00c0ff",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  checkoutTextContainer: {
    alignItems: "center",
  },

  checkoutTotalText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  checkoutSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkoutTitleText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ========================================
  // DISABLED BUTTON
  // ========================================
  disabledBtn: {
    backgroundColor: "#E5E5E5",
  },
});

export default AddQuickSaleScreen;
