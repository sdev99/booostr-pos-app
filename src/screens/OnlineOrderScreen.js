
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView, Modal } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';
import BottomBar from './BottomBar';

const OnlineOrderScreen = ({ navigation }) => {
  const [orderedItems, setOrderedItems] = useState([
    { id: 1, name: "Loose Fit Polo shirt", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Johan",date:"01/25/2024" },
    { id: 2, name: "Regular Fit Polo-neck top", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Deep",date:"01/25/2024" },
    { id: 3, name: "Loose Fit Printed T-shirt", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Kesha",date:"01/25/2024" },
    { id: 4, name: "Oversized Fit Long-sleeved mesh top", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Meck",date:"01/25/2024"},
    { id: 5, name: "Regular Fit T-shirt", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Saim",date:"01/25/2024" },
    { id: 6, name: "Slim Fit Waffled polo shirt", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Johan",date:"01/25/2024" },
    { id: 7, name: "Slim Fit Pima cotton T-shirt", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer:  "Doe",date:"01/25/2024"},
    { id: 8, name: "Slim Fit Scuba zip-top polo shirt", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Deep",date:"01/25/2024" },
    { id: 9, name: "Regular Fit Jersey top", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Singh",date:"01/25/2024" },
    { id: 10, name: "Regular Fit Cotton polo shirt", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Mack",date:"01/25/2024", },
    { id: 11, name: "Oversized Fit T-shirt", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Cristy",date:"01/25/2024", },
    { id: 12, name: "Slim Fit Jersey top", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Ap",date:"01/25/2024", },
    { id: 13, name: "3-pack Regular Fit T-shirts", orderId: "ORD001", status: "Pending", price: "$10.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Singh",date:"01/25/2024", },
    { id: 14, name: "Loose Fit Printed T-shirt", orderId: "ORD002", status: "Completed", price: "$15.00", numberOfItems: 2, timing: "12:30 PM",Customer: "Saim",date:"01/25/2024", },
    // Add more items as needed
  ]);

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const renderOrderedItem = ({ item }) => {
    
    return (
      <TouchableOpacity onPress={() => handleItemPress(item)}>
        <View style={styles.orderedItemContainer}>
          <View style={styles.orderedItem}>
           {/* <View style={[styles.imageAndNameContainer, styles.pdBottom]}>
            <Image source={item.image} style={styles.orderedItemImage} />
              <Text style={styles.orderedItemText}>{item.name}</Text>
            </View>*/}
            <Text style={[styles.orderedItemText, styles.pdBottom]}>{item.name}</Text>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>#{item.orderId}</Text>
            <Text style={[styles.orderedItemStatus, styles.pdBottom, { color: item.status === "Completed" ? "green" : "red" }]}>
              {item.status}
            </Text>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>{item.price}</Text>
            <View style={[styles.tmRow,styles.tmRowTop]}>
              <Text style={[styles.orderedItemText, styles.quantText]}>Number of items: {item.numberOfItems}</Text>
              <Text style={styles.orderedItemText}>{item.timing}</Text>
              <Text style={styles.orderedItemText}>{item.date}</Text>
              
            </View>
            <View style={styles.tmRow}>
               <Text style={[styles.CustomerText,styles.pdBottom]}>Customer: {item.Customer}</Text>
               {item.status === "Pending" && (
                <TouchableOpacity onPress={() => setCancelModalVisible(true)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleItemPress = (item) => {
    // Navigate to OrderDetailScreen and pass item details
    navigation.navigate("OrderDetail", { item });
  };
  const handleCancelOrder = () => {
    // Implement logic for canceling the order
    setCancelModalVisible(false); // Close the modal after handling cancel
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
        data={orderedItems.filter((item) => item.status === "Pending")}
        renderItem={renderOrderedItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
  
  const CompletedOrdersScreen = () => (
    <View style={styles.cmMain}>
      <FlatList
        data={orderedItems.filter((item) => item.status === "Completed")}
        renderItem={renderOrderedItem}
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
      <Tab.Navigator tabBar={CustomTabBar}>
        <Tab.Screen name="Pending" component={PendingOrdersScreen} />
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
});

export default OnlineOrderScreen;
