import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from './Header';
import { sendReceipt } from "../actions/email";
import { memoizedOrderList } from "../store/selectors";

const screenWidth = Dimensions.get('window').width;

const PaymentSuccessScreen = ({ orderTotal, amountTendered, changeDue, navigation, route }) => {
  // const order = route.params.order;
  const dispatch = useDispatch();
  const order = useSelector(memoizedOrderList).slice(-1)[0];

 // const defaultLanguage = 'English';
  //const [selectedLanguage, setSelectedLanguage] = useState('');
  //const [emailReceipt, setEmailReceipt] = useState(false);
 // const [emailAddress, setEmailAddress] = useState('');
 // const [printReceipt, setPrintReceipt] = useState(false);
 // const [showDropdown, setShowDropdown] = useState(false);
 const [modalVisible, setModalVisible] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false); 
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

 // const languages = [
  //  { label: 'English', value: 'English' },
 // ];
 const receiptItems = [
  { itemName: "FBAR", quantity: 1, price: 11.99 },
  
  // Add more items as needed
];
const calculateSubtotal = () => {
  return receiptItems.reduce((total, item) => total + item.quantity * item.price, 0);
};

const calculateGST = () => {
  // Assuming GST is 10% for demonstration purposes
  return calculateSubtotal() * 0.1;
};

