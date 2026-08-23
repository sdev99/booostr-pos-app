import orderApi from "../api/order";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "./Header";
import BottomBar from "./BottomBar";
import { memoizedStoreData } from "../store/selectors";
import productPlaceholder from "../assets/product-placeholder.png";
import { getVariationsNames } from "../api/product";
import FullScreenLoader from "./Modal/FullScreenLoader";

const CompletedOrderDetailScreen = ({ route, navigation }) => {
  const storeData = useSelector(memoizedStoreData);
  const order = route.params?.order;
  console.log("Order Detail:", JSON.stringify(order));

  // REFUND STATE
  const [refundQuantity, setRefundQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);

  const [refundedItems, setRefundedItems] = useState({});
  const [fullRefundRecord, setFullRefundRecord] = useState(null);

  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [fullRefundModalVisible, setFullRefundModalVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  // LOAD CLUB DATA
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const clubStr = await AsyncStorage.getItem("club");

        if (clubStr) {
          const clubData = JSON.parse(clubStr);
          setClub(clubData);
        }
      } catch (error) {
        console.log("Error fetching club:", error);
      }
    };

    fetchClub();
  }, []);

  useEffect(() => {
    const refundData = {};

    order?.orderlasttrans?.partial_refund_logs?.forEach((refund) => {
      refund.items?.forEach((item) => {
        refundData[item.item_id] = {
          quantity: (refundData[item.item_id]?.quantity || 0) + Number(item.qty || 0),
          amount:
            (refundData[item.item_id]?.amount || 0) +
            Number(item.amount || 0) +
            Number(item.tax || 0),
        };
      });
    });

    setRefundedItems(refundData);

    if (order.payment_status === 5) {
      setFullRefundRecord({
        status: "Completed",
        amount: order.total,
        refundedAt: new Date(order.refunded_at.replace(" ", "T")),
        totalItems: order?.orderitems?.length + order?.quick_sale_items?.length || 0,
      });
    }
  }, [order]);

  // FULL REFUND
  const handleFullRefund = async () => {
    try {
      if (!email || !email.trim()) {
        setEmailError("Required");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setEmailError("Enter valid email");
        return;
      }
      setLoading(true);

      let paymentId = null;

      if (Number(order.order_from) === 4) {
        paymentId = order.transaction_id;
      } else if (Number(order.order_from) === 5) {
        paymentId = order.invoice_no;
      }

      const refundData = {
        paymentId: paymentId,
        email: email,
        refundAmount: Math.round(Number(order.total) * 100),
        reason: "customer_request",
        refundType: "full",
      };

      if (!club?.post_slug) {
        console.log("Club post_slug not found");
        Alert.alert("Error", "Club information not available.");
        return;
      }

      const response = await orderApi.fullRefund(refundData, club);

      if (response?.status === "success") {
        const refundAmount = Number(response.amount) / 100;

        setFullRefundRecord({
          status: "Completed",
          amount: refundAmount,
          refundedAt: new Date(),
          totalItems: order?.orderitems?.length || 0,
        });

        setFullRefundModalVisible(false);

        Alert.alert(
          "Refund Successful",
          `Refund of $${refundAmount.toFixed(2)} has been successfully processed.`,
        );
      } else {
        Alert.alert("Refund Failed", response?.message || "Unable to process refund.");
      }
    } catch (error) {
      console.log("Refund Error:", error);

      Alert.alert(
        "Refund Failed",
        error?.response?.data?.message || error?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ITEM REFUND
  const handleRefundItem = async (item) => {
    try {
      if (!email || !email.trim()) {
        setEmailError("Required");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setEmailError("Enter valid email");
        return;
      }
      if (!item) {
        Alert.alert("Error", "No item selected.");
        return;
      }

      console.log("REFUND ITEM:", item);
      console.log("REFUND QUANTITY:", refundQuantity);

      if (!club?.post_slug) {
        Alert.alert("Error", "Club information not available.");
        return;
      }

      let paymentId = null;

      if (Number(order.order_from) === 4) {
        paymentId = order.transaction_id;
      } else if (Number(order.order_from) === 5) {
        paymentId = order.invoice_no;
      }

      if (!paymentId) {
        Alert.alert("Error", "Payment ID not found.");
        return;
      }

      const refundData = {
        paymentId: paymentId,
        reason: "partial_item_return",
        email: email,
        refundType: "item",
        items: [
          {
            order_item_id: item.id,
            qty: refundQuantity,
          },
        ],
      };

      console.log("ITEM REFUND DATA:", refundData);
      console.log("REFUND CLUB:", club);
      setLoading(true);

      const response = await orderApi.refundItem(refundData, club);

      console.log("ITEM REFUND RESPONSE:", response);
      console.log("REFUND DETAILS ITEMS:", JSON.stringify(response?.refundDetails?.items, null, 2));

      if (response?.status === "succeeded") {
        const refundAmount = Number(response.amount) / 100;

        console.log("REFUND ITEM ID:", item.id);
        console.log("REFUND AMOUNT:", refundAmount);
        console.log("OLD REFUND RECORD:", refundedItems[item.id]);

        const previousRefund = refundedItems[item.id] || {
          quantity: 0,
          amount: 0,
        };

        const newRefundRecord = {
          quantity: previousRefund.quantity + Number(refundQuantity),
          amount: previousRefund.amount + refundAmount,
        };

        console.log("NEW REFUND RECORD:", newRefundRecord);

        const updatedRefundedItems = {
          ...refundedItems,
          [item.id]: newRefundRecord,
        };

        setRefundedItems(updatedRefundedItems);

        const allItemsRefunded = order?.orderitems?.every((orderItem) => {
          const refundedQty = updatedRefundedItems[orderItem.id]?.quantity || 0;

          return Number(refundedQty) >= Number(orderItem.qty);
        });

        if (allItemsRefunded) {
          const totalRefundAmount = Object.values(updatedRefundedItems).reduce(
            (total, refund) => total + Number(refund.amount || 0),
            0,
          );

          setFullRefundRecord({
            status: "Completed",
            amount: totalRefundAmount,
            refundedAt: new Date(),
            totalItems: order?.orderitems?.length || 0,
          });
        }

        setRefundModalVisible(false);
        setSelectedItem(null);

        console.log(JSON.stringify(order, null, 2));

        Alert.alert(
          "Refund Successful",
          `Refund of $${refundAmount.toFixed(2)} has been successfully processed.`,
        );
      } else {
        Alert.alert("Refund Failed", response?.message || "Unable to process refund.");
      }
    } catch (error) {
      console.log("ITEM REFUND ERROR:", error);

      Alert.alert(
        "Refund Failed",
        error?.response?.data?.message || error?.message || "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const anyItemRefunded = order?.orderitems?.some((item) => {
    const refundedQuantity = Number(refundedItems[item.id]?.quantity || 0);

    return refundedQuantity > 0;
  });

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Order #{order.invoice_no}</Text>
        </View>
      </View>

      {!anyItemRefunded && !fullRefundRecord ? (
        <TouchableOpacity
          style={styles.fullRefundButton}
          onPress={() => setFullRefundModalVisible(true)}
        >
          <Icon name="undo-variant" size={22} color="#fff" />
          <Text style={styles.fullRefundText}>Full Refund</Text>
        </TouchableOpacity>
      ) : (
        fullRefundRecord && (
          <View style={styles.fullRefundSuccessBox}>
            <View style={styles.fullRefundSuccessIcon}>
              <Icon name="check" size={28} color="#fff" />
            </View>

            <View style={styles.fullRefundSuccessDetails}>
              <Text style={styles.fullRefundSuccessTitle}>Full Refund Completed</Text>

              <Text style={styles.fullRefundInfo}>Total Items: {fullRefundRecord.totalItems}</Text>

              <Text style={styles.fullRefundInfo}>
                Total Refund Amount: ${fullRefundRecord.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.fullRefundDate}>
              <Text style={styles.fullRefundInfo}>
                {fullRefundRecord.refundedAt.toLocaleDateString()}
              </Text>

              <Text style={styles.fullRefundInfo}>
                {fullRefundRecord.refundedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )
      )}
      <View style={styles.itemsMain}>
        <View style={styles.itemsMainWrap}>
          <FlatList
            data={[...order?.orderitems, ...order?.quick_sale_items]}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              let variations;
              let price = item.amount;
              const quantiy = item.qty || item.quantity;
              const refunded = refundedItems[item.id];

              const refundedQuantity = refunded?.quantity || 0;

              const remainingQuantity = Math.max(Number(quantiy) - refundedQuantity, 0);
              console.log("ITEM:", item.id);
              console.log("REFUNDED RECORD:", refunded);
              if (item.term?.is_variation === 1) {
                const info = JSON.parse(item.info);
                const options = info.options;
                if (typeof options === "object" && options.price) {
                  price = options.price;
                  variations = getVariationsNames(options);
                }
              }

              return (
                <View style={styles.cartItem}>
                  <View style={styles.itemTopRow}>
                    <Image
                      source={
                        item?.term?.media?.value
                          ? { uri: item?.term?.media?.value }
                          : productPlaceholder
                      }
                      style={styles.cartItemImage}
                    />
                    <View style={styles.cartItemDetails}>
                      <Text style={styles.cartItemName}>{item?.term?.title || item?.title}</Text>
                      {variations?.length > 0 && (
                        <View style={styles.variantContainer}>
                          {variations.map((option, index) => (
                            <Text key={`${option}-${index}`} style={styles.variantText}>
                              {option}
                            </Text>
                          ))}
                        </View>
                      )}
                      <View style={styles.quantityContainer}>
                        <Text style={styles.quantityText}>{quantiy}</Text>
                      </View>
                    </View>
                    <View style={styles.cartItemPriceContainer}>
                      <Text style={styles.cartItemPrice}>
                        {" "}
                        {storeData?.currency_info?.currency_icon}
                        {price.toFixed(2)}
                      </Text>

                      {remainingQuantity > 0 && !fullRefundRecord && (
                        <TouchableOpacity
                          style={styles.refundButton}
                          onPress={() => {
                            setSelectedItem(item);
                            setRefundQuantity(1);
                            setRefundModalVisible(true);
                          }}
                        >
                          <Icon name="undo-variant" size={20} color="#1769E0" />
                          <Text style={styles.refundButtonText}>Refund Item</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {refunded && (
                    <View style={styles.refundSuccessBox}>
                      <View style={styles.refundSuccessIcon}>
                        <Icon name="check" size={22} color="#fff" />
                      </View>

                      <View style={styles.refundSuccessDetails}>
                        <Text style={styles.refundedQuantityText}>
                          Refunded Quantity: {refunded.quantity}
                        </Text>

                        <Text style={styles.refundedAmountText}>
                          Refunded Amount: ${refunded.amount.toFixed(2)}
                        </Text>

                        <Text style={styles.remainingQuantityText}>
                          Remaining Quantity: {remainingQuantity}
                        </Text>
                      </View>

                      <Text style={styles.refundedTotalAmount}>${refunded.amount.toFixed(2)}</Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      </View>
      <View style={styles.bottomBar}>
        <BottomBar />
      </View>

      <FullScreenLoader show={loading} transparent={true} />
      {/* ==================== REFUND ITEM MODAL ==================== */}
      <Modal
        visible={refundModalVisible && !loading}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRefundModalVisible(false);
        }}
      >
        <View style={styles.refundOverlay}>
          <View style={styles.refundModal}>
            <Text style={styles.modalTitle}>Email Receipt Information</Text>

            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
            />
            {emailError && <Text style={styles.emailError}>{emailError}</Text>}

            <Text style={styles.quantityLabel}>Quantity</Text>

            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityCircle}
                onPress={() => setRefundQuantity((q) => Math.max(1, q - 1))}
              >
                <Text style={styles.quantitySymbol}>−</Text>
              </TouchableOpacity>

              <Text style={styles.refundQuantity}>{refundQuantity}</Text>

              <TouchableOpacity
                style={styles.quantityCircle}
                onPress={() =>
                  setRefundQuantity((q) =>
                    Math.min(
                      Math.max(
                        Number(selectedItem?.qty || 0) -
                          Number(refundedItems[selectedItem?.id]?.quantity || 0),
                        0,
                      ),
                      q + 1,
                    ),
                  )
                }
              >
                <Text style={styles.quantitySymbol}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.refundConfirmButton}
              onPress={() => {
                handleRefundItem(selectedItem);
              }}
            >
              <Text style={styles.refundConfirmText}>Refund Item</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRefundModalVisible(false)}>
              <Text style={styles.refundCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== FULL REFUND MODAL ==================== */}
      <Modal
        visible={fullRefundModalVisible && !loading}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setFullRefundModalVisible(false);
        }}
      >
        <View style={styles.refundOverlay}>
          <View style={styles.refundModal}>
            <Text style={styles.modalTitle}>Full Refund</Text>

            <Text style={styles.modalemailTitle}>Email Receipt Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Customer Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
            />
            {emailError && <Text style={styles.emailError}>{emailError}</Text>}

            <Text style={styles.fullRefundModalText}>
              Refund Amount: ${Number(order?.total || 0).toFixed(2)}
            </Text>

            <TouchableOpacity
              style={styles.refundConfirmButton}
              onPress={() => {
                handleFullRefund();
              }}
            >
              <Text style={styles.refundConfirmText}>Full Refund</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setFullRefundModalVisible(false);
                setEmail("");
              }}
            >
              <Text style={styles.refundCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
    position: "relative",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  itemsMain: {
    flex: 1,
    flexDirection: "column",
  },
  cartItem: {
    padding: 15,
    borderRadius: 6,
    marginVertical: 5,
    backgroundColor: "#FFF",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
  },
  itemsMainWrap: {
    paddingHorizontal: 15,
    flex: 1,
    flexDirection: "column",
    paddingBottom: 80,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 15,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  variantContainer: {
    marginBottom: 10,
  },
  variantText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  cartItemPriceContainer: {
    flex: 1, // Adjust the style based on your design
    alignItems: "flex-end",
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
  },

  fullRefundButton: {
    marginHorizontal: 15,
    marginBottom: 15,
    height: 50,
    backgroundColor: "#2875E8",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  fullRefundText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  refundButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  refundButtonText: {
    color: "#1769E0",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },

  refundOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  refundModal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },

  quantityLabel: {
    fontSize: 18,
    color: "#555",
    marginBottom: 15,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  quantityCircle: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#00c0ff",
    alignItems: "center",
    justifyContent: "center",
  },

  quantitySymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },

  refundQuantity: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#aaaaaa",
    marginHorizontal: 30,
  },

  refundConfirmButton: {
    width: "100%",
    height: 55,
    borderRadius: 30,
    backgroundColor: "#00c0ff",
    alignItems: "center",
    justifyContent: "center",
  },

  refundConfirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  refundCancelText: {
    marginTop: 15,
    fontSize: 18,
    color: "#666",
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  refundSuccessBox: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#EEF9F4",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  refundSuccessIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  refundSuccessDetails: {
    flex: 1,
  },

  refundedQuantityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  refundedAmountText: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },

  remainingQuantityText: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  refundedTotalAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0A9F4B",
  },
  fullRefundSuccessBox: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#EEF9F4",
    borderWidth: 1,
    borderColor: "#C8EEDD",
    flexDirection: "row",
    alignItems: "center",
  },

  fullRefundSuccessIcon: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#0CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },

  fullRefundSuccessDetails: {
    flex: 1,
  },

  fullRefundSuccessTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A9F4B",
    marginBottom: 8,
  },

  fullRefundInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  fullRefundDate: {
    alignItems: "flex-end",
    marginTop: 30,
  },
  modalTitle: {
    fontSize: 18,
    marginRight: "auto",
    paddingBottom: 10,
    fontWeight: "bold",
  },
  modalemailTitle: {
    fontSize: 16,
    marginRight: "auto",
    paddingBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  fullRefundModalText: {
    width: "100%",
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },

  emailError: {
    color: "red",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
});

export default CompletedOrderDetailScreen;
