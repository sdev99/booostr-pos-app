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
import DropDownPicker from "react-native-dropdown-picker";

const partialRefundTypes = [
  { label: "Item Refund", value: "partial_item_refund" },
  { label: "Amount Refund ($)", value: "partial_amount_refund" },
];

const CompletedOrderDetailScreen = ({ route, navigation }) => {
  const storeData = useSelector(memoizedStoreData);
  const order = route.params?.order;

  // REFUND STATE
  const [refundQuantity, setRefundQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [dollarAmount, setDollarAmount] = useState("");
  const [dollarAmountError, setDollarAmountError] = useState("");

  const [refundedItems, setRefundedItems] = useState({});
  const [fullRefundRecord, setFullRefundRecord] = useState(null);

  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState(null);
  const [fullRefundModalVisible, setFullRefundModalVisible] = useState(false);

  const [selectedPartialRefundType, setSelectedPartialRefundType] = useState(
    partialRefundTypes[0].value,
  );
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "";
    const parsedDate =
      typeof dateVal === "string"
        ? new Date(dateVal.replace(" ", "T"))
        : new Date(dateVal);

    if (isNaN(parsedDate.getTime())) return "";

    return `${parsedDate.toLocaleDateString()} ${parsedDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  };

  const getItemUnitPrice = (item) => {
    if (!item) return 0;
    let price = Number(item.amount || 0);
    if (item.term?.is_variation === 1 && item.info) {
      try {
        const info = JSON.parse(item.info);
        if (info.options?.price) {
          price = Number(info.options.price);
        }
      } catch (e) {}
    }
    return price ;
  };

  const getMaxRefundableAmount = (item) => {
    if (!item) return 0;
    const qty = Number(item.qty || item.quantity || 1);
    const price = getItemUnitPrice(item);
    const totalLineAmount = qty * price;
    const alreadyRefunded = Number(refundedItems[item.id]?.amount || 0);

    return Math.max(totalLineAmount - alreadyRefunded, 0);
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
    console.log("CompletedOrderDetailScreen - order:", order);
    
    const refundData = {};
    const refundLogs =
      order?.orderlasttrans?.partial_refund_logs ||
      order?.orderlasttrans?.refund_logs ||
      [];

    refundLogs.forEach((refund) => {
      const isDollarRefund =
        refund.type === "dollar" ||
        refund.reason === "partial_dollar_refund" ||
        refund.stripe_refund_id?.includes("partial_dollar");

      const logRefundedAt =
        refund.refunded_at || refund.created_at || order.refunded_at || null;

      refund.items?.forEach((item) => {
        const itemId = item.item_id;
        const itemQty = isDollarRefund ? 0 : Number(item.qty || 0);
        const itemAmt = Number(item.amount || refund.item_amount || 0);
        const itemTax = Number(item.tax || refund.tax_amount || 0);
        const totalRefundedForLine =
          refund.grand_total ? Number(refund.grand_total) : itemAmt + itemTax;

        if (!refundData[itemId]) {
          refundData[itemId] = {
            quantity: 0,
            amount: 0,
            hasDollarRefund: false,
            history: [],
          };
        }

        if (isDollarRefund) {
          refundData[itemId].hasDollarRefund = true;
        }

        refundData[itemId].quantity += itemQty;
        refundData[itemId].amount += totalRefundedForLine;

        refundData[itemId].history.push({
          id:
            refund.stripe_refund_id ||
            refund.fingerprint ||
            Math.random().toString(),
          isAmountOnly: isDollarRefund,
          quantity: isDollarRefund ? 0 : Number(item.qty || 1),
          amount: totalRefundedForLine,
          item_amount: itemAmt,
          tax_amount: itemTax,
          refunded_at: logRefundedAt,
        });
      });
    });

    setRefundedItems(refundData);

    // Check for Full Refund Record
    if (order?.payment_status === 5) {
      const quick_sale_items = order?.quick_sale_items || [];
      if (quick_sale_items.length > 0) {
        let totalRefundedItems = 0;

        quick_sale_items.forEach((item) => {
          const quickSaleOrderTotalAmount = item.amount * item.quantity;
          let quickSaleOrderRefundedTotalAmount = 0;
          refundLogs.forEach((refund) => {
            const refundedItem = refund.items?.find(
              (rfndItm) => rfndItm.item_id === item.id,
            );
            if (refundedItem) {
              quickSaleOrderRefundedTotalAmount +=
                Number(refund.item_amount || 0) + Number(refund.tax_amount || 0);
            }
          });
          if (quickSaleOrderRefundedTotalAmount >= quickSaleOrderTotalAmount) {
            totalRefundedItems++;
          }
        });

        if (totalRefundedItems === quick_sale_items.length) {
          setFullRefundRecord({
            status: "Completed",
            amount: order.total,
            refundedAt: order.refunded_at
              ? new Date(order.refunded_at.replace(" ", "T"))
              : new Date(),
            totalItems:
              (order?.orderitems?.length || 0) +
              (order?.quick_sale_items?.length || 0),
          });
        }
      } else {
        setFullRefundRecord({
          status: "Completed",
          amount: order.total,
          refundedAt: order.refunded_at
            ? new Date(order.refunded_at.replace(" ", "T"))
            : new Date(),
          totalItems:
            (order?.orderitems?.length || 0) +
            (order?.quick_sale_items?.length || 0),
        });
      }
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
        Alert.alert("Error", "Club information not available.");
        return;
      }

      const response = await orderApi.refundPayment(refundData, club);

      if (response?.status === "success") {
        const refundAmount = Number(response.amount) / 100;

        setFullRefundRecord({
          status: "Completed",
          amount: refundAmount,
          refundedAt: new Date(),
          totalItems: order?.orderitems?.length || 0,
          // type: "full",
        });

        setFullRefundModalVisible(false);

        Alert.alert(
          "Refund Successful",
          `Refund of $${refundAmount.toFixed(2)} has been successfully processed.`,
        );
      } else {
        Alert.alert(
          "Refund Failed",
          response?.message || "Unable to process refund.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Refund Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
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

      const isAmountRefund =
        selectedPartialRefundType === "partial_amount_refund";
      let refundData;

      if (isAmountRefund) {
        const enteredAmt = Number(dollarAmount);
        const maxAllowed = getMaxRefundableAmount(item);

        if (!dollarAmount || isNaN(enteredAmt) || enteredAmt <= 0) {
          setDollarAmountError("Please enter a valid amount.");
          return;
        }
        if (enteredAmt > maxAllowed) {
          setDollarAmountError(
            `Amount cannot exceed $${maxAllowed.toFixed(2)}`,
          );
          return;
        }

        refundData = {
          paymentId: paymentId,
          reason: "partial_dollar_refund",
          email: email,
          refundType: "dollar",
          items: [
            {
              order_item_id: item.id,
              amount: dollarAmount,
            },
          ],
        };
      } else {
        refundData = {
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
      }

      setLoading(true);

      let response;

      if (item.type === "quick_sale") {
        response = await orderApi.quickSaleRefundPayment(refundData, club);
      } else {
        response = await orderApi.refundPayment(refundData, club);
      }

      if (response?.status === "success") {
        const refundAmount = Number(response.amount) / 100;
        const refundedQtyNum = isAmountRefund ? 0 : Number(refundQuantity);

        const previousRefund = refundedItems[item.id] || {
          quantity: 0,
          amount: 0,
          hasDollarRefund: false,
          history: [],
        };

        const nowIso = new Date()
          .toISOString()
          .replace("T", " ")
          .substring(0, 19);

        const newTransaction = {
          id: response.transaction_id || Math.random().toString(),
          isAmountOnly: isAmountRefund,
          quantity: refundedQtyNum,
          amount: refundAmount,
          item_amount: refundAmount,
          tax_amount: 0,
          refunded_at: response.refunded_at || nowIso,
        };

        const newRefundRecord = {
          quantity: previousRefund.quantity + refundedQtyNum,
          amount: previousRefund.amount + refundAmount,
          hasDollarRefund: previousRefund.hasDollarRefund || isAmountRefund,
          history: [...previousRefund.history, newTransaction],
        };

        const updatedRefundedItems = {
          ...refundedItems,
          [item.id]: newRefundRecord,
        };

        setRefundedItems(updatedRefundedItems);

        const allItemsRefunded = order?.orderitems?.every((orderItem) => {
          const maxRemaining = getMaxRefundableAmount(orderItem);
          return maxRemaining <= 0;
        });

        if (allItemsRefunded) {
          const totalRefundAmount = Object.values(updatedRefundedItems).reduce(
            (total, refund) => total + Number(refund.amount || 0),
            0,
          );

          const itemQty = Number(orderItem.qty || orderItem.quantity || 0);

          return refundedQty >= itemQty;
        });

        const totalRefundAmount = Object.values(updatedRefundedItems).reduce(
          (total, refund) => total + Number(refund?.amount || 0),
          0,
        );

        setFullRefundRecord({
          status: "Completed",
          amount: totalRefundAmount,
          refundedAt: new Date(),
          totalItems: allOrderItems.filter((item) => {
            const refundedQty = Number(
              updatedRefundedItems[item.id]?.quantity || 0,
            );

            return refundedQty > 0;
          }).length,
          type: allItemsRefunded ? "full" : "partial",
        });

        setRefundModalVisible(false);
        setSelectedItem(null);
        setDollarAmount("");

        Alert.alert(
          "Refund Successful",
          `Refund of $${refundAmount.toFixed(2)} has been successfully processed.`,
        );
      } else {
        setRefundModalVisible(false);
        setSelectedItem(null);

        Alert.alert(
          "Refund Failed",
          response?.message || "Unable to process refund.",
        );
      }
    } catch (error) {
      setRefundModalVisible(false);
      setSelectedItem(null);

      Alert.alert(
        "Refund Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const anyItemRefunded = order?.orderitems?.some((item) => {
    const refundedQuantity = Number(refundedItems[item.id]?.quantity || 0);
    const refundedAmount = Number(refundedItems[item.id]?.amount || 0);
    return refundedQuantity > 0 || refundedAmount > 0;
  });

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Order #{order?.invoice_no}</Text>
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
              <Text style={styles.fullRefundSuccessTitle}>
                {fullRefundRecord?.type === "partial"
                  ? "Partial Refund Completed"
                  : "Full Refund Completed"}
              </Text>

              <Text style={styles.fullRefundInfo}>
                Total Items: {fullRefundRecord.totalItems}
              </Text>

              <Text style={styles.fullRefundInfo}>
                Total Refund Amount: ${fullRefundRecord.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.fullRefundDate}>
              <Text style={styles.fullRefundInfo}>
                {formatDateTime(fullRefundRecord.refundedAt)}
              </Text>
            </View>
          </View>
        )
      )}

      <View style={styles.itemsMain}>
        <View style={styles.itemsMainWrap}>
          <FlatList
            data={[
              ...(order?.orderitems || []),
              ...(order?.quick_sale_items || []),
            ]}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              let variations;
              const unitPrice = getItemUnitPrice(item);
              const originalQty = Number(item.qty || item.quantity || 1);
              const refunded = refundedItems[item.id];
              const refundedQuantity = refunded?.quantity || 0;
              const maxRefundableAmount = getMaxRefundableAmount(item);

              // Calculate maximum whole items refundable based on remaining dollar balance
              const effectiveRefundableQty =
                unitPrice > 0
                  ? Math.min(
                      Math.max(originalQty - refundedQuantity, 0),
                      Math.floor(maxRefundableAmount / unitPrice),
                    )
                  : 0;

              if (item.term?.is_variation === 1 && item.info) {
                try {
                  const info = JSON.parse(item.info);
                  const options = info.options;
                  if (typeof options === "object") {
                    variations = getVariationsNames(options);
                  }
                } catch (e) {}
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
                      <Text style={styles.cartItemName}>
                        {item?.term?.title || item?.title}
                      </Text>
                      {variations?.length > 0 && (
                        <View style={styles.variantContainer}>
                          {variations.map((option, index) => (
                            <Text
                              key={`${option}-${index}`}
                              style={styles.variantText}
                            >
                              {option}
                            </Text>
                          ))}
                        </View>
                      )}
                      <View style={styles.quantityContainer}>
                        <Text style={styles.quantityText}>Qty: {originalQty}</Text>
                        {refunded?.hasDollarRefund ? (
                          <Text style={styles.dollarRefundBadge}>
                            (Partial $ Refunded)
                          </Text>
                        ) : refundedQuantity > 0 ? (
                          <Text style={styles.remainingBadge}>
                            (Remaining: {effectiveRefundableQty})
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.cartItemPriceContainer}>
                      <Text style={styles.cartItemPrice}>
                        {storeData?.currency_info?.currency_icon || "$"}
                        {unitPrice.toFixed(2)}
                      </Text>

                      {maxRefundableAmount > 0 && !fullRefundRecord && (
                        <TouchableOpacity
                          style={styles.refundButton}
                          onPress={() => {
                            setSelectedItem(item);
                            // Default to Amount Refund if no full unit can be returned
                            if (effectiveRefundableQty <= 0) {
                              setSelectedPartialRefundType("partial_amount_refund");
                            } else {
                              setSelectedPartialRefundType("partial_item_refund");
                            }
                            setRefundQuantity(1);
                            setRefundModalVisible(true);
                          }}
                        >
                          <Icon name="undo-variant" size={20} color="#1769E0" />
                          <Text style={styles.refundButtonText}>
                            Refund Item
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* ALL REFUND LOGS FOR THIS ITEM */}
                  {refunded?.history && refunded.history.length > 0 && (
                    <View style={styles.refundTransactionsContainer}>
                      <Text style={styles.refundSectionHeading}>
                        Refund Logs ({refunded.history.length})
                      </Text>
                      {refunded.history.map((tx, idx) => (
                        <View
                          key={tx.id || String(idx)}
                          style={styles.refundSuccessBox}
                        >
                          <View
                            style={[
                              styles.refundSuccessIcon,
                              tx.isAmountOnly && { backgroundColor: "#FF9800" },
                            ]}
                          >
                            <Icon
                              name={tx.isAmountOnly ? "currency-usd" : "check"}
                              size={18}
                              color="#fff"
                            />
                          </View>

                          <View style={styles.refundSuccessDetails}>
                            <Text style={styles.refundedQuantityText}>
                              {tx.isAmountOnly
                                ? "Partial Amount Refund"
                                : `Item Refund (Qty: ${tx.quantity})`}
                            </Text>
                            {tx.refunded_at && (
                              <View style={styles.timeRow}>
                                <Icon
                                  name="clock-outline"
                                  size={12}
                                  color="#777"
                                />
                                <Text style={styles.refundDateText}>
                                  {formatDateTime(tx.refunded_at)}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.refundedTotalAmount}>
                            -${Number(tx.amount || 0).toFixed(2)}
                          </Text>
                        </View>
                      ))}
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

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError("");
                }}
              />
              {emailError && (
                <Text style={styles.emailError}>{emailError}</Text>
              )}
            </View>

            <DropDownPicker
              open={isDropdownVisible}
              value={selectedPartialRefundType}
              items={
                // Disable item refund option if unit balance doesn't cover a full quantity
                getItemUnitPrice(selectedItem) > 0 &&
                Math.floor(
                  getMaxRefundableAmount(selectedItem) /
                    getItemUnitPrice(selectedItem),
                ) <= 0
                  ? [
                      {
                        label: "Amount Refund ($)",
                        value: "partial_amount_refund",
                      },
                    ]
                  : partialRefundTypes
              }
              setOpen={setIsDropdownVisible}
              setValue={setSelectedPartialRefundType}
            />

            {selectedPartialRefundType === "partial_amount_refund" ? (
              <View style={styles.inputContainer}>
                <Text style={styles.amountLabel}>
                  Enter $ Amount (max amount $
                  {getMaxRefundableAmount(selectedItem).toFixed(2)})
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Refund Amount"
                  keyboardType="numeric"
                  value={dollarAmount}
                  onChangeText={(text) => {
                    setDollarAmount(text);
                    setDollarAmountError("");
                  }}
                />
                {dollarAmountError && (
                  <Text style={styles.emailError}>{dollarAmountError}</Text>
                )}
              </View>
            ) : (
              <>
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
                    onPress={() => {
                      const unitP = getItemUnitPrice(selectedItem);
                      const maxPossibleQty =
                        unitP > 0
                          ? Math.floor(
                              getMaxRefundableAmount(selectedItem) / unitP,
                            )
                          : 0;

                      setRefundQuantity((q) =>
                        Math.min(Math.max(maxPossibleQty, 1), q + 1),
                      );
                    }}
                  >
                    <Text style={styles.quantitySymbol}>+</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

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

            <Text style={styles.modalemailTitle}>
              Email Receipt Information
            </Text>

            <View style={styles.inputContainer}>
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
              {emailError && (
                <Text style={styles.emailError}>{emailError}</Text>
              )}
            </View>

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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
  },
  itemsMainWrap: {
    paddingHorizontal: 15,
    flex: 1,
    flexDirection: "column",
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
    flexWrap: "wrap",
  },
  quantityText: {
    fontSize: 13,
    color: "#333",
  },
  remainingBadge: {
    fontSize: 12,
    color: "#27ae60",
    marginLeft: 6,
    fontWeight: "500",
  },
  dollarRefundBadge: {
    fontSize: 12,
    color: "#e67e22",
    marginLeft: 6,
    fontWeight: "600",
  },
  cartItemPriceContainer: {
    flex: 1,
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
    gap: 16,
  },
  quantityLabel: {
    fontSize: 18,
    color: "#555",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 18,
    color: "#666",
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  refundTransactionsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  refundSectionHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  refundSuccessBox: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#EEF9F4",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  refundSuccessIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  refundSuccessDetails: {
    flex: 1,
  },
  refundedQuantityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  refundDateText: {
    fontSize: 11,
    color: "#777",
  },
  refundedTotalAmount: {
    fontSize: 14,
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
    fontWeight: "bold",
  },
  modalemailTitle: {
    fontSize: 16,
    marginRight: "auto",
  },
  inputContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  fullRefundModalText: {
    width: "100%",
    fontSize: 16,
    color: "#555",
  },
  emailError: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
  },
  amountLabel: {
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
});

export default CompletedOrderDetailScreen;