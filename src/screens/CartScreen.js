import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import productPlaceholder from "../assets/product-placeholder.png";
import Header from './Header';
import { memoizedCart, memoizedStoreData } from "../store/selectors";
import { addProductToCart, decreaseProductFromCart, removeProductFromCart, resetCart } from "../store/reducers/cartSlice";
import { addToOrderList } from "../store/reducers/orderListSlice";

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const cart = useSelector(memoizedCart);
  const storeData = useSelector(memoizedStoreData);

  const getTotalPrice = () => {
    // Calculate total of all items without tax
    const subtotal = cart?.reduce((total, item) => total + item.max_price*item.cart_quantity, 0);

    // Calculate total with 10% tax
    const tax = subtotal * parseFloat(storeData?.tax) / 100;
    const totalDue = subtotal + tax;

    return { subtotal, tax, totalDue };
  };

  const handleCheckout = () => {
    navigation.navigate("Checkout");
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const handleCancelOrder = async () => {
    try {
      dispatch(resetCart())
      navigation.navigate("Orders");
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const handleIncreaseQuantity = async (product) => {
    try {
      dispatch(addProductToCart(product))
      .catch((error) => {
          console.error("Error adding product to cart:", error);
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  }

  const handledecreaseQuantity = async (productIndex) => {
    try {
      dispatch(decreaseProductFromCart(productIndex))
      .then((cartLength) => {
        if( cartLength === 0 ) navigation.navigate("Orders");
      })
      .catch((error) => {
          console.error("Error decreasing product from cart:", error);
      });
    } catch (error) {
      console.error("Error decreasing product from cart:", error);
    }
  }

  const handleRemoveFromCart = (productIndex) => {
    try {
      dispatch(removeProductFromCart(productIndex))
      .then(() => {
        if( cart.length === 1 ) navigation.navigate("Orders");
      })
      .catch((error) => {
          console.error("Error removing product from cart:", error);
      });
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };

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

  const renderCartItem = ({ item, index }) => (
    <View style={styles.cartItem}>
      <Image source={item?.media?.value ? {uri: item?.media?.value} : productPlaceholder} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.title}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.ButtonRounded} onPress={() => handledecreaseQuantity(index)}>
            <Icon name="minus" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item?.cart_quantity}</Text>
          <TouchableOpacity style={styles.ButtonRounded} onPress={() => handleIncreaseQuantity(item)}>
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cartItemPriceContainer} >
        <Text style={styles.taxText}> ${(item.max_price*item.cart_quantity).toFixed(2)}</Text>
       {/* <Text style={styles.taxText}>Tax (10%): ${(item.price * 0.1).toFixed(2)}</Text>
        <Text style={styles.cartItemPrice}>Total Due: ${(item.price + item.price * 0.1).toFixed(2)}</Text>*/}
        <TouchableOpacity onPress={() => handleRemoveFromCart(index)}>
          <Icon name="delete" size={24} color="#2222224d" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        {screenWidth < 500
        ? <View style={styles.totalContainerMain}>
            <View style={styles.totalContainer}>
              <View style={styles.totalFlexDirCol}>
                <Text style={[styles.totalText, styles.totalTextTop]}>
                  Subtotal:
                </Text>
                <Text style={[styles.totalText, styles.totalTextbottom]}>
                  ${getTotalPrice().subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalFlexDirCol}>
                <Text style={[styles.totalText, styles.totalTextTop]}>
                  Tax ({storeData?.tax}%):
                </Text>
                <Text style={[styles.totalText, styles.totalTextbottom]}>
                  ${getTotalPrice().tax.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalFlexDirCol}>
                <Text style={[styles.totalText, styles.totalAmount, styles.totalTextTop]}>
                  Total Due:
                </Text>
                <Text style={[styles.totalText, styles.totalAmount, styles.totalTextbottom]}>
                  ${getTotalPrice().totalDue.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        : <View style={styles.totalContainerMain}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>
                Subtotal: ${getTotalPrice().subtotal.toFixed(2)}
              </Text>
              <Text style={styles.totalText}>
                Tax ({storeData?.tax}%): ${getTotalPrice().tax.toFixed(2)}
              </Text>
              <Text style={[styles.totalText, styles.totalAmount]}>
                Total Due: ${getTotalPrice().totalDue.toFixed(2)}
              </Text>
            </View>
          </View>
        }
        <View style={styles.allItems}>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => cart.indexOf(item).toString()}
          />
        </View>
      </View>
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.holdButton} onPress={holdOrder}>
          <View style={styles.checkoutContent}>
            <Icon style={styles.leftIcon} name="pause" size={24} color="#FFF" />
            <Text style={styles.holdText}>Hold Order</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.totalPrice}>
            Total: ${getTotalPrice().totalDue.toFixed(2)}
          </Text>
          <View style={styles.checkoutContent}>
            <Text style={styles.checkoutText}>Checkout</Text>
            <Icon
              style={styles.rightIcon}
              name="chevron-right"
              size={24}
              color="#FFF"
            />
          </View>
        </TouchableOpacity>
      </View>
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
    flexDirection: screenWidth < 500 ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    width:"58%",
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
    paddingVertical: 25,
    textAlign: "center"
  },
  totalTextTop:{
    paddingTop: 25,
    paddingBottom: 5
  },
  totalTextbottom:{
    paddingTop: 5,
    paddingBottom: 25
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
      height: screenWidth < 500 ? "100%" : "auto"
  },
  leftIcon: {
      marginRight: 10,
  },
  holdText: {
      color: "#FFF",
      fontSize: 14,
      fontWeight: "bold",
  },
  totalFlexDirCol: {
    flexDirection: "column",
    width: "33%"
  }
});

export default CartScreen;
