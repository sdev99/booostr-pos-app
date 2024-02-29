import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';
import BottomBar from './BottomBar';
import { memoizedOrderList, memoizedStoreData } from "../store/selectors";
import { removeOrderFromOrderList } from "../store/reducers/orderListSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";

const OnlineOrderScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const orderList = useSelector(memoizedOrderList);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderedItems, setOrderedItems] = useState([
    // { id: 1, name: "Loose Fit Polo shirt", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Johan",date:"01/25/2024" },
    // { id: 2, name: "Regular Fit Polo-neck top", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Deep",date:"01/25/2024" },
    // { id: 3, name: "Loose Fit Printed T-shirt", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Kesha",date:"01/25/2024" },
    // { id: 4, name: "Oversized Fit Long-sleeved mesh top", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Meck",date:"01/25/2024"},
    // { id: 5, name: "Regular Fit T-shirt", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Saim",date:"01/25/2024" },
    // { id: 6, name: "Slim Fit Waffled polo shirt", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Johan",date:"01/25/2024" },
    // { id: 7, name: "Slim Fit Pima cotton T-shirt", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer:  "Doe",date:"01/25/2024"},
    // { id: 8, name: "Slim Fit Scuba zip-top polo shirt", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Deep",date:"01/25/2024" },
    // { id: 9, name: "Regular Fit Jersey top", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Singh",date:"01/25/2024" },
    // { id: 10, name: "Regular Fit Cotton polo shirt", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Mack",date:"01/25/2024", },
    // { id: 11, name: "Oversized Fit T-shirt", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Cristy",date:"01/25/2024", },
    // { id: 12, name: "Slim Fit Jersey top", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Ap",date:"01/25/2024", },
    // { id: 13, name: "3-pack Regular Fit T-shirts", orderId: "ORD001", status: "on-hold", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Singh",date:"01/25/2024", },
    // { id: 14, name: "Loose Fit Printed T-shirt", orderId: "ORD002", status: "completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Saim",date:"01/25/2024", },
    // Add more items as needed
  ]);
  const [isLoadingCompletedOrders, setIsLoadingCompletedOrders] = useState(true);
  const [completedOrders, setCompletedOrders] = useState([]);
  const storeData = useSelector(memoizedStoreData);

  // Get completed orders
  useFocusEffect(
      React.useCallback(() => {
        const fetchData = async () => {
          setIsLoadingCompletedOrders(true);
          try {
            const club = await AsyncStorage.getItem("club");
            if( JSON.parse(club)?.post_slug ) {
              const response = await axios.post(`${POS_STORE_API_URL}/pos-order-list`,{},{
                headers: {
                  'Apitoken': POS_API_TOKEN,
                  'X-Tenant': JSON.parse(club).post_slug
                },
              });
              if(response?.data?.result?.data){
                setCompletedOrders(response.data.result.data);
              }else if( response?.data?.error && response?.data?.message){
                alert( response.data.message );
              }else{
                alert("kindly try after some time.");
              }
            };
          } catch (error) {
            // console.error("Error fetching data:", error);
            alert("kindly try after some time.");
          }
          setIsLoadingCompletedOrders(false);
        };
        
        fetchData();
      }, [])
  );

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const formatedOrderStatus = (status) => {
    switch (status) {
      case 'on-hold':
        status = 'On Hold';
        break;
      case 'completed':
        status = 'Completed';
        break;
      default:
        break;
    }
    return status;
  }

  const getOrderTotalPrice = (items) => {
    return '$' + items?.reduce((total, item) => total + item.max_price*item.cart_quantity, 0).toFixed(2);
  }

  const getOnHoldOrderId = (order) => {
    return '#OH'+(orderList.indexOf(order)+1).toString().padStart(5,"0");
  }

  const getOrderTotalItems = (items) => {
    return items?.reduce((total, item) => total + item.cart_quantity, 0);
  }

  const renderOrderedItem = (order) => {
    return (
      <TouchableOpacity onPress={() => handleItemPress(orderList.indexOf(order))}>
        <View style={styles.orderedItemContainer}>
          <View style={styles.orderedItem}>
           {/* <View style={[styles.imageAndNameContainer, styles.pdBottom]}>
            <Image source={item.image} style={styles.orderedItemImage} />
              <Text style={styles.orderedItemText}>{item.name}</Text>
            </View>*/}
            {/* <Text style={[styles.orderedItemText, styles.pdBottom]}>{item.name}</Text> */}
            <Text style={[styles.orderedItemText, styles.pdBottom]}>{getOnHoldOrderId(order)}</Text>
            <Text style={[styles.orderedItemStatus, styles.pdBottom, { color: order.status === "completed" ? "green" : "red" }]}>
              {formatedOrderStatus(order.status)}
            </Text>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>{getOrderTotalPrice(order.items)}</Text>
            <View style={[styles.tmRow,styles.tmRowTop]}>
              <Text style={[styles.orderedItemText, styles.quantText]}>Number of items: {getOrderTotalItems(order.items)}</Text>
              <Text style={styles.orderedItemText}>{order?.created_at?.substring(11)}</Text>
              <Text style={styles.orderedItemText}>{order?.created_at?.substring(0,10)}</Text>
            </View>
            <View style={[styles.tmRow, order.status === "on-hold" && styles.flexEnd]}>
               {/* <Text style={[styles.CustomerText,styles.pdBottom]}>Customer: {item.Customer}</Text> */}
               {order.status === "on-hold" && (
                <TouchableOpacity onPress={() => {setSelectedOrder(orderList.indexOf(order));setCancelModalVisible(true)}} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getCompletedOrderTotalItems = (items) => {
    return items.reduce((total, item) => total + item.qty, 0);
  }

  const renderCompletedOrderedItem = (order) => {
    return (
      <TouchableOpacity onPress={() => handleCompletedOrderPress(order)}>
        <View style={styles.orderedItemContainer}>
          <View style={styles.orderedItem}>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>#{order.invoice_no}</Text>
            <Text style={[styles.orderedItemStatus, styles.pdBottom, { color: "green" }]}>
              Completed
            </Text>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>{storeData?.currency_info?.currency_icon}{order.total}</Text>
            <View style={[styles.tmRow,styles.tmRowTop]}>
              <Text style={[styles.orderedItemText, styles.quantText]}>Number of items: {getCompletedOrderTotalItems(order.orderitems)}</Text>
              <Text style={styles.orderedItemText}>{order?.created_at?.substring(11,19)}</Text>
              <Text style={styles.orderedItemText}>{order?.created_at?.substring(0,10)}</Text>
            </View>
            <View style={[styles.tmRow, order.status === "on-hold" && styles.flexEnd]}>
               {/* <Text style={[styles.CustomerText,styles.pdBottom]}>Customer: {item.Customer}</Text> */}
               {order.status === "on-hold" && (
                <TouchableOpacity onPress={() => {setSelectedOrder(orderList.indexOf(order));setCancelModalVisible(true)}} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleCompletedOrderPress = (order) => {
    // Navigate to OrderDetailScreen and pass item details
    navigation.navigate("CompletedOrderDetail", { order: order });
  };

  const handleItemPress = (orderIndex) => {
    // Navigate to OrderDetailScreen and pass item details
    navigation.navigate("OrderDetail", { orderIndex: orderIndex });
  };

  const handleCancelOrder = async () => {
    try {
      dispatch(removeOrderFromOrderList(selectedOrder))
      .then(() => {
          setSelectedOrder(null);
          setCancelModalVisible(false); // Close the modal after handling cancel
      })
      .catch((error) => {
          console.error("Error putting order on hold:", error);
      });
    } catch (error) {
        console.error("Error putting order on hold:", error);
    }
  };
  const Tab = createMaterialTopTabNavigator();
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);

  const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
      <View style={styles.tabM}>
        <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

            return (
                <TouchableOpacity
                key={index}
                style={[styles.tabButton, isFocused ? styles.activeTab : null]}
                onPress={onPress}
                >
                <Text style={[styles.tabButtonText, isFocused ? styles.activeTabText : null]}>
                    {route.name}
                </Text>
                </TouchableOpacity>
            );
            })}
        </View>
      </View>
    );
  };

  const PendingOrdersScreen = () => (
    <View style={styles.pdMain}>
      <FlatList
        data={orderList.filter((item) => item.status === "on-hold")}
        renderItem={({item}) => renderOrderedItem(item)}
        keyExtractor={(item) => orderList.indexOf(item).toString()}
      />
    </View>
  );
  
  const CompletedOrdersScreen = () => (
    isLoadingCompletedOrders
    ? <View style={styles.containerLoaderTop}>
        <ActivityIndicator size="medium" color="#00c0ff" />
      </View>
    : <View style={styles.cmMain}>
        <FlatList
          data={completedOrders}
          renderItem={({item}) => renderCompletedOrderedItem(item)}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
  );

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Order View</Text>
      </View>
      {/* <ScrollView><Text>{JSON.stringify(orderList)}</Text></ScrollView> */}
      <Tab.Navigator tabBar={CustomTabBar}>
        <Tab.Screen name="On Hold" component={PendingOrdersScreen} />
        <Tab.Screen name="Completed" component={CompletedOrdersScreen} />
      </Tab.Navigator>
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
    position: 'relative',
  },
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  tabM:{
    paddingHorizontal:11,
    paddingTop:15,
  },
  cmMain:{
    padding:15,
  },
  pdMain:{
    padding:15,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius:6,
    
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 15,
    width: '49%',
    marginHorizontal:"1%",
  },
  tabButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",

  },
  activeTab: {
    backgroundColor: "#00c0ff",
    
  },
  activeTabText: {
    color: "white",
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  orderedItemContainer: {
    marginVertical: 5,
  },
  tmRow:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap:'wrap',
    width:"100%",
    backgroundColor:"#f1f1f1",
    borderRadius:6,
    marginTop:10,
  },
  tmRowTop:{
    borderRadius:0,
    borderTopColor:'#ddd',
    borderTopWidth:1,
    borderBottomColor:'#ddd',
    borderBottomWidth:1,
    backgroundColor:'none',
  },
  flexEnd: {
    justifyContent: "flex-end",
  },
  quantText:{
    padding:8,
  },
  Customer:{
    textAlign:'right',
    flexDirection: "row",
    justifyContent:'flex-end'
  },
  orderedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap:'wrap',
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    height:'auto',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 0,
  },
  imageAndNameContainer: {
    alignItems: "center",
  },
  pdBottom:{
    paddingVertical:10,
  },
  orderedItemImage: {
    width: "40%",
    height: 80,
    borderRadius: 6,
    marginRight: 5,
  },
  orderedItemText: {
    flex: 1,
    fontSize: 14,
    color: "#515151",
    textAlign: "center",
    marginLeft: 10,
  },
  CustomerText:{
    flex: 1,
    fontSize: 14,
    color: "#515151",
    textAlign: "center",
    marginLeft: 10,
  },
  orderedItemStatus: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 10,
  },
  cancelButton: {
    marginLeft: 10,
    padding:8,
    backgroundColor:'red',
    borderRadius:6,
  },
  
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
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
  containerLoaderTop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40
  },
});

export default OnlineOrderScreen;
