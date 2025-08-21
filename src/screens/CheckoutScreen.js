import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Header from "./Header";
import {
  memoizedCart,
  memoizedStoreData,
  memoizedUserData,
  memoizedOrderList,
} from "../store/selectors";
import { resetCart } from "../store/reducers/cartSlice";
// import { processCashOrder } from "../actions/order";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processOrder } from "../actions/order";
import {
  addToOrderList,
  removeOrderFromOrderList,
} from "../store/reducers/orderListSlice";
import { useStripeTerminal } from "@stripe/stripe-terminal-react-native";
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";
//import { FontAwesome } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import { getItemPrice } from "../api/product";
import {
  CardField,
  CardForm,
  StripeProvider,
  useStripe,
} from "@stripe/stripe-react-native";

const screenWidth = Dimensions.get("window").width;

const CheckoutScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const orderList = useSelector(memoizedOrderList);
  const [cart, setCart] = useState(useSelector(memoizedCart));
  const userData = useSelector(memoizedUserData);
  const db = SQLite.openDatabaseSync("pos.db");
  const [publishableKey, setPublishableKey] = useState("");

  const storeData = useSelector(memoizedStoreData);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [readerStatusText, setReaderStatusText] = useState("Setting Up...");
  //const { totalAmount } = route?.params || {};
  const { confirmPayment } = useStripe();

  const {
    connectedReader,
    retrievePaymentIntent,
    collectPaymentMethod,
    confirmPaymentIntent,
  } = useStripeTerminal({
    onDidRequestReaderInput: (options) => {
      // Placeholder for updating your app's checkout UI
      Alert.alert(options.join("/"));
    },
    onDidRequestReaderDisplayMessage: (message) => {
      Alert.alert(message);
    },
  });

  const [paymentType, setPaymentType] = useState("card");
  const [selectedCardType, setSelectedCardType] = useState("mastercard");

  const [quickAmtBtn, setQuickAmtBtn] = useState(0);

  // Setup Cart
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          setCart(
            typeof route?.params?.orderIndex == "number"
              ? orderList[route.params.orderIndex]?.items
              : cart
          );
        } catch (error) {
          console.error("Error setting up cart:", error);
          // alert("kindly try after some time.");
        }
      };

      fetchData();
    }, [])
  );

  const getTotalPrice = () => {
    // Calculate total of all items without tax
    const subtotal = cart?.reduce(
      (total, item) => total + getItemPrice(item) * item.cart_quantity,
      0
    );

    // Calculate total with 10% tax
    const tax = (subtotal * parseFloat(storeData?.tax)) / 100;
    const totalDue = subtotal + tax;

    return { subtotal, tax, totalDue: parseFloat(totalDue).toFixed(2) };
  };

  const totalAmount = getTotalPrice().totalDue;
  const [amountTendered, setAmountTendered] = useState("0.00");

  const [club, setClub] = useState(null);

  // Fetch Club Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clubStr = await AsyncStorage.getItem("club");
        if (clubStr) {
          setClub(JSON.parse(clubStr));
        }
      } catch (error) {
        console.error("Error fetching club data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (storeData) {
      const getways = storeData?.Getway;
      const stripGateway = getways.find(
        (item) => item.name.toLowerCase() === "stripe"
      );
      const gatewayCredential = JSON.parse(stripGateway.data);

      setPublishableKey(
        stripGateway.test_mode === 1
          ? gatewayCredential.test_publishable_key
          : gatewayCredential.publishable_key
      );
    }
  }, [storeData]);

  useEffect(() => {
    if (club && totalAmount >= 0) {
      generateStripePaymentIntent();
    }
  }, [club, totalAmount, generateStripePaymentIntent]);

  const handleKeypadPress = (value) => {
    if (value === "C") {
      setAmountTendered("0.00");
    } else if (value === "Exact") {
      setAmountTendered(totalAmount ? totalAmount.toString() : "0.00");
    } else if (!isNaN(value)) {
      setAmountTendered(value.toString()); // Set the value directly
    } else {
      if (!isNaN(value)) {
        setAmountTendered((prevAmount) => prevAmount + value); // Concatenate the values
      } else {
        setAmountTendered((prevAmount) =>
          (parseFloat(prevAmount) + parseFloat(value)).toString()
        );
      }
    }
  };

  // Function to handle adding the value to the amount
  const handleAfterQuickClickAmt = (prevAmount, value) => {
    let prevAmountArr = prevAmount.split("");
    if (quickAmtBtn == 4) {
      return (
        prevAmountArr[0] +
        prevAmountArr[1] +
        prevAmountArr[2] +
        prevAmountArr[3] +
        value
      );
    } else if (quickAmtBtn == 3) {
      return (
        prevAmountArr[0] +
        prevAmountArr[1] +
        prevAmountArr[2] +
        prevAmountArr[4] +
        value
      );
    } else if (quickAmtBtn == 2) {
      return (
        prevAmountArr[0] +
        prevAmountArr[3] +
        prevAmountArr[2] +
        prevAmountArr[4] +
        value
      );
    } else if (quickAmtBtn == 1) {
      return (
        prevAmountArr[1] +
        prevAmountArr[3] +
        prevAmountArr[2] +
        prevAmountArr[4] +
        value
      );
    }

    return prevAmount;
  };

  const handleNumericButtonPress = (value) => {
    if (value === "00") {
      setQuickAmtBtn(0);
      setAmountTendered((prevAmount) =>
        (parseFloat(prevAmount) * 100).toFixed(2)
      );
      return;
    }
    if (quickAmtBtn > 0) setQuickAmtBtn(quickAmtBtn - 1);
    setAmountTendered((prevAmount) =>
      prevAmount === "0.00" || prevAmount == ""
        ? "0.0" + value.toString()
        : quickAmtBtn > 0
        ? handleAfterQuickClickAmt(prevAmount, value)
        : prevAmount.includes(".")
        ? value === "00"
          ? (parseFloat(prevAmount) * 100).toFixed(2) + "." + value.toString()
          : (parseFloat(prevAmount) * 10).toFixed(1) + value.toString()
        : prevAmount + value.toString() + ".00"
    );
  };
  const handleClearPress = () => {
    setQuickAmtBtn(0);
    let pattern = /\.[0-9]$/;
    setAmountTendered((prevAmount) =>
      pattern.test(prevAmount)
        ? prevAmount.substring(0, prevAmount.length - 2)
        : prevAmount.substring(0, prevAmount.length - 1)
    );
  };
  // const [saveCardInfo, setSaveCardInfo] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  //const [radioSelected, setRadioSelected] = useState(false);
  const receiptItems = [
    { itemName: "FBAR", quantity: 1, price: 11.99 },
    // Add more items as needed
  ];

  const calculateSubtotal = () => {
    return receiptItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };
  const calculateGST = () => {
    // Assuming GST is 10% for demonstration purposes
    const gstPercentage = 0.1;
    return calculateSubtotal() * gstPercentage;
  };

  //const calculateDiscount = (discountAmount) => {
  //   return discountAmount;
  // };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGST(); // Total due is the sum of subtotal and GST
  };

  // remove variation_price_object key before submit to api ,
  // it was added for display variation data in the cart and other screens
  const getCartObj = () => {
    // return JSON.parse(JSON.stringify(cart)).map((item) => {
    //   delete item["variation_price_object"];
    //   return item;
    // });
    return cart;
  };

  const handleCardPay = async () => {
    if (processingOrder) return;
    setProcessingOrder(true);

    if (!stripeClientSecret || !stripeCardForm?.complete) {
      setProcessingOrder(false);
      return;
    }

    const { paymentIntent, error } = await confirmPayment(stripeClientSecret, {
      paymentMethodType: "Card",
      paymentMethodData: {
        billingDetails: {
          // name, email, etc. if needed
        },
      },
    });

    if (error) {
      Alert.alert("Payment confirmation error", error.message);
      setProcessingOrder(false);
      return;
    } else if (paymentIntent) {
      try {
        let order = {};
        const d = new Date();
        order["created_at"] = `${d.getFullYear()}-${(
          d.getMonth() +
          1 +
          ""
        ).padStart(2, "0")}-${(d.getDate() + "").padStart(2, "0")} ${d
          .getHours()
          .toString()
          .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
        order["items"] = getCartObj();

        order["order_total"] = totalAmount;
        order["order_subtotal"] = getTotalPrice().subtotal;
        order["order_tax"] = getTotalPrice().tax;
        order["tax"] = `${storeData?.tax}%`;
        order["payment_method"] = "card";
        order["payment_identifiers"] = "card";
        order["payment_details"] = {
          charges: [{ id: paymentIntent.id }],
        };
        order["club_name"] = club?.post_title;
        order["wpuid"] = userData.user_id;
        order["timezone"] = storeData.club_info.timezone;
        console.log("order::", JSON.stringify(order));

        dispatch(processOrder(order, club))
          .then((response) => {
            if (response?.status === "success") {
              const dateTime = new Date(response?.data?.order_date);
              const formattedDateTime = dateTime
                .toISOString()
                .replace("T", " ")
                .replace(/\.\d+Z$/, "");
              order = {
                ...order,
                status: "success",
                orderId: response?.data?.order_id,
                created_at: formattedDateTime,
              };
              if (typeof route?.params?.orderIndex == "number") {
                db.transaction((tx) => {
                  tx.executeSql(
                    "DELETE FROM onHoldOrders WHERE createdAt = ? AND club = ?;",
                    [
                      orderList[route.params.orderIndex].created_at,
                      club.post_slug,
                    ],
                    () => {
                      console.log("Row deleted successfully");
                      dispatch(
                        removeOrderFromOrderList(route.params.orderIndex)
                      );
                    },
                    (_, error) => {
                      console.error("Error deleting row:", error);
                    }
                  );
                });
              }
              dispatch(addToOrderList(order))
                .then(() => {
                  if (typeof route?.params?.orderIndex != "number")
                    dispatch(resetCart());
                  navigation.navigate("PaymentSuccess", { order });
                })
                .catch((error) => {
                  console.error("Error processing Order:", error);
                });
            } else {
              alert(response);
            }
          })
          .catch((error) => {
            alert(error.toString());
          })
          .finally(() => {
            setProcessingOrder(false);
          });
      } catch (error) {
        alert(error.toString());
        setProcessingOrder(false);
      }
    } else {
      alert(
        "Invalid Card Details\nPlease check your card information and try again."
      );
      setProcessingOrder(false);
    }
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };
  {
    /*const handleProcess = () => {
    const totalAmount = calculateTotal();
    navigation.navigate("Cash", { totalAmount });
  };*/
  }
  const handleProcessCash = async () => {
    if (processingOrder) return;
    setProcessingOrder(true);

    const tenderedAmount = parseFloat(amountTendered);
    if (tenderedAmount < totalAmount) {
      Alert.alert(
        "Insufficient Amount",
        "The amount being tendered is less than the order amount. Please update tendered amount to be equal or more than the order amount.",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed"),
          },
        ],
        { cancelable: false }
      );
      setProcessingOrder(false);
    } else {
      try {
        let order = {};
        const d = new Date();
        order["created_at"] = `${d.getFullYear()}-${(
          d.getMonth() +
          1 +
          ""
        ).padStart(2, "0")}-${(d.getDate() + "").padStart(2, "0")} ${d
          .getHours()
          .toString()
          .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;
        order["items"] = getCartObj();
        order["order_total"] = totalAmount;
        order["order_subtotal"] = getTotalPrice().subtotal;
        order["order_tax"] = getTotalPrice().tax;
        order["tax"] = `${storeData?.tax}%`;
        order["payment_method"] = "cash";
        order["payment_details"] = { tendered_amount: tenderedAmount };
        order["club_name"] = club?.post_title;
        order["wpuid"] = userData.user_id;
        order["timezone"] = storeData.club_info.timezone;
        console.log("order::", order);

        dispatch(processOrder(order, club))
          .then((response) => {
            if (response?.status === "success") {
              const dateTime = new Date(response?.data?.order_date);
              const formattedDateTime = dateTime
                .toISOString()
                .replace("T", " ")
                .replace(/\.\d+Z$/, "");
              order = {
                ...order,
                status: "success",
                orderId: response?.data?.order_id,
                created_at: formattedDateTime,
              };
              if (typeof route?.params?.orderIndex == "number") {
                db.transaction((tx) => {
                  tx.executeSql(
                    "DELETE FROM onHoldOrders WHERE createdAt = ? AND club = ?;",
                    [
                      orderList[route.params.orderIndex].created_at,
                      club.post_slug,
                    ],
                    () => {
                      console.log("Row deleted successfully");
                      dispatch(
                        removeOrderFromOrderList(route.params.orderIndex)
                      );
                    },
                    (_, error) => {
                      console.error("Error deleting row:", error);
                    }
                  );
                });
              }
              dispatch(addToOrderList(order))
                .then(() => {
                  if (typeof route?.params?.orderIndex != "number")
                    dispatch(resetCart());
                  navigation.navigate("PaymentSuccess", { order });
                })
                .catch((error) => {
                  console.error("Error processing Order:", error);
                });
            } else {
              alert(response);
            }
          })
          .catch((error) => {
            alert(error.toString());
          })
          .finally(() => {
            setProcessingOrder(false);
          });
      } catch (error) {
        alert(error.toString());
        setProcessingOrder(false);
      }
    }
  };

  const handleCancelOrder = async () => {
    try {
      dispatch(resetCart());
      navigation.navigate("Orders");
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };
  const renderSelectionButton = (label, value) => (
    <TouchableOpacity
      key={label}
      style={[styles.selectionButton, label === "Exact" && styles.exactButton]}
      onPress={() => {
        if (value == "10.00" || value == "20.00") {
          setQuickAmtBtn(4);
        }
        handleKeypadPress(value.toString());
      }}
    >
      <Text
        style={label === "Exact" ? styles.exactButtonText : styles.SelectText}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  const renderClearButton = () => (
    <TouchableOpacity
      key="clear"
      style={[styles.keypadButton, styles.keypadButtonCut]}
      onPress={() => handleClearPress()}
    >
      <Icon name="backspace" size={24} color="#000" />
    </TouchableOpacity>
  );
  const renderNumericButton = (value) => (
    <TouchableOpacity
      key={value}
      style={styles.keypadButton}
      onPress={() => handleNumericButtonPress(value)}
    >
      <Text style={styles.keypadButtonText}>{value}</Text>
    </TouchableOpacity>
  );

  const holdOrder = async () => {
    if (typeof route?.params?.orderIndex == "number") {
      navigation.navigate("OnlineOrder");
      return;
    }
    try {
      let order = {};
      const d = new Date();
      order["created_at"] = `${d.getFullYear()}-${(
        d.getMonth() +
        1 +
        ""
      ).padStart(2, "0")}-${(d.getDate() + "").padStart(2, "0")} ${d
        .getHours()
        .toString()
        .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
      order["items"] = cart;
      order["status"] = "on-hold";
      dispatch(addToOrderList(order))
        .then(() => {
          dispatch(resetCart());
          navigation.navigate("OnlineOrder");
        })
        .catch((error) => {
          console.error("Error putting order on hold:", error);
        });
    } catch (error) {
      console.error("Error putting order on hold:", error);
    }
  };

  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripeCardForm, setStripeCardForm] = useState();

  const generateStripePaymentIntent = async () => {
    try {
      // Rounded to whole integer number to fix invalid integer error from api
      const response = await axios.post(
        `${POS_STORE_API_URL}/pos-stripe-reader-client-secret`,
        { order_total: totalAmount, payment_identifiers: "card" },
        {
          // const response = await axios.post(`https://phplaravel-1180784-4531756.cloudwaysapps.com/api/stripe-reader-client-secret`, {order_total: totalAmount}, {
          headers: {
            Apitoken: POS_API_TOKEN,
            "X-Tenant": club.post_slug,
          },
        }
      );

      if (response?.data?.status) {
        const clientSecret = response.data.client_secret;
        setStripeClientSecret(clientSecret);
        console.log(`clientSecret: ${clientSecret}`);

        // const { paymentIntent, error } = await retrievePaymentIntent(
        //   clientSecret
        // );

        // if (error) {
        //   console.log(error);
        //   Alert.alert("Error!", `RetrievePaymentIntent: ${error.message}`);
        //   setReaderStatusText(`Error: ${error.message}`);
        //   return;
        // }

        // collectReaderPayment(paymentIntent);
      } else if (response?.data?.message) {
        Alert.alert("Error!", `Stripe client secret: ${response.data.message}`);
        // setReaderStatusText(`Error: ${response.data.message}`);
      } else {
        Alert.alert(
          "Error!",
          `Stripe client secret: unable to process your request at the moment.`
        );
        // setReaderStatusText(
        //   `Error: unable to process your request at the moment.`
        // );
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        Alert.alert(
          "Error!",
          `Stripe client secret: ${error.response.data.message}`
        );
      } else {
        Alert.alert("Error!", `Stripe client secret: ${error.toString()}`);
      }
      setReaderStatusText("Error: " + error.toString());
    }
  };

  const generateReaderPaymentIntent = async () => {
    try {
      // Rounded to whole integer number to fix invalid integer error from api
      const response = await axios.post(
        `${POS_STORE_API_URL}/pos-stripe-reader-client-secret`,
        { order_total: totalAmount, payment_identifiers: "terminal" },
        {
          // const response = await axios.post(`https://phplaravel-1180784-4531756.cloudwaysapps.com/api/stripe-reader-client-secret`, {order_total: totalAmount}, {
          headers: {
            Apitoken: POS_API_TOKEN,
            "X-Tenant": club.post_slug,
          },
        }
      );

      if (response?.data?.status) {
        const clientSecret = response.data.client_secret;

        console.log(`clientSecret: ${clientSecret}`);

        const { paymentIntent, error } = await retrievePaymentIntent(
          clientSecret
        );

        if (error) {
          console.log(error);
          Alert.alert("Error!", `RetrievePaymentIntent: ${error.message}`);
          setReaderStatusText(`Error: ${error.message}`);
          return;
        }

        collectReaderPayment(paymentIntent);
      } else if (response?.data?.message) {
        Alert.alert("Error!", `Reader client secret: ${response.data.message}`);
        setReaderStatusText(`Error: ${response.data.message}`);
      } else {
        Alert.alert(
          "Error!",
          `Reader client secret: unable to process your request at the moment.`
        );
        setReaderStatusText(
          `Error: unable to process your request at the moment.`
        );
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        Alert.alert(
          "Error!",
          `Reader client secret: ${error.response.data.message}`
        );
      } else {
        Alert.alert("Error!", `Reader client secret: ${error.toString()}`);
      }
      setReaderStatusText("Error: " + error.toString());
    }
  };

  const collectReaderPayment = async (intent) => {
    try {
      const { paymentIntent, error } = await collectPaymentMethod({
        paymentIntent: intent,
      });

      if (error) {
        console.log(error);
        Alert.alert("Error!", `Collect PaymentMethod: ${error.message}`);
        setReaderStatusText(`Error: ${error.message}`);
        return;
      }

      setReaderStatusText("Collect Payment.");

      console.log("Collected PaymentIntent: ");
      console.log(paymentIntent);
      confirmReaderPayment(paymentIntent);
    } catch (error) {
      if (error.message) {
        Alert.alert("Error!", `Collect PaymentMethod: ${error.message}`);
        setReaderStatusText(`Error: ${error.message}`);
      } else {
        Alert.alert("Error!", `Collect PaymentMethod: ${error.toString()}`);
        setReaderStatusText(`Error: ${error.toString()}`);
      }
    }
  };

  const confirmReaderPayment = async (intent) => {
    try {
      setReaderStatusText("Processing Payment.");

      const { paymentIntent, error } = await confirmPaymentIntent({
        paymentIntent: intent,
      });

      if (error) {
        Alert.alert("Error!", `ConfirmPaymentIntent: ${error.message}`);
        setReaderStatusText(`Error: ${error.message}`);
        return;
      }

      console.log("confirmedPaymentIntent: ");
      console.log(paymentIntent);
      if (paymentIntent.status == "succeeded")
        setReaderStatusText("Payment Success.");
      handleReaderPay(paymentIntent);
    } catch (error) {
      Alert.alert("Error!", `ConfirmPaymentIntent: ${error.toString()}`);
      setReaderStatusText("Error: " + error.toString());
    }
  };

  const handleReaderPay = async (payment) => {
    try {
      let order = {};

      const d = new Date();
      order["created_at"] = `${d.getFullYear()}-${(
        d.getMonth() +
        1 +
        ""
      ).padStart(2, "0")}-${(d.getDate() + "").padStart(2, "0")} ${d
        .getHours()
        .toString()
        .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
      order["items"] = getCartObj();
      order["order_total"] = totalAmount;
      order["order_subtotal"] = getTotalPrice().subtotal;
      order["order_tax"] = getTotalPrice().tax;
      order["tax"] = `${storeData?.tax}%`;
      order["payment_method"] = "reader";
      order["payment_identifiers"] = "terminal";
      order["payment_details"] = payment;
      order["wpuid"] = userData.user_id;
      console.log("order::", order);

      dispatch(processOrder(order, club))
        .then((response) => {
          if (response?.status === "success") {
            const dateTime = new Date(response?.data?.order_date);
            const formattedDateTime = dateTime
              .toISOString()
              .replace("T", " ")
              .replace(/\.\d+Z$/, "");
            order = {
              ...order,
              status: "success",
              orderId: response?.data?.order_id,
              created_at: formattedDateTime,
            };
            if (typeof route?.params?.orderIndex == "number")
              dispatch(removeOrderFromOrderList(route.params.orderIndex));
            dispatch(addToOrderList(order))
              .then(() => {
                if (typeof route?.params?.orderIndex != "number")
                  dispatch(resetCart());
                navigation.navigate("PaymentSuccess", { order });
              })
              .catch((error) => {
                console.error("Error processing Order:", error);
              });
          } else {
            alert(response);
          }
        })
        .catch((error) => {
          alert(error.toString());
        });
    } catch (error) {
      alert(error.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
        </View>
        <View style={styles.titleRight}>
          <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
            <Text style={styles.titleCancel}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView>
        <View style={styles.totalContainerMain}>
          <View style={styles.totalContainerNew}>
            <Text style={styles.totalTextNew}>
              Total Items:{" "}
              {cart?.reduce((total, item) => total + item.cart_quantity, 0)}
            </Text>
            <Text style={[styles.totalTextNew, styles.totalAmountNew]}>
              ${getTotalPrice().totalDue}
            </Text>
          </View>
        </View>
        <View style={styles.allItems}>
          {/* Display the selected payment type */}
          <View style={styles.paymentTabs}>
            <TouchableOpacity
              style={[
                styles.paymentTab,
                paymentType === "card" && styles.activeTab,
              ]}
              onPress={() => setPaymentType("card")}
            >
              <Image
                source={require("../assets/card-image.png")}
                style={[
                  styles.paymentTabImage,
                  paymentType === "card" && styles.activeTabImg,
                ]}
              />
              <Text
                style={[
                  styles.paymentTabText,
                  paymentType === "card" && styles.activeTabText,
                ]}
              >
                Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentTab,
                paymentType === "cash" && styles.activeTab,
              ]}
              onPress={() => setPaymentType("cash")}
            >
              <Image
                source={require("../assets/cash-image.png")}
                style={[
                  styles.paymentTabImage,
                  paymentType === "cash" && styles.activeTabImg,
                ]}
              />
              <Text
                style={[
                  styles.paymentTabText,
                  paymentType === "cash" && styles.activeTabText,
                ]}
              >
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentTab,
                styles.lastPaymentTab,
                paymentType === "reader" && styles.activeTab,
              ]}
              onPress={() => {
                setPaymentType("reader"),
                  setReaderStatusText("Setting Up..."),
                  generateReaderPaymentIntent();
              }}
            >
              <Image
                source={require("../assets/reader.png")}
                style={[
                  styles.paymentTabImage,
                  paymentType === "reader" && styles.activeTabImg,
                ]}
              />
              <Text
                style={[
                  styles.paymentTabText,
                  paymentType === "reader" && styles.activeTabText,
                ]}
              >
                Reader
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card type selection row within the card tab, after added stripe package we don't need this */}
          {paymentType === "card---disablenow" && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardTypeScrollContainer}
            >
              <TouchableOpacity
                style={[
                  styles.cardType,
                  selectedCardType === "mastercard" && styles.activeCardType,
                ]}
                onPress={() => setSelectedCardType("mastercard")}
              >
                <Image
                  source={require("../assets/master-card.png")}
                  style={styles.cardTypeImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cardType,
                  selectedCardType === "visa" && styles.activeCardType,
                ]}
                onPress={() => setSelectedCardType("visa")}
              >
                <Image
                  source={require("../assets/visa-card.png")}
                  style={styles.cardTypeImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cardType,
                  selectedCardType === "american" && styles.activeCardType,
                ]}
                onPress={() => setSelectedCardType("american")}
              >
                <Image
                  source={require("../assets/american-card.png")}
                  style={styles.cardTypeImage}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cardType,
                  selectedCardType === "discover" && styles.activeCardType,
                ]}
                onPress={() => setSelectedCardType("discover")}
              >
                <Image
                  source={require("../assets/discover-card.png")}
                  style={styles.cardTypeImage}
                />
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Display form based on the selected payment type */}
          {paymentType === "card" ? (
            <>
              {publishableKey && (
                <StripeProvider publishableKey={publishableKey}>
                  <View style={styles.cardForm}>
                    <CardField
                      postalCodeEnabled={true}
                      style={{ width: "100%", height: 50 }}
                      onCardChange={(card) => {
                        setStripeCardForm(card);
                      }}
                    />
                    {/* <CardForm
                      style={{ width: "100%", height: 180 }}
                      onFormComplete={(values) => {
                        setStripeCardForm({ complete: true, ...values });
                      }}
                      onFormChange={(values) => setStripeCardForm(values)}
                    /> */}
                  </View>
                </StripeProvider>
              )}
            </>
          ) : paymentType === "cash" ? (
            <>
              {/* <ScrollView style={{ ...styles.scView, height: height * 0.72 }}> */}
              <View style={styles.scViewWrap}>
                <View style={styles.cashInstructionsContainer}>
                  <View style={styles.cashInstructionsWrapr}>
                    <View style={styles.mainWrap}>
                      <View style={styles.dueContainer}>
                        <Text style={styles.dueText}> Amount due</Text>
                        <Text style={styles.dueAmount}>
                          ${getTotalPrice().totalDue}
                        </Text>
                      </View>
                      <View style={styles.mainWrapDiv}>
                        <KeyboardAwareScrollView>
                          <View style={styles.headerContainer}>
                            <View style={styles.heading}>
                              <Text style={styles.headerText}>
                                Amount Tendered
                              </Text>
                            </View>
                            <View style={styles.amountField}>
                              <TextInput
                                style={styles.amountInput}
                                placeholder="Amount Tendered"
                                showSoftInputOnFocus={false}
                                value={
                                  amountTendered === "0.00" ||
                                  amountTendered === ""
                                    ? `${storeData?.currency_info?.currency_icon}0.00`
                                    : `$${amountTendered}`
                                }
                                onChangeText={(text) =>
                                  setAmountTendered(
                                    text.replace(/[^0-9.]/g, "")
                                  )
                                }
                              />
                            </View>
                          </View>

                          <View style={styles.amountContainer}>
                            <View style={styles.selectionRow}>
                              {renderSelectionButton("Exact", totalAmount)}
                              {renderSelectionButton("$10.00", "10.00")}
                              {renderSelectionButton("$20.00", "20.00")}
                            </View>
                          </View>

                          <View style={styles.keypadContainer}>
                            <View style={styles.keypadRow}>
                              {[1, 2, 3].map(renderNumericButton)}
                            </View>
                            <View style={styles.keypadRow}>
                              {[4, 5, 6].map(renderNumericButton)}
                            </View>
                            <View style={styles.keypadRow}>
                              {[7, 8, 9].map(renderNumericButton)}
                            </View>
                            <View style={styles.keypadRow}>
                              {[0, "00"].map(renderNumericButton)}
                              {renderClearButton()}
                            </View>
                          </View>
                        </KeyboardAwareScrollView>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              {/* </ScrollView> */}
            </>
          ) : (
            <View style={styles.reader}>
              {connectedReader ? (
                <Text style={styles.readerText}>{readerStatusText}</Text>
              ) : (
                <Text style={styles.readerText}>No Reader Found.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      {paymentType === "cash" && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.holdButton} onPress={holdOrder}>
            <View style={styles.checkoutContent}>
              <Icon
                style={styles.leftIcon}
                name="pause"
                size={24}
                color="#FFF"
              />
              <Text style={styles.holdText}>Hold Order</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.payButton,
              {
                backgroundColor:
                  amountTendered < totalAmount || processingOrder
                    ? "#ddd"
                    : "#00c0ff",
              },
            ]}
            onPress={handleProcessCash}
          >
            <Text style={styles.payButtonText}>Pay for Order</Text>
            <Icon
              style={styles.rightIcon}
              name="chevron-right"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      )}
      {paymentType === "card" && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.holdButton} onPress={holdOrder}>
            <View style={styles.checkoutContent}>
              <Icon
                style={styles.leftIcon}
                name="pause"
                size={24}
                color="#FFF"
              />
              <Text style={styles.holdText}>Hold Order</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!stripeCardForm?.complete || processingOrder) &&
                styles.disabledButton,
            ]}
            onPress={handleCardPay}
            disabled={!stripeCardForm?.complete}
          >
            <Text style={styles.payButtonText}>Pay for Order</Text>
            <Icon
              style={styles.rightIcon}
              name="chevron-right"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      )}
      {/* Cancel Order Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
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
                onPress={handleCancelOrder}
              >
                <Text style={styles.modalButtonText}>CONFIRM CANCELLATION</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL CANCELLATION</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scView: {},
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
    color: "#fff",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#c7c8c7",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#c7c8c7",
  },
  allItems: {
    paddingBottom: 70,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
  },
  totalContainerMain: {
    padding: 15,
  },
  totalContainerNew: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  totalTextNew: {
    paddingHorizontal: 10,
    paddingVertical: 25,
  },
  totalAmountNew: {
    fontWeight: "bold",
  },
  paymentTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#00c0ff",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: "auto",
  },
  processButton: {
    backgroundColor: "#00c0ff",
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3, // For Android shadow
  },
  processButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentTab: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
  },
  lastPaymentTab: {
    marginRight: 0,
  },
  paymentTabImage: {
    width: 40,
    height: 30,
    marginBottom: 5,
    resizeMode: "contain",
    tintColor: "#000",
  },
  activeTab: {
    backgroundColor: "#00c0ff",
  },
  paymentTabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  activeTabText: {
    color: "#fff",
  },
  activeTabImg: {
    tintColor: "#FFF",
  },
  cardTypeScrollContainer: {
    marginBottom: 20,
  },
  cardTypeRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  cardType: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    shadowColor: "#000",
    backgroundColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
    marginRight: 10,
  },
  cardTypeImageContainer: {
    borderWidth: 2, // Added border width
    borderRadius: 6,
    borderColor: "#00c0ff", // Added border color
  },
  cardTypeImage: {
    width: 95,
    height: 50,
    resizeMode: "contain",
  },
  activeCardType: {
    borderColor: "#00c0ff",
  },
  cardForm: {
    backgroundColor: "#fff",
    marginBottom: 20,
    padding: 15,
    borderRadius: 6,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    width: "100%",
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    fontStyle: "normal",
    color: "#515151",
    maxWidth: "100%",
    padding: 15,
  },
  cashInstructionsWrapr: {
    textAlign: "center",
    marginBottom: 20,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 6,
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },
  cashInstructionsContainer: {
    // paddingBottom:80
  },
  radioContainer: {
    textAlign: "left",
    marginBottom: 10,
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 6,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    fontSize: 16,
    color: "#222222",
    textAlign: "center",
    width: "100%",
    fontWeight: "bold",
  },
  radioText: {
    fontSize: 16,
    color: "#222222",
    textAlign: "left",
    width: "100%",
    fontWeight: "bold",
  },
  cashInstructions: {
    fontSize: 16,
    color: "#222222",
    textAlign: "center",
    width: "100%",
    fontWeight: "bold",
  },
  payButton: {
    backgroundColor: "#00c0ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    width: "58%",
    // position: "absolute",
    // bottom: 20,
    // left: 16,
    // right: 16,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3, // For Android shadow
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  rightIcon: {
    marginLeft: 0,
  },
  disabledButton: {
    backgroundColor: "#ccc", // Change color for disabled state
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    backgroundColor: "transparent",
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  receiptMain: {
    padding: 16,
    width: "100%",
  },
  receiptContainer: {
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  receiptItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  price: {
    fontWeight: "bold",
  },
  totalContainer: {
    textAlign: "right",
    paddingTop: 20,
    backgroundColor: "#f7f7f7",
  },
  totalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
    paddingHorizontal: 15,
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 20,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    marginTop: 20,
  },

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
  mainWrap: {
    padding: 15,
    width: "100%",
  },
  mainWrapDiv: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 6,
    width: "100%",
  },
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    color: "#fff",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#c7c8c7",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#c7c8c7",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heading: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountField: {
    flex: 1,
  },
  amountContainer: {
    flex: 1,
    justifyContent: "center",
  },
  amountRow: {
    marginBottom: 20,
  },
  SelectText: {
    color: "#1a8bb0",
    fontSize: screenWidth < 500 ? 14 : 16,
  },
  dueContainer: {
    padding: 15,
  },
  dueText: {
    color: "#A9A9A9",
    textAlign: "center",
    fontSize: 16,
  },
  dueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  exactButtonText: {
    color: "#1a8bb0",
    fontSize: screenWidth < 500 ? 14 : 16,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    color: "#515151",
    padding: 15,
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectionButton: {
    backgroundColor: "#e7effc",
    padding: 20,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  processButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  keypadContainer: {
    flexDirection: "column",
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  keypadButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  keypadButtonText: {
    fontSize: 18,
  },
  checkoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkoutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  holdButton: {
    backgroundColor: "#ff9800", // You can change the color as needed
    borderRadius: 6,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    width: "38%",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3, // For Android shadow
  },
  leftIcon: {
    marginRight: 10,
  },
  holdText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  reader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  readerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CheckoutScreen;