const calculateTotal = () => {
  return calculateSubtotal() + calculateGST();
};
const handleSendReceipt = () => {
  let emailOrder = {...order, client_name: firstName, client_email: email};
  dispatch(sendReceipt(emailOrder))
  .then((response) => {
    if (response?.status == "success") {
      setSuccessMessageVisible(true);
    }else{
      alert(`Unable to send email.\n${response}`);
    }
  })
  .catch((error) => {
    alert(`Unable to send email.\n`+error.toString());
  });
  setModalVisible(false);
};

  const handleLogout = () => {
    navigation.navigate('Login');
  };

 {/* const handleCancelOrder = () => {
    // Implement logic for canceling the order
    setCancelModalVisible(false); // Close the modal after handling cancel
  };*/}

 {/*
  const handleLanguageChange = (item) => {
    setSelectedLanguage(item.value);
    setShowDropdown(false);
  };

  const toggleEmailReceipt = () => {
    setEmailReceipt((prevValue) => !prevValue);
  };
 const togglePrintReceipt = () => {
    setPrintReceipt((prevValue) => !prevValue);
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleLanguageChange(item)}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  ); */}

  const handleDonePress = () => {
    // Add logic to handle the "Done" button press
    // For example, you can navigate to another screen or perform any other action
    console.log('Done button pressed');
  };

  const handleOrderComplete = () => {
    navigation.navigate('Dashboard');
  };
  const handlePrintReceipt = () => {
    // Implement logic for printing receipt
    // You can use libraries or device APIs for printing
  };
  const handleEmailReceipt = () => {
    setModalVisible(true);
  };

  const orderTotalValue = orderTotal !== undefined ? parseFloat(orderTotal) : 13.19;
  const amountTenderedValue = amountTendered !== undefined ? parseFloat(amountTendered) : 13.19;
  const changeDueValue = changeDue !== undefined ? parseFloat(changeDue) : 0;
  

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      
      {/* <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>#ORD123</Text>
        </View>
        <View style={styles.titleRight}>
          <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
            <Text style={styles.titleCancel}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      
      <ScrollView style={styles.scrollMain}>
        <View style={styles.containerWrap}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="check" size={50} color="#fff" />
            </View>
            <Text style={styles.title}>Payment Successful</Text>
          </View>

          {order.payment_method === 'cash' && <View style={screenWidth < 500 ? {marginBottom: 20} : [styles.row, styles.dueWrap]}>
              <View style={[styles.dueContainer, screenWidth < 500 && styles.row]}>
                <Text style={styles.dueText}>Order Total</Text>
                <Text style={styles.dueAmount}>${order.order_total.toFixed(2)}</Text>
              </View>
              <View style={[styles.dueContainer, screenWidth < 500 && styles.row]}>
                <Text style={styles.dueText}>Amount Tendered</Text>
                <Text style={styles.dueAmount}>${order.payment_details.tendered_amount.toFixed(2)}</Text>
              </View>
              <View style={[styles.dueContainer, screenWidth < 500 && styles.row]}>
                <Text style={styles.dueText}>Change Due</Text>
                <Text style={[styles.dueAmount, styles.dueChange]}>${(order.payment_details.tendered_amount - order.order_total).toFixed(2)}</Text>
              </View>
            </View>
          }
      
          {/* <ScrollView style={styles.scrollMain}> */}
            <View style={styles.emailReceiptMain}>
          <View style={styles.receiptMain}>
                <View style={styles.receiptContainer}>
                  {/* Receipt headings */}
                  <View style={styles.receiptHeading}>
                    <Text style={[styles.headingText, styles.headingFirst]}>Product</Text>
                    <Text style={styles.headingText}>Price</Text>
                    <Text style={[styles.headingText, {width: "10%"}]}>Qty</Text>
                    <Text style={[styles.headingText, styles.headingLast]}>Total</Text>
                  </View>

                  {/* Receipt items */}
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.receiptItem}>
                      <Text style={[styles.testHd, styles.headingFirst]}>{item.title}</Text>
                      <Text style={styles.testHd}>{`$${item.max_price}`}</Text>
                      <Text style={[styles.testHd, {width: "10%"}]}>{item.cart_quantity}</Text>
                      <Text style={[ styles.testHd, styles.price, {textAlign: "right"}]}>${(item.cart_quantity*item.max_price).toFixed(2)}</Text>
                    </View>
                  ))}

                  {/* Subtotal, GST, and Total */}
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Sub total:  ${order.order_subtotal.toFixed(2)}</Text>
                    <Text style={styles.totalText}>Tax (10%):  ${order.order_tax.toFixed(2)}</Text>
                    <Text style={[styles.totalText, styles.totalAmount]}>Total: ${order.order_total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
              </View>
          {/* </ScrollView > */}
          {/* Buttons for printing, emailing, or skipping the receipt */}
        

          {/*<View style={styles.mainWrapDiv}>
            <View style={styles.row}>
              <Text style={styles.labText}>Receipt Language:</Text>
              <View style={styles.Pos}>
                <TouchableOpacity
                  style={styles.dropdownContainer}
                  onPress={() => setShowDropdown(!showDropdown)}
                >
                  <Text style={styles.dropdownText}>{selectedLanguage || defaultLanguage}</Text>
                  <Icon name="chevron-down" size={20} color="#000" style={styles.icon} />
                </TouchableOpacity>
                {showDropdown && (
                  <FlatList
                    data={languages}
                    renderItem={renderDropdownItem}
                    keyExtractor={(item) => item.value}
                    style={styles.dropdownList}
                  />
                )}
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.labText}>Email Receipt:</Text>
              <Switch value={emailReceipt} onValueChange={toggleEmailReceipt} />
            </View>
            {emailReceipt && (
              <View style={styles.row}>
                <Text style={styles.labText}>Email Address:</Text>
                <Text style={styles.addedEmain}>user@domain.com</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.labText}>Print Receipt:</Text>
              <Switch value={printReceipt} onValueChange={togglePrintReceipt} />
            </View>
          </View>/*}


          <View style={styles.doneButtonContainer}>
            <TouchableOpacity style={styles.orderCompleteButton} onPress={handleOrderComplete}>
              <Text style={styles.orderCompleteButtonText}>ORDER COMPLETE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleDonePress}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            </View>*/}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePrintReceipt}>
            <Text style={styles.buttonText}>Print Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleEmailReceipt}>
            <Text style={styles.buttonText}>Email Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>No Receipt</Text>
          </TouchableOpacity>
        </View>
      {/* Success Message */}
      {successMessageVisible && (
        <View style={styles.successMessageContainer}>
          <Text style={styles.successMessageText}>Receipt emailed successfully!</Text>
        </View>
      )}
      <TouchableOpacity style={styles.orderCompleteButton} onPress={handleOrderComplete}>
        <Text style={styles.orderCompleteButtonText}>ORDER COMPLETE, GO TO DASHBOARD</Text>
      </TouchableOpacity>
      {/* Modal for entering contact details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Email Receipt Information</Text>
            <Text style={styles.modalSmall}>Customer will be added to club contact manager</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              onChangeText={(text) => setFirstName(text)}
              value={firstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleSendReceipt}>
              <Text style={styles.modalButtonText}>Send Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
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
    paddingBottom:90
  },
 row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    
  },
  dueWrap:{
    marginBottom:30,
    alignItems: "stretch"
  },
  icon: {
    position: 'absolute',
    right: 10, // Adjust the right position as needed
    top: '50%', // Center the icon vertically
    transform: [{ translateY: 1 }], // Center the icon vertically
  },
  dueContainer: {
    width: screenWidth < 500 ? "100%" : "33.33%",
    paddingHorizontal:10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  amontContainer:{
    borderLeftWidth:1,
    borderLeftColor:'#ddd',
    borderRightWidth:1,
    borderRightColor:'#ddd',
    
  },

  containerWrap:{

    marginTop:20,
    position:'relative',
    flex:1,
    
  },
  dueText: {
    fontSize: 16,
    color: '#A9A9A9',
    textAlign:'center'
  },
  dueAmount: {
    fontSize: screenWidth < 500 ? 16 : 22,
    fontWeight: 'bold',
    textAlign:'center'
  },
  dueChange:{
    color:"#950101"
  },
 /* Pos: {
    position: 'relative',
    zIndex:99
  },
  labText:{
    fontSize: 16,
  },*/
  addedEmain:{
    fontSize: 16,
    fontWeight:'bold'
  },
  dropdownContainer: {
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    color: "#515151",
    padding: 10,
    width:200
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownList: {
    position: 'absolute',
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 5,
    top: '100%',
    zIndex: 9,
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    color: "#515151",
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,    
  },
  emailInput: {
    height: 40,
    width: 150,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    marginLeft: 10,
    paddingLeft: 10,
  },
  doneButtonContainer: {
    marginTop: 20,
    position:'absolute',
    bottom:15,
    left:15,
    right:15
  },
  doneButton: {
    backgroundColor: "#00c0ff",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalSmall:{
    color:'#777',
    marginBottom:15,
  },
  modalButton: {
    backgroundColor: "#00c0ff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Success Message styles
  successMessageContainer: {
    backgroundColor: "#4CAF50", // Green color (you can customize)
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical:20,
    marginHorizontal:20,
    
  },
  successMessageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  orderCompleteButton: {
    backgroundColor: "#00c0ff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  orderCompleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: screenWidth < 500 ? 13.5 : 16,
  },

  receiptMain: {
    padding: 16,
    width: "100%",
    paddingBottom:0
  },
  scrollMain:{
    padding:15,
  },
  emailReceiptMain:{
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingBottom:15
  },
  receiptContainer: {
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  receiptHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align vertically
    marginBottom: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  
  headingText: {
    fontWeight: "bold",
    fontSize: 16,
    width:'25%',
    textAlign:'center'
  },
  headingFirst:{
    textAlign:'left',
    maxWidth: "40%",
  },
  headingLast:{
    textAlign:'right'
  },
  testHd: {
    textAlign: "center",
    width: "25%"
  },
  receiptItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  price: {
    fontWeight: "bold",
  },
  totalContainer: {
    marginTop: 20,
    textAlign: "right",
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    paddingTop: 20,
  },
  totalText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  totalAmount: {
    fontWeight: "bold",
    fontSize: 18,
    paddingVertical: 20,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#00c0ff",
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 40,
  },
  iconContainer: {
    backgroundColor: "#00c0ff",
    borderRadius: 50,
    padding: 10,
  },
});

export default PaymentSuccessScreen;
