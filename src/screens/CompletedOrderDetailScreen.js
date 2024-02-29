import React from 'react';
import { useSelector } from "react-redux";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';
import BottomBar from './BottomBar';
import { memoizedStoreData } from "../store/selectors";
import productPlaceholder from "../assets/product-placeholder.png";


const CompletedOrderDetailScreen = ({ route, navigation }) => {
  const storeData = useSelector(memoizedStoreData);
  const order = route.params?.order;

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Order #{order.invoice_no}</Text>
        </View>
      </View>
      <View style={styles.itemsMain}>
        <View style={styles.itemsMainWrap}>
          <FlatList
            data={order?.orderitems}
            keyExtractor={(item) => item?.term_id}
            renderItem={({ item, index }) => (
              <View style={styles.cartItem}>
                <Image source={item?.term?.media?.value ? {uri: item?.term?.media?.value} : productPlaceholder} style={styles.cartItemImage} />
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName}>{item?.term?.title}</Text>
                  <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>{item?.qty}</Text>
                  </View>
                </View>
                <View style={styles.cartItemPriceContainer}>
                  <Text style={styles.cartItemPrice}> {storeData?.currency_info?.currency_icon}{(item?.amount).toFixed(2)}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </View>
      <View style={styles.bottomBar}>
        <BottomBar />
      </View>
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

export default CompletedOrderDetailScreen;
