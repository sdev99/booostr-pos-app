import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';
import BottomBar from './BottomBar';
import { memoizedOrderList } from "../store/selectors";
import productPlaceholder from "../assets/product-placeholder.png";
import { removeOrderFromOrderList, increaseItemInOrder, decreaseItemInOrder, removeItemFromOrder } from "../store/reducers/orderListSlice";
import { openDatabase } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";


const OrderDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const [club, setClub] = useState([]);
  const orderList = useSelector(memoizedOrderList);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const orderIndex = route.params?.orderIndex;
  const db = openDatabase('pos.db');

  const orderDate = orderList[orderIndex]?.created_at;
  const futureDate = new Date(orderDate);
  futureDate.setHours(futureDate.getHours() + 72); // Add 72 hours

  const [timeLeft, setTimeLeft] = useState(futureDate);

  useEffect(() => {
    const fetchClub = async () => {
      const club = await AsyncStorage.getItem("club");
      if( JSON.parse(club)?.post_slug ) {
        setClub(JSON.parse(club));
      }
    }

    fetchClub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);

      if (updatedTimeLeft?.days < 0) {
        clearInterval(interval);
        try {
          db.transaction((tx) => {
            tx.executeSql(
              'DELETE FROM onHoldOrders WHERE createdAt = ? AND club = ?;',
              [orderDate, club.post_slug],
              () => {
                console.log('Row deleted successfully');
                dispatch(removeOrderFromOrderList(orderIndex))
                  .then(() => {
                    navigation.navigate('OnlineOrder');
                  })
                  .catch((error) => {
                    console.error("Error removing order from orderList:", error);
                  });
              },
              (_, error) => {
                console.error('Error deleting row:', error);
              }
            );
          });
        } catch (error) {
          console.error("Error removing item from order:", error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function calculateTimeLeft() {
    const difference = new Date(futureDate) - new Date();
    let total = difference;
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    total -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(total / (1000 * 60 * 60));
    total -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(total / (1000 * 60));
    total -= minutes * (1000 * 60);
    const seconds = Math.floor(total / 1000);

    return { days, hours, minutes, seconds, total };
  }

  const sampleOrderDetails = [
    // { itemId: 1, itemName: 'Loose Fit Polo shirt', quantity: 2, image: require('../assets/burger_img.png') },
    // { itemId: 2, itemName: 'Regular Fit Polo-neck top', quantity: 3, image: require('../assets/burger_img-02.png') },
    // { itemId: 3, itemName: 'Loose Fit Polo shirt', quantity: 1, image: require('../assets/burger_img-03.png') },
    // { itemId: 4, itemName: 'Loose Fit Polo shirt', quantity: 2, image: require('../assets/burger_img-04.png') },
  ];

  const handleDeleteItem = async (itemId) => {
    try {
      if(orderList[orderIndex].items.length === 1){
        dispatch(removeOrderFromOrderList(orderIndex))
        .then(() => {
          navigation.navigate('OnlineOrder');
        })
        .catch((error) => {
            console.error("Error removing order from orderList:", error);
        });
      }else{
        dispatch(removeItemFromOrder(orderIndex, itemId))
        .catch((error) => {
            console.error("Error removing item from order:", error);
        });
      }
    } catch (error) {
        console.error("Error removing item from order:", error);
    }
  };

  const handleCompleteButtonPress = () => {
    // Handle the logic when the Complete button is pressed
    navigation.navigate("Checkout", { orderIndex: orderIndex });
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };
  const handleContinueShopping = () => {
    // Handle logic for Continue Shopping button
   navigation.navigate('Orders');
  };
  const handleIncreaseQuantity = async (itemIndex) => {
    try {
      dispatch(increaseItemInOrder(orderIndex, itemIndex))
      .catch((error) => {
          console.error("Error increasing item quantity:", error);
      });
    } catch (error) {
      console.error("Error increasing item quantity:", error);
    }
  };
  const handleDecreaseQuantity = async (itemIndex) => {
    try {
      dispatch(decreaseItemInOrder(orderIndex, itemIndex))
      .then((itemsCount) => {
        if( itemsCount === 0 ) navigation.navigate('OnlineOrder');
      })
      .catch((error) => {
          console.error("Error decreasing item quantity:", error);
      });
    } catch (error) {
      console.error("Error decreasing item quantity:", error);
    }
  };
  const handleCancelOrder = async () => {
    try {
      console.log(orderDate);
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM onHoldOrders WHERE createdAt = ? AND club = ?;',
          [orderDate, club.post_slug],
          () => {
            console.log('Row deleted successfully');
            dispatch(removeOrderFromOrderList(orderIndex))
            .then(() => {
              navigation.navigate('OnlineOrder');
            })
            .catch((error) => {
                console.error("Error removing order from orderList:", error);
            });
          },
          (_, error) => {
            console.error('Error deleting row:', error);
          }
        );
      });
    } catch (error) {
      console.error("Error removing item from order:", error);
    }
  };

  const getOnHoldOrderId = (order) => {
    return '#OH'+(orderList.indexOf(order)+1).toString().padStart(5,"0");
  }

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Order {getOnHoldOrderId(orderList[orderIndex])}</Text>
        </View>
        <View style={styles.titleRight}>
        <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
          <Text style={styles.titleCancel}>Cancel Order</Text>
        </TouchableOpacity>
        </View>
      </View>
      <View style={styles.titleContainer}>
        { ( timeLeft?.days || timeLeft?.hours || timeLeft?.minutes || timeLeft?.seconds ) && timeLeft?.days >= 0
          ? <Text>Expiry: {timeLeft?.days}d {timeLeft?.hours}h {timeLeft?.minutes}m {timeLeft?.seconds}s</Text>
          : null
        }
      </View>
      <View style={styles.itemsMain}>
        <View style={styles.itemsMainWrap}>
          <FlatList
            data={orderList[orderIndex]?.items}
            keyExtractor={(item) => orderList[orderIndex]?.items.indexOf(item).toString()}
            renderItem={({ item, index }) => (
              <View style={styles.cartItem}>
              <Image source={item?.media?.value ? {uri: item?.media?.value} : productPlaceholder} style={styles.cartItemImage} />
              <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName}>{item.title}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity style={styles.ButtonRounded} onPress={() => handleDecreaseQuantity(index)}>
                    <Icon name="minus" size={20} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item?.cart_quantity}</Text>
                  <TouchableOpacity style={styles.ButtonRounded} onPress={() => handleIncreaseQuantity(index)}>
                    <Icon name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.cartItemPriceContainer}>
                <Text style={styles.cartItemPrice}> ${(item.max_price*item.cart_quantity).toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Icon name="delete" size={24} color="#2222224d" />
                </TouchableOpacity>
              </View>
            </View>
            )}
          />
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.bottomButton}
              onPress={handleContinueShopping}
            >
              <Text style={styles.bottomButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomButton, styles.completeButton]}
              onPress={handleCompleteButtonPress}
              disabled={false} // You can adjust the disabled state based on your logic
            >
              <Text style={[styles.bottomButtonText, styles.completeButtonText]}>Complete Order</Text>
              <Icon name="chevron-right" size={20} color="#fff" style={styles.completeButtonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.bottomBar}>
        <BottomBar />
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
    paddingBottom:80,
    position:'relative'
  },
  
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft:10,
  },
  titleLeft:{
    flexDirection: "row",
    alignItems: "center",
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
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:'space-between',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  itemsMain:{
    flex:1,
    flexDirection:'column',
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 6,
    marginVertical:5,
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
  itemsMainWrap:{
    paddingHorizontal:15,
    flex:1,
    flexDirection:'column',
    paddingBottom:80
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00c0ff',
    borderRadius: 4,
    padding: 15,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  icon: {
    marginLeft: 5,
  },
  disabledButton: {
    backgroundColor: '#c0c0c0', // Use a different color for the disabled state
  },
  deleteButton: {
    marginTop: 10,
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    padding:15,
    backgroundColor:"#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  bottomButton: {
    backgroundColor: '#34c759', // You can use your desired color
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    width:"49%",
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign:'center'
  },
  completeButton: {
    backgroundColor: '#00c0ff',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginRight: 5,
  },
  completeButtonIcon: {
    marginLeft: 5,
    marginTop:2
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
  ButtonRounded: {
    width: 25,
    height: 25,
    backgroundColor: '#00c0ff',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default OrderDetailScreen;
