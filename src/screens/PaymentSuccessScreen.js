import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,ScrollView , Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';

const PaymentSuccessScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false); // New state variable
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

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
  

  const handlePrintReceipt = () => {
    // Implement logic for printing receipt
    // You can use libraries or device APIs for printing
  };

  const handleEmailReceipt = () => {
    setModalVisible(true);
  };

  const handleAddContact = () => {
    // Implement logic for adding contact to the club's Contact Manager
    // You can use APIs or perform the necessary actions here
    // After adding the contact, you can show the success message and close the modal
    setModalVisible(false);
    setSuccessMessageVisible(true);
  };

  const handleLogout = () => {
    // Implement logic for logging out
    // You can navigate to the login screen or perform other actions
  };
  const handleOrderComplete = () => {
    navigation.navigate("Dashboard");
  };

  return (
    <View   style={styles.container}>
      
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="check" size={50} color="#fff" />
          </View>
          <Text style={styles.title}>Payment Successful</Text>
        </View>
        <ScrollView style={styles.scrollMain}>
          <View style={styles.emailReceiptMain}>
          {/* <View style={styles.thankYouContainer}>
              <Text style={styles.thankYouText}>
                Thank you for your purchase from Hello Tester Club. We have included your order receipt details below for your records. We really appreciate the support!
              </Text>
            </View>
            <View style={styles.receiptDetailsContainer}>
              <Text>
                 <Text style={styles.receiptBold} >Receipt #:</Text> ORD123</Text>
              <Text><Text style={styles.receiptBold} >Date Purchased:</Text> 02/02/2024</Text>
            </View>
            <View style={styles.paymentIMian}>
              <View style={styles.billingEmailContainer}>
                <Text style={styles.billingEmailLabel}>Billing Email:</Text>
                <Text>rodgedodgeboosters@gmail.com</Text>
              </View>
              <View style={styles.paymentInfoContainer}>
                <View>
                  <Text style={styles.paymentInfoLabel}>Payment Information:</Text>
                  <Text>Status: Authorized</Text>
                  <Text>Card: xxxxxxxxxxxx4423</Text>
                  <Text>Name: Matthew Smithies</Text>
                  <Text>Amount: $13.19</Text>
                </View>
              </View>
            </View>*/}
            <View style={styles.receiptMain}>
              <View style={styles.receiptContainer}>
                {/* Receipt headings */}
                <View style={styles.receiptHeading}>
                  <Text style={[styles.headingText, styles.headingFirst]}>Product</Text>
                  <Text style={styles.headingText}>Price</Text>
                  <Text style={styles.headingText}>Qty</Text>
                  <Text style={[styles.headingText, styles.headingLast]}>Total</Text>
                </View>

                {/* Receipt items */}
                {receiptItems.map((item, index) => (
                  <View key={index} style={styles.receiptItem}>
                    <Text style={[styles.testHd, styles.headingFirst]}>{item.itemName}</Text>
                    <Text style={styles.testHd}>{`$${item.price}`}</Text>
                    <Text style={styles.testHd}>{item.quantity}</Text>
                    <Text style={[ styles.testHd, styles.price]}>{`$${item.quantity * item.price}`}.00</Text>
                  </View>
                ))}

                {/* Subtotal, GST, and Total */}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Sub total:  ${calculateSubtotal().toFixed(2)}</Text>
                  <Text style={styles.totalText}>Tax (10%):  ${calculateGST().toFixed(2)}</Text>
                  <Text style={[styles.totalText, styles.totalAmount]}>Total: ${calculateTotal().toFixed(2)}</Text>
                </View>
              </View>
            </View>

           {/* <View style={styles.additionalRowContainer}>
              <Text style={styles.additionalRowText}>
                If you have questions about your purchase, please don't hesitate to reach out.
                You will receive an email confirmation once your order has shipped. 
              </Text>
              <Text style={styles.additionalRowText}>Thank you,</Text>
              <Text style={styles.additionalRowName}>Hello Tester Club</Text>
              <Text style={styles.additionalRowLink} onPress={() => alert("Visit our profile link clicked!")}>
                 visit our profile
              </Text>
            </View>
            <View style={styles.poweredByMain}>
              <View style={styles.poweredByContainer}>
                <View style={styles.logoContainer}>
                  <Text style={styles.poweredByText}>Powered By</Text>
                  <Image source={require("../assets/logo.png")} style={styles.logoImage} />
                </View>
                <View style={styles.TextMainCont}>
                  <Text style={styles.clubNameText}>Hello tester Club</Text>
                  <Text style={styles.clubNameText}>
                    utilizes Booostr to help them manage their organization, communicate with their team and supporters, and raise money online. Learn more here.
                  </Text>
                </View>
                
              </View>
            </View>*/}
          </View> 
      </ScrollView >


      {/* Buttons for printing, emailing, or skipping the receipt */}
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
            <TouchableOpacity style={styles.modalButton} onPress={handleAddContact}>
              <Text style={styles.modalButtonText}>Add Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Message */}
      {successMessageVisible && (
        <View style={styles.successMessageContainer}>
          <Text style={styles.successMessageText}>Receipt emailed successfully!</Text>
        </View>
      )}
      <TouchableOpacity style={styles.orderCompleteButton} onPress={handleOrderComplete}>
        <Text style={styles.orderCompleteButtonText}>ORDER COMPLETE</Text>
      </TouchableOpacity>
      
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:90
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
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  iconContainer: {
    backgroundColor: "#00c0ff",
    borderRadius: 50,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  receiptContainer: {
    borderRadius: 10,
    backgroundColor: "#fff",
    width: "100%",
  },
  scrollMain:{
    padding:15,
    
  },
  emailReceiptMain:{
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingBottom:15
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
    textAlign:'left'
  },
  headingLast:{
    textAlign:'right'
  },
  modalSmall:{
    color:'#777',
    marginBottom:15,
  },
  receiptMain: {
    padding: 16,
    width: "100%",
    paddingBottom:0
  },
  receiptItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  price: {
    fontWeight: "bold",
    textAlign:'right',
  },
  testHd:{
    width:"25%",
    textAlign:'center'
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
  thankYouContainer: {
    borderRadius: 5,
    textAlign: "center",
    borderBottomColor:'#ddd',
    borderBottomWidth:1,
    paddingHorizontal:15,
    paddingVertical:30,
  },
  
  thankYouText: {
    color: "#333",
    fontSize: 16,
  },
  
  receiptDetailsContainer: {
    padding: 15,
    borderRadius: 5,
    borderBottomColor:'#ddd',
    borderBottomWidth:1,
  },
  billingEmailContainer: {
    padding: 15,
  },
  paymentIMian:{
    flexDirection:'row',
    justifyContent: "space-between",
    borderBottomColor:'#ddd',
    borderBottomWidth:1,
  },
  billingEmailLabel: {
    fontWeight: "bold",
  },
  receiptBold:{
    fontWeight: "bold",
  },
  
  paymentInfoContainer: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  paymentInfoLabel: {
    fontWeight: "bold",
  },
  additionalRowContainer: {
    marginBottom: 20,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    padding:15
  },
  
  additionalRowText: {
    marginBottom: 10,
    color: "#333",
  },
  additionalRowName:{
    color: "#333",
  },
  
  additionalRowLink: {
    color: "#00c0ff",
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
  poweredByContainer: {
    backgroundColor: "#00c0ff",
    padding: 20,
    borderRadius: 5,
    marginTop: 20,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  
  logoContainer: {
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    width:"20%"
  },
  TextMainCont:{
    width:"80%",
    paddingHorizontal:10,
  },
  
  logoImage: {
    width: 80,
    objectFit:'contain',
    marginHorizontal:'auto',
    height:40
  },
  
  poweredByText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  clubNameText: {
    color: "#fff",
  },
});

export default PaymentSuccessScreen;
