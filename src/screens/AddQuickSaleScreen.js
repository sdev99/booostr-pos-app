import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { memoizedCart } from "../store/selectors";
import { addToCart } from "../store/reducers/cartSlice";
import { useSelector } from "react-redux";

import Header from "./Header";

const DESCRIPTOR_OPTIONS = [
  "Concession Item",
  "Fundraiser",
  "Membership",
  "Donation",
  "Merchandise",
];

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
  const [selectedDescriptor, setSelectedDescriptor] = useState("Concession Item");

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

  // ========================================
  // FORMAT AMOUNT
  // ========================================
  const getFormattedAmount = () => {
    const amount = parseFloat(rawAmount || "0");

    return `$${amount.toFixed(2)}`;
  };

  // ========================================
  // AMOUNT VALIDATION
  // ========================================
  const isAmountValid = parseFloat(rawAmount || "0") > 0;

  const canAddToCart = isAmountValid;
  const canCheckout = isAmountValid;

  // ========================================
  // KEYPAD
  // ========================================
  const handleNumericPress = (digit) => {
    setRawAmount((prev) => {
      // Current amount is 0
      if (prev === "0") {
        if (digit === "00") {
          return "0";
        }

        return digit;
      }

      // Maximum 7 characters
      if (prev.length >= 7) {
        return prev;
      }

      return prev + digit;
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
    setRawAmount(amount.toString());
  };

  // ========================================
  // ADD TO CART
  // ========================================
  const handleAddToCart = () => {
    if (cart.length > 0) {
      navigation.navigate("Cart");
    } else {
      alert("Your cart is empty. Add items to your cart before checkout.");
    }

    // Reset amount after adding
    setRawAmount("0");
  };

  // ========================================
  // CHECKOUT
  // ========================================
  const handleCheckout = () => {
    if (!canCheckout) {
      return;
    }

    navigation.navigate("Checkout");
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
      <ScrollView>
        <View style={styles.contentContainer}>
          <View style={styles.card}>
            {/* ==================================
              DESCRIPTOR
          ================================== */}
            <Text style={styles.fieldLabel}>Select Item Descriptor*</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setIsDropdownVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText}>{selectedDescriptor}</Text>

              <Icon name="chevron-down" size={24} color="#666" />
            </TouchableOpacity>

            {/* ==================================
              ITEM AMOUNT
          ================================== */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Item{"\n"}Amount</Text>

              <View style={styles.amountDisplayBox}>
                <Text style={styles.amountDisplayText}>{getFormattedAmount()}</Text>
              </View>
            </View>

            {/* ==================================
              KEYPAD
          ================================== */}
            <View style={styles.keypadGrid}>
              {/* ==================================
                $5 $10 $20
            ================================== */}
              <View style={styles.gridRow}>
                <TouchableOpacity
                  style={[styles.gridCell, styles.presetCell]}
                  onPress={() => handlePresetPress(5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetText}>$5.00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.gridCell, styles.presetCell]}
                  onPress={() => handlePresetPress(10)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetText}>$10.00</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.gridCell, styles.presetCell]}
                  onPress={() => handlePresetPress(20)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetText}>$20.00</Text>
                </TouchableOpacity>
              </View>

              {/* ==================================
                1 2 3
            ================================== */}
              <View style={styles.gridRow}>
                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("1")}>
                  <Text style={styles.keypadText}>1</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("2")}>
                  <Text style={styles.keypadText}>2</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("3")}>
                  <Text style={styles.keypadText}>3</Text>
                </TouchableOpacity>
              </View>

              {/* ==================================
                4 5 6
            ================================== */}
              <View style={styles.gridRow}>
                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("4")}>
                  <Text style={styles.keypadText}>4</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("5")}>
                  <Text style={styles.keypadText}>5</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("6")}>
                  <Text style={styles.keypadText}>6</Text>
                </TouchableOpacity>
              </View>

              {/* ==================================
                7 8 9
            ================================== */}
              <View style={styles.gridRow}>
                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("7")}>
                  <Text style={styles.keypadText}>7</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("8")}>
                  <Text style={styles.keypadText}>8</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("9")}>
                  <Text style={styles.keypadText}>9</Text>
                </TouchableOpacity>
              </View>

              {/* ==================================
                0 00 BACKSPACE
            ================================== */}
              <View style={styles.gridRow}>
                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("0")}>
                  <Text style={styles.keypadText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={() => handleNumericPress("00")}>
                  <Text style={styles.keypadText}>00</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.gridCell} onPress={handleBackspace}>
                  <Icon name="close-box" size={28} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

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
          style={[styles.checkoutBtn, !canCheckout && styles.disabledBtn]}
          onPress={handleCheckout}
          disabled={!canCheckout}
          activeOpacity={0.8}
        >
          <View style={styles.checkoutTextContainer}>
            <Text style={styles.checkoutTotalText}>Total: {getFormattedAmount()}</Text>

            <View style={styles.checkoutSubRow}>
              <Text style={styles.checkoutTitleText}>Checkout</Text>

              <Icon name="chevron-right" size={28} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ==================================
          DESCRIPTOR MODAL
      ================================== */}
      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={DESCRIPTOR_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDescriptor(item);
                    setIsDropdownVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 20,
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
  // KEYPAD
  // ========================================
  keypadGrid: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },

  gridRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  gridCell: {
    flex: 1,
    height: 70,

    justifyContent: "center",
    alignItems: "center",

    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",

    backgroundColor: "#FFF",
  },

  presetCell: {
    backgroundColor: "#EDF5FF",
  },

  presetText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#00B0FF",
  },

  keypadText: {
    fontSize: 20,
    fontWeight: "400",
    color: "#000",
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

  // ========================================
  // MODAL
  // ========================================
  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.3)",

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 30,
  },

  modalContent: {
    backgroundColor: "#FFF",

    width: "100%",

    borderRadius: 8,

    maxHeight: 250,
  },

  modalItem: {
    padding: 16,

    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AddQuickSaleScreen;
