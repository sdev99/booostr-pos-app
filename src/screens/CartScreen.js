import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import Header from './Header';

const screenHeight = Dimensions.get('window').height;

const CartScreen = ({ navigation, route }) => {
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);

  // Check if route.params exists and has the 'cart' property
  const cart = route.params?.cart || [];

  const getTotalPrice = () => {
    // Calculate total of all items without tax
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);

    // Calculate total with 10% tax
    const tax = subtotal * 0.1;
    const totalDue = subtotal + tax;

    return { subtotal, tax, totalDue };
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={item.image} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.ButtonRounded}>
            <Icon name="minus" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>1</Text>
          <TouchableOpacity style={styles.ButtonRounded}>
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cartItemPriceContainer} >
        <Text style={styles.taxText}> ${item.price.toFixed(2)}</Text>
       {/* <Text style={styles.taxText}>Tax (10%): ${(item.price * 0.1).toFixed(2)}</Text>
        <Text style={styles.cartItemPrice}>Total Due: ${(item.price + item.price * 0.1).toFixed(2)}</Text>*/}
        <TouchableOpacity onPress={() => handleRemoveFromCart(item)}>
          <Icon name="delete" size={24} color="#2222224d" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleRemoveFromCart = (item) => {
    // Implement logic to remove the item from the cart
    // You can navigate to another screen or perform other actions
  };

  const handleCheckout = () => {
    navigation.navigate("Checkout");
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const handleCancelOrder = () => {
    // Implement logic for canceling the order
    setCancelModalVisible(false); // Close the modal after handling cancel
  };

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
        </View>
        <View style={styles.titleRight}>
          <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
            <Text style={styles.titleCancel}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemWrpa}>
        <View style={styles.totalContainerMain}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              Subtotal: ${getTotalPrice().subtotal.toFixed(2)}
            </Text>
            <Text style={styles.totalText}>
              Tax (10%): ${getTotalPrice().tax.toFixed(2)}
            </Text>
            <Text style={[styles.totalText, styles.totalAmount]}>
              Total Due: ${getTotalPrice().totalDue.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.allItems}>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.totalPrice}>
          Total: ${getTotalPrice().totalDue.toFixed(2)}
        </Text>
        <View style={styles.checkoutContent}>
          <Text style={styles.checkoutText}>Checkout</Text>
          <Icon style={styles.rightIcon} name="chevron-right" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
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
    paddingBottom: 90,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    height: screenHeight * 0.76,
    
  },
  totalContainerMain:{
    padding:15,
  },
  totalContainer:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap:'wrap',
    width:"100%",
    backgroundColor:"#fff",
    borderRadius:6,
    marginTop:10,
  },
  checkoutButton: {
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
  totalPrice: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
  checkoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightIcon: {
    marginLeft: 0,
  },
  taxText:{
    marginBottom:5,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 6,
    margin: 5,
    borderRadius: 6,
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
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 15,
    objectFit: 'contain',
  },
  cartItemDetails: {
    flex: 1,
  },
  totalText:{
    paddingHorizontal:10,
    paddingVertical:25
  },
  totalAmount:{
    fontWeight: "700",
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
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
    alignItems: "flex-end",
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom:5
  },
  ButtonRounded: {
    width: 25,
    height: 25,
    backgroundColor: '#00c0ff',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default CartScreen;
