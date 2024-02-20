import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, TouchableOpacity, Image, TextInput, Alert, ScrollView, StyleSheet, Modal, Dimensions  } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CheckBox, Button } from 'react-native-elements';
import Header from './Header';
import { memoizedCart } from "../store/selectors";
import { resetCart } from "../store/reducers/cartSlice";
import { processCashOrder } from "../actions/order";
import {CardField, useConfirmPayment} from '@stripe/stripe-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { FontAwesome } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const CheckoutScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const cart = useSelector(memoizedCart);
  const processingOrder = useSelector((state) => state.productList.loading);
  const [cardDetails, setCardDetails] = useState();
  const {confirmPayment, loading} = useConfirmPayment();
  //const { totalAmount } = route?.params || {};
  
  const [paymentType, setPaymentType] = useState("card");
  const [selectedCardType, setSelectedCardType] = useState("mastercard");
  // const [cardDetails, setCardDetails] = useState({
  //   cardholderName: "",
  //   cardNumber: "",
  //   expirationDate: "",
  //   cvc: "",
  // });
  
  const getTotalPrice = () => {
    // Calculate total of all items without tax
    const subtotal = cart?.reduce((total, item) => total + item.max_price*item.cart_quantity, 0);
    
    // Calculate total with 10% tax
    const tax = subtotal * 0.06;
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
  //const [saveCardInfo, setSaveCardInfo] = useState(false);
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
    if( !cardDetails?.complete ){
      alert("Please enter complete card details.");
      return;
    }
    // if (paymentType === "card") {
    //   // Implement logic to process card payment
    //   if (validateCardDetails()) {
    //     // Proceed with payment
    //     // Navigate to PaymentSuccessScreen on successful payment
    //     navigation.navigate("PaymentSuccess");
    //   } else {
    //     Alert.alert("Invalid Card Details", "Please check your card information and try again.");
    //   }
    // } else if (paymentType === "cash") {
    //   navigation.navigate("CashScreen", { totalAmount }); // Pass totalAmount to CashScreen
    // }
  };

  // const validateCardDetails = () => {
  //   // Implement validation logic for card details
  //   // Return true if card details are valid, false otherwise
  //   // You may want to implement more sophisticated validation
  //   return cardDetails.cardholderName && cardDetails.cardNumber && cardDetails.expirationDate && cardDetails.cvv;
  // };

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
        order['tax'] = '6%';
        order['payment_method'] = 'cash';
        order['payment_details']= {'tendered_amount':tenderedAmount};
        order['club_name']= club?.post_title;
        dispatch(processCashOrder(order))
        .then((response) => {
          if( response==='success' ){
            navigation.navigate("CashReceipt", { order });
          }else{
            alert(response);
          }
        })
        .catch((error) => {
          alert('dsdsdsds'+error.toString());
        });
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
      <View style={styles.totalContainerMain}>
        <View style={styles.totalContainerNew}>
          {/* <Text style={styles.totalTextNew}>
            Order: #ORD123
          </Text> */}
          <Text style={styles.totalTextNew}>
           Total Items: {cart.reduce((total, item) => total + item.cart_quantity, 0)}
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
            style={[styles.paymentTab, paymentType === "stripe-reader" && styles.activeTab]}
            onPress={() => setPaymentType("stripe-reader")}
          >
            <Image source={require("../assets/card-image.png")} style={[styles.paymentTabImage, paymentType === "stripe-reader" && styles.activeTabImg]} />
            <Text style={[styles.paymentTabText, paymentType === "stripe-reader" && styles.activeTabText]}>Stripe Reader</Text>
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
        {/* {paymentType === "card" && (
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
        )} */}
        <ScrollView style={{ ...styles.scView, height: height * 0.62 }}>
          <View style={styles.scViewWrap}>
        {/* Display form based on the selected payment type */}
        {paymentType === "card" ? (
          <View style={styles.cardForm}>
            {/* <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardholderName: text })}
              value={cardDetails.cardholderName}
            /> */}
            <CardField
              postalCodeEnabled={false}
              placeholders={'Card Number'}
              cardStyle={styles.card}
              style={styles.cardContainer}
              onCardChange={cardDetails => {setCardDetails(cardDetails)}}
            />
            {/* <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Card Number"
                onChangeText={(text) => setCardDetails({ ...cardDetails, cardNumber: text })}
                value={cardDetails.cardNumber}
              />
            </View>
            <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Expiration Date (MM/YY)"
                  onChangeText={(text) => setCardDetails({ ...cardDetails, expirationDate: text })}
                  value={cardDetails.expirationDate}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft:5 }]}
                  placeholder="CVV"
                  onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                  value={cardDetails.cvv}
                />
            </View> */}
            {/*<View style={styles.checkboxContainer}>
              <CheckBox
                title="Save Credit Card Information"
                checked={saveCardInfo}
                onPress={() => setSaveCardInfo(!saveCardInfo)}
                containerStyle={styles.checkbox}
              />
            </View>*/}
          </View>
        ) : paymentType === "stripe-reader" ? (
          <View style={styles.cardForm}>
            <Text>Waiting...</Text>
          </View>
        ) : (
          <View style={styles.cashInstructionsContainer}>
             {/*<View style={styles.radioContainer}>
                <CheckBox
                  title="Cash on Delivery (COD)"
                  checked={radioSelected}
                  onPress={() => setRadioSelected(!radioSelected)}
                  containerStyle={styles.checkbox}
                  textStyle={styles.radioText}
                />
              </View>*/}
              <View style={styles.cashInstructionsWrapr}>
              {/* <View style={styles.iconContainer}>
               <FontAwesome name="money" size={30} color="#fff" />
              </View>
              <Text style={styles.cashInstructions}>Cash on Delivery: Prepare cash for payment upon delivery.</Text> */}
             
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
          
        )}
        </View>
        </ScrollView>
      </View>
      {paymentType === "card" && (
      <TouchableOpacity
        style={[styles.payButton, loading && styles.disabledButton]}
        onPress={handlePay}
        disabled={loading}
      >
        <Text style={styles.payButtonText}>Pay</Text>
        <Icon style={styles.rightIcon} name="chevron-right" size={24} color="#FFF" />
      </TouchableOpacity>
    )}
     {paymentType === "cash" && (
        <TouchableOpacity
        style={[
          styles.processButton,
          { backgroundColor: amountTendered < totalAmount ? "#ddd" : "#00c0ff" }, // Gray if less, blue otherwise
        ]}
        onPress={handleProcessCash}
      >
        <Text style={styles.processButtonText}>{ processingOrder ? 'PROCESSING' : 'PROCESS'}</Text>
      </TouchableOpacity>
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
    fontSize:16
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
    fontSize:16
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
  card: {
    backgroundColor: "#e7effc",
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
  },
  cardContainer: {
    height: 50,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "400",
    fontStyle: "normal",
    color: "#515151",
  }
});

export default CheckoutScreen;
