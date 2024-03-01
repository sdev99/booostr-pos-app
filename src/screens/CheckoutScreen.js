import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, TouchableOpacity, Image, TextInput, Alert, ScrollView, StyleSheet, Modal, Dimensions  } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CheckBox, Button } from 'react-native-elements';
import Header from './Header';
import { memoizedCart, memoizedStoreData, memoizedUserData, memoizedOrderList } from "../store/selectors";
import { resetCart } from "../store/reducers/cartSlice";
// import { processCashOrder } from "../actions/order";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { processOrder } from "../actions/order";
import { addToOrderList, removeOrderFromOrderList } from "../store/reducers/orderListSlice";
//import { FontAwesome } from "@expo/vector-icons";

const { height } = Dimensions.get("window");
const screenWidth = Dimensions.get('window').width;

const CheckoutScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const orderList = useSelector(memoizedOrderList);
  const cart = typeof route?.params?.orderIndex == 'number' ? orderList[route.params.orderIndex]?.items : useSelector(memoizedCart);
  const userData = useSelector(memoizedUserData);
  const storeData = useSelector(memoizedStoreData);
  const processingOrder = useSelector((state) => state.productList.loading);
  //const { totalAmount } = route?.params || {};

  const [paymentType, setPaymentType] = useState("card");
  const [selectedCardType, setSelectedCardType] = useState("mastercard");
  const [cardDetails, setCardDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvc: "",
  });
  const [validationStatus, setValidationStatus] = useState({
    cardholderName: false,
    cardNumber: false,
    expirationDate: false,
    cvc: false,
  });

  const formatCardNumber = (inputCardNumber) => {
    const cleanedInput = inputCardNumber.replace(/\D/g, '');
    let formattedCardNumber = '';
    for (let i = 0; i < cleanedInput.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedCardNumber += ' ';
      }
      formattedCardNumber += cleanedInput[i];
    }
    return formattedCardNumber;
  };

  const isValidCardNumber = (inputCardNumber) => {
    const cardNumberWithoutSpaces = inputCardNumber.replace(/\s/g, '');
    return /^\d{16}$/.test(cardNumberWithoutSpaces); // Basic check for 16 digits
  };

  const handleCardNumberChange = (inputCardNumber) => {
    const formattedCardNumber = formatCardNumber(inputCardNumber);
    setCardDetails((prevState) => ({
      ...prevState,
      cardNumber: formattedCardNumber,
    }));
    const isValid = isValidCardNumber(inputCardNumber);
    setValidationStatus((prevState) => ({
      ...prevState,
      cardNumber: isValid,
    }));
  };

  const formatExpirationDate = (inputExpirationDate) => {
    const cleanedInput = inputExpirationDate.replace(/\D/g, '');
    if (cleanedInput.length <= 2) {
      return cleanedInput;
    }
    return `${cleanedInput.slice(0, 2)}/${cleanedInput.slice(2, 4)}`;
  };

  const handleExpirationDateChange = (inputExpirationDate) => {
    const formattedExpirationDate = formatExpirationDate(inputExpirationDate);
    setCardDetails((prevState) => ({
      ...prevState,
      expirationDate: formattedExpirationDate,
    }));
    
    const [month, year] = formattedExpirationDate.split('/');
    const currentDate = new Date();
    const expirationDate = new Date(`20${year}`, month - 1); // Assuming 20 is added to the year (e.g., 20YY)
    const isValidExpirationDate = expirationDate > currentDate;

    setValidationStatus((prevState) => ({
      ...prevState,
      expirationDate: isValidExpirationDate,
    }));
  };
  
  const getTotalPrice = () => {
    // Calculate total of all items without tax
    const subtotal = cart?.reduce((total, item) => total + item.max_price*item.cart_quantity, 0);
    
    // Calculate total with 10% tax
    const tax = subtotal * parseFloat(storeData?.tax) / 100;
    const totalDue = subtotal + tax;
    
    return { subtotal, tax, totalDue };
  };
  
  const totalAmount = getTotalPrice().totalDue;
  const [amountTendered, setAmountTendered] = useState(totalAmount ? totalAmount.toString() : "0");
  
  const [club, setClub] = useState(null);

  // Fetch Club Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const club = await AsyncStorage.getItem("club");
            if( club ){
                setClub(JSON.parse(club));
            }
        } catch (error) {
            console.error("Error fetching club data:", error);
        }
    };

    fetchData();
  }, []);

  const handleKeypadPress = (value) => {
    if (value === "C") {
      setAmountTendered("0");
    } else if (value === "Exact") {
      setAmountTendered(totalAmount ? totalAmount.toString() : "0");
    } else if (!isNaN(value)) {
      setAmountTendered(value); // Set the value directly
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
  const handleNumericButtonPress = (value) => {
    setAmountTendered((prevAmount) => prevAmount === "0" ? value.toString() : prevAmount + value.toString());
  };
  const handleClearPress = () => {
    setAmountTendered("0");
  };
  // const [saveCardInfo, setSaveCardInfo] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  //const [radioSelected, setRadioSelected] = useState(false);
  const receiptItems = [
    { itemName: "FBAR", quantity: 1, price: 11.99 },
    // Add more items as needed
  ];

  const calculateSubtotal = () => {
    return receiptItems.reduce((total, item) => total + item.quantity * item.price, 0);
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


  const handlePay = async () => {
    if (paymentType === "card") {


      if (validateCardDetails()) {
        try{
          let order = {};
          const d = new Date();
          order['created_at'] = `${d.getFullYear()}-${(d.getMonth()+1+'').padStart(2, '0')}-${(d.getDate()+'').padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
          order['items'] = cart;
          order['order_total'] = totalAmount;
          order['order_subtotal'] = getTotalPrice().subtotal;
          order['order_tax'] = getTotalPrice().tax;
          order['tax'] = `${storeData?.tax}%`;
          order['payment_method'] = 'card';
          order['payment_details'] = {'card_details': {...cardDetails, cardNumber: cardDetails.cardNumber.replace(/\s/g,'')}};
          order['wpuid'] = userData.user_id;
          dispatch(processOrder(order, club))
          .then((response) => {
            if( response?.status==='success' ){
              const dateTime = new Date(response?.data?.order_date);
              const formattedDateTime = dateTime.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
              order = {...order, status: 'success', orderId: response?.data?.order_id, created_at: formattedDateTime};
              if( typeof route?.params?.orderIndex == 'number' ) dispatch(removeOrderFromOrderList(route.params.orderIndex));
              dispatch(addToOrderList(order))
              .then(() => {
                  if( typeof route?.params?.orderIndex != 'number' ) dispatch(resetCart());
                  navigation.navigate("PaymentSuccess", { order });
              })
              .catch((error) => {
                  console.error("Error processing Order:", error);
              });
            }else{
              alert(response);
            }
          })
          .catch((error) => {
            alert(error.toString());
          });
        }catch(error){
          alert(error.toString());
        }
      } else {
        alert("Invalid Card Details\nPlease check your card information and try again.");
      }


    } else if (paymentType === "cash") {

      navigation.navigate("CashScreen", { totalAmount }); // Pass totalAmount to CashScreen

    }

  };

  const validateCardDetails = () => {
    return validationStatus.cardholderName && validationStatus.cardNumber && validationStatus.expirationDate && validationStatus.cvc;
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };
  {/*const handleProcess = () => {
    const totalAmount = calculateTotal();
    navigation.navigate("Cash", { totalAmount });
  };*/}
  const handleProcessCash = async () => {
    if( processingOrder ) return;

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
    } else {
      try{
        let order = {};
        const d = new Date();
        order['created_at'] = `${d.getFullYear()}-${(d.getMonth()+1+'').padStart(2, '0')}-${(d.getDate()+'').padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
        order['items'] = cart;
        order['order_total'] = totalAmount;
        order['order_subtotal'] = getTotalPrice().subtotal;
        order['order_tax'] = getTotalPrice().tax;
        order['tax'] = `${storeData?.tax}%`;
        order['payment_method'] = 'cash';
        order['payment_details']= {'tendered_amount':tenderedAmount};
        order['club_name']= club?.post_title;
        order['wpuid'] = userData.user_id;
        dispatch(processOrder(order, club))
        .then((response) => {
          if( response?.status==='success' ){
            const dateTime = new Date(response?.data?.order_id);
            const formattedDateTime = dateTime.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
            order = {...order, status: 'success', orderId: response?.data?.order_id, created_at: formattedDateTime};
            if( typeof route?.params?.orderIndex == 'number' ) dispatch(removeOrderFromOrderList(route.params.orderIndex));
            dispatch(addToOrderList(order))
            .then(() => {
                if( typeof route?.params?.orderIndex != 'number' ) dispatch(resetCart());
                navigation.navigate("PaymentSuccess", { order });
            })
            .catch((error) => {
                console.error("Error processing Order:", error);
            });
          }else{
            alert(response);
          }
        })
        // dispatch(processCashOrder(order))
        // .then((response) => {
        //   if( response==='success' ){
        //     navigation.navigate("CashReceipt", { order });
        //   }else{
        //     alert(response);
        //   }
        // })
        // .catch((error) => {
        //   alert('dsdsdsds'+error.toString());
        // });
      }catch(error){
        alert(error.toString());
      }
    }
  };
  
  
  const handleCancelOrder = async () => {
    try {
      dispatch(resetCart())
      navigation.navigate("Orders");
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };
  const renderSelectionButton = (label, value) => (
    <TouchableOpacity
      key={label}
      style={[styles.selectionButton, label === "Exact" && styles.exactButton]}
      onPress={() => handleKeypadPress(value)}
    >
      <Text style={label === "Exact" ? styles.exactButtonText : styles.SelectText}>{label}</Text>
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
    try {
        let order = {};
        const d = new Date();
        order['created_at'] = `${d.getFullYear()}-${(d.getMonth()+1+'').padStart(2, '0')}-${(d.getDate()+'').padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
        order['items'] = cart;
        order['status'] = 'on-hold';
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

  return (
    <View style={styles.container}>
      <Header  clubName="Hello Tester Club" onLogout={handleLogout} />
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
            Total Items: {cart?.reduce((total, item) => total + item.cart_quantity, 0)}
            </Text>
            <Text style={[styles.totalTextNew, styles.totalAmountNew]}>
              ${getTotalPrice().totalDue.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.allItems}>
          {/* Display the selected payment type */}
          <View style={styles.paymentTabs}>
            <TouchableOpacity
              style={[styles.paymentTab, paymentType === "card" && styles.activeTab]}
              onPress={() => setPaymentType("card")}
            >
              <Image source={require("../assets/card-image.png")} style={[styles.paymentTabImage, paymentType === "card" && styles.activeTabImg]} />
              <Text style={[styles.paymentTabText, paymentType === "card" && styles.activeTabText]}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paymentTab, paymentType === "cash" && styles.activeTab]}
              onPress={() => setPaymentType("cash")}
            >
              <Image source={require("../assets/cash-image.png")} style={[styles.paymentTabImage, paymentType === "cash" && styles.activeTabImg]} />
              <Text style={[styles.paymentTabText, paymentType === "cash" && styles.activeTabText]}>Cash</Text>
            </TouchableOpacity>
          </View>
          
          {/* Card type selection row within the card tab */}
          {paymentType === "card" && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardTypeScrollContainer}>
              <TouchableOpacity
                style={[styles.cardType, selectedCardType === "mastercard" && styles.activeCardType]} onPress={() => setSelectedCardType("mastercard")}>
                <Image source={require("../assets/master-card.png")} style={styles.cardTypeImage} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardType, selectedCardType === "visa" && styles.activeCardType]}
                onPress={() => setSelectedCardType("visa")}
              >
                <Image source={require("../assets/visa-card.png")} style={styles.cardTypeImage} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardType, selectedCardType === "american" && styles.activeCardType]}
                onPress={() => setSelectedCardType("american")}
              >
                <Image source={require("../assets/american-card.png")} style={styles.cardTypeImage} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cardType, selectedCardType === "discover" && styles.activeCardType]}
                onPress={() => setSelectedCardType("discover")}
              >
                <Image source={require("../assets/discover-card.png")} style={styles.cardTypeImage} />
              </TouchableOpacity>
            </ScrollView>
          )}
          
          {/* Display form based on the selected payment type */}
          {paymentType === "card" ? (
            <View style={styles.cardForm}>
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                onChangeText={(text) => {
                  setCardDetails({ ...cardDetails, cardholderName: text });
                  setValidationStatus({ ...validationStatus, cardholderName: text.length > 0 });
                }}
                value={cardDetails.cardholderName}
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Card Number"
                  // onChangeText={(text) => setCardDetails({ ...cardDetails, cardNumber: text })}
                  onChangeText={handleCardNumberChange}
                  value={cardDetails.cardNumber}
                  maxLength={19}
                />
              </View>
              <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Expiration Date (MM/YY)"
                    // onChangeText={(text) => setCardDetails({ ...cardDetails, expirationDate: text })}
                    onChangeText={handleExpirationDateChange}
                    value={cardDetails.expirationDate}
                    keyboardType="numeric"                  
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft:5 }]}
                    placeholder="CVV"
                    onChangeText={(text) => {
                      const cleanedText = text.replace(/\D/g, ''); // Remove non-digit characters
                      setCardDetails({ ...cardDetails, cvc: cleanedText });
                      setValidationStatus({ ...validationStatus, cvc: cleanedText.length === 3 }); // Set cvc validation status based on the length of cleanedText
                    }}
                    value={cardDetails.cvc}
                    keyboardType="numeric"
                    maxLength={3}
                  />
              </View>
            </View>
          ) : (
            <ScrollView style={{ ...styles.scView, height: height * 0.72 }}>
              <View style={styles.scViewWrap}>
                <View style={styles.cashInstructionsContainer}>
                    <View style={styles.cashInstructionsWrapr}>
                  
                  <View style={styles.mainWrap}>
                      <View style={styles.dueContainer}>
                        <Text style={styles.dueText}> Amount due</Text>
                        <Text style={styles.dueAmount}>${getTotalPrice().totalDue.toFixed(2)}</Text>
                      </View>
                      <View style={styles.mainWrapDiv}>
                        
                        <KeyboardAwareScrollView>
                        
                          <View style={styles.headerContainer}>
                            <View style={styles.heading}>
                              <Text style={styles.headerText}>Amount Tendered</Text>
                            </View>
                            <View style={styles.amountField}>
                            <TextInput
                              style={styles.amountInput}
                              placeholder="Amount Tendered"
                              keyboardType="numeric"
                              value={amountTendered === "0" ? `$${totalAmount}` : amountTendered === '' ? `$0` : `$${parseFloat(amountTendered)}`}
                              onChangeText={(text) => setAmountTendered(text.replace(/[^0-9.]/g, ""))}
                            />
                            </View>
                          </View>

                          <View style={styles.amountContainer}>
                            <View style={styles.selectionRow}>
                              {renderSelectionButton("Exact", "Exact")}
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
            </ScrollView>
            
          )}
          
        </View>
        {paymentType === "cash" && (
          <View style={styles.checkoutContainer}>
            <TouchableOpacity style={styles.holdButton} onPress={holdOrder}>
              <View style={styles.checkoutContent}>
                <Icon style={styles.leftIcon} name="pause" size={24} color="#FFF" />
                <Text style={styles.holdText}>Hold Order</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: amountTendered < totalAmount ? "#ddd" : "#00c0ff" }]}
              onPress={handleProcessCash}
            >
              <Text style={styles.payButtonText}>Pay for Order</Text>
              <Icon style={styles.rightIcon} name="chevron-right" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {paymentType === "card" && (
        
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.holdButton} onPress={holdOrder}>
            <View style={styles.checkoutContent}>
              <Icon style={styles.leftIcon} name="pause" size={24} color="#FFF" />
              <Text style={styles.holdText}>Hold Order</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.payButton, !validateCardDetails() && styles.disabledButton]}
            onPress={handlePay}
            disabled={!validateCardDetails()}
          >
            <Text style={styles.payButtonText}>Pay</Text>
            <Icon style={styles.rightIcon} name="chevron-right" size={24} color="#FFF" />
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
              You have chosen to CANCEL an order in progress. If you wish to CANCEL this current order, please click CONFIRM CANCELLATION below. If you chose this by error, please click CANCEL CANCELLATION.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleCancelOrder}>
                <Text style={styles.modalButtonText}>CONFIRM CANCELLATION</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setCancelModalVisible(false)}>
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
    justifyContent:'space-between',
  },
  scView:{
  },
  titleLeft:{
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft:10,
  },
  titleCancel:{
    color: "#fff",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#c7c8c7",
    paddingHorizontal:10,
    paddingVertical:10,
    borderRadius: 5,
    backgroundColor:'#c7c8c7',
  },
  allItems: {
    paddingBottom: 70,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    
  },
  totalContainerMain:{
    padding:15,
  },
  totalContainerNew:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap:'wrap',
    width:"100%",
    backgroundColor:"#fff",
    borderRadius:6,
    marginTop:10,
    paddingHorizontal:10
  },
  totalTextNew:{
    paddingHorizontal:10,
    paddingVertical:25
  },
  totalAmountNew:{
    fontWeight:"bold"
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
    marginHorizontal:'auto',
  },
  processButton: {
    backgroundColor: '#00c0ff',
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentTab: {
    flex: 1,
    padding: 15,
    marginRight: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
  },
  paymentTabImage: {
    width: 40,
    height: 30,
    marginBottom: 5,
    resizeMode: 'contain',
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
    paddingTop:20,
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
  cashInstructionsWrapr:{
    textAlign:'center',
    marginBottom: 20,  
    width: '100%', 
    backgroundColor:'#fff',
    borderRadius:6,
    justifyContent:'center',
    flexDirection:'column',
    alignItems:'center',
  },
  cashInstructionsContainer:{
    paddingBottom:80
  },
  radioContainer: {
    textAlign:'left',
    marginBottom: 10,  
    width: '100%', 
    padding:20,
    backgroundColor:'#fff',
    borderRadius:6,
    justifyContent: 'flex-start',
    flexDirection:'row',
    alignItems:'center',
    fontSize: 16,
    color: "#222222",
    textAlign: 'center',
    width: '100%', 
    fontWeight:'bold'
  
  },
  radioText: {
    fontSize: 16,
    color: "#222222",
    textAlign: 'left',
    width: '100%', 
    fontWeight:'bold'
  },
  cashInstructions: {
    fontSize: 16,
    color: "#222222",
    textAlign: 'center',
    width: '100%', 
    fontWeight:'bold'
  },
  payButton: {
    backgroundColor: "#00c0ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    width:"58%",
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
    paddingVertical:15,
  },
  price: {
    fontWeight: "bold",
  },
  totalContainer: {
    textAlign: "right",
    paddingTop: 20,
    backgroundColor:'#f7f7f7'
  },
  totalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
    paddingHorizontal:15,
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
    maxWidth:500,
    marginHorizontal:'auto',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign:'center',
    color:'#777',
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
  confirmButton:{
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
  mainWrap:{
    padding:15,
    width:'100%',
    
  },
  mainWrapDiv:{
    backgroundColor:'#fff',
    padding:15,
    borderRadius:6,
    width:"100%",


  },
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'space-between',
  },
  titleLeft:{
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft:10,
  },
  
  titleCancel:{
    color: "#fff",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#c7c8c7",
    paddingHorizontal:10,
    paddingVertical:10,
    borderRadius: 5,
    backgroundColor:'#c7c8c7',
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
  SelectText:{
    color:'#1a8bb0',
    fontSize: screenWidth < 500 ? 14 : 16
  },
  dueContainer:{
    padding:15,
  },
  dueText:{
    color:"#A9A9A9",
    textAlign:'center',
    fontSize:16,
  },
  dueAmount:{
    fontSize:24,
    fontWeight:'bold',
    textAlign:'center',
  },
  exactButtonText:{
    color:'#1a8bb0',
    fontSize: screenWidth < 500 ? 14 : 16
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
    flex:1,
    borderWidth:1,
    borderColor:"#ddd"
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
    borderBottomWidth:1,
    borderBottomColor:"#ddd",
  },
  keypadButton: {
    flex:1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderWidth:1,
    borderColor:"#ddd",
    borderBottomWidth:0,
    borderTopWidth:0,
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
      padding:20,
      backgroundColor:"#fff",
      borderTopWidth: 1,
      borderTopColor: "#ddd",
  },
  holdButton: {
      backgroundColor: "#ff9800", // You can change the color as needed
      borderRadius: 6,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:'center',
      shadowColor: "#000",
      width:"38%",
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
});

export default CheckoutScreen;
