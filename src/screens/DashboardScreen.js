// DashboardScreen.js
import React, { useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
//import { NavigationContainer } from "@react-navigation/native";

import Header from "./Header";
import BottomBar from "./BottomBar";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import { fetchStoreData } from "../store/reducers/storeDetailSlice";
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";
import productPlaceholder from "../assets/product-placeholder.png";
import { memoizedStoreData } from "../store/selectors";

const LatestOrdersScreen = ({ orderedItems }) => {
  const renderOrderedItem = ({ item }) => (
    <View style={styles.orderedItem}>
      <View style={styles.imageAndNameContainer}>
        <Image source={item.image} style={styles.orderedItemImage} />
        <Text style={styles.orderedItemText}>{item.name}</Text>
      </View>
      <Text style={styles.orderedItemText}>#{item.orderId}</Text>
      <Text style={styles.orderedItemStatus}>{item.date}</Text>
      <Text style={styles.orderedItemText}>${item.totalPrice.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      <FlatList
        data={orderedItems}
        renderItem={renderOrderedItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const TopSellingScreen = ({ orderedItems }) => {
  const storeData = useSelector(memoizedStoreData);
  const renderOrderedItem = ({ item }) => (
    <View style={styles.orderedItem}>
      <View style={styles.imageAndNameContainer}>
        <Image source={item?.media?.value ? {uri: item?.media?.value} : productPlaceholder} style={[styles.cartItemImage, {width: 70, aspectRatio: 1 }]} />
        <Text style={styles.orderedItemText}>{item.title}</Text>
      </View>
      <Text style={styles.orderedItemText}>{storeData?.currency_info?.currency_icon}{item?.firstprice?.price.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      <FlatList
        data={orderedItems}
        renderItem={renderOrderedItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [club, setClub] = useState([]);
  const [isClubLoading, setIsClubLoading] = useState(true);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const storeData = useSelector(memoizedStoreData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const club = await AsyncStorage.getItem("club");
        if( club ){
          setClub(JSON.parse(club));
          dispatch(fetchStoreData(JSON.parse(club)));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsClubLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get Store Anylytics
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const club = await AsyncStorage.getItem("club");
          if( JSON.parse(club)?.post_slug ) {
            const response = await axios.post(`${POS_STORE_API_URL}/pos-order-info`,{},{
              headers: {
                'Apitoken': POS_API_TOKEN,
                'X-Tenant': JSON.parse(club).post_slug
              },
            });
            if(response?.data?.result){
              setMetrics([
                { id: 1, name: "Revenue", icon: "cash", totalRev: response?.data?.result?.pos_order_revenue.toFixed(2) },
                { id: 2, name: "Orders", icon: "clipboard-list", totalRev: response?.data?.result?.total_order_count },
                { id: 3, name: "Walk-ins", icon: "walk", totalRev: response?.data?.result?.pos_order_count },
                { id: 4, name: "Online Order", icon: "web", totalRev: response?.data?.result?.website_order_count }
              ]);
            }else if( response?.data?.error && response?.data?.message){
              alert( response.data.message );
            }else{
              alert("kindly try after some time.");
            }
          };
        } catch (error) {
          console.error("Error fetching data:", error);
          // alert("kindly try after some time.");
        }
      };
      
      fetchData();
    }, [])
  );

  // Get Higest Selling Items
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const club = await AsyncStorage.getItem("club");
          if( JSON.parse(club)?.post_slug ) {
            const response = await axios.post(`${POS_STORE_API_URL}/pos-order-list`,{},{
              headers: {
                'Apitoken': POS_API_TOKEN,
                'X-Tenant': JSON.parse(club).post_slug
              },
            });
            if(response?.data?.heighest_sell_terms?.data){
              setTopSellingItems(response.data.heighest_sell_terms.data);
            }else if( response?.data?.error && response?.data?.message){
              alert( response.data.message );
            }else{
              alert("kindly try after some time.");
            }
          };
        } catch (error) {
          // console.error("Error fetching data:", error);
        }
      };
      
      fetchData();
    }, [])
  );

  const [metrics, setMetrics] = useState([
    { id: 1, name: "Revenue", icon: "cash", totalRev: "" },
    { id: 2, name: "Orders", icon: "clipboard-list", totalRev: "" },
    { id: 3, name: "Walk-ins", icon: "walk", totalRev: "" },
    { id: 4, name: "Online Order", icon: "web", totalRev: "" },
  ]);

  const [orderedItems, setOrderedItems] = useState([
    { id: 1, name: "Roadster", orderId: "ORD123", status: "Pending", totalPrice: 10, image: require("../assets/burger_img.png"), date: "23/01/2024" },
    { id: 3, name: "New Item 1", orderId: "ORD125", status: "Pending", totalPrice: 15.99, image: require("../assets/burger_img.png"), date: "23/01/2024" },
    { id: 4, name: "New Item 2", orderId: "ORD126", status: "Top", totalPrice: 20.99, image: require("../assets/burger_img.png"), date: "22/01/2024" },
    { id: 5, name: "New Item 3", orderId: "ORD127", status: "Pending", totalPrice: 25.99, image: require("../assets/burger_img.png"), date: "23/01/2024" },
    { id: 6, name: "New Item 4", orderId: "ORD128", status: "Top", totalPrice: 30.99, image: require("../assets/burger_img.png"), date: "21/01/2024" },
    { id: 7, name: "New Item 5", orderId: "ORD129", status: "Pending", totalPrice: 35.99, image: require("../assets/burger_img.png"), date: "23/01/2024" },
    { id: 8, name: "New Item 6", orderId: "ORD130", status: "Top", totalPrice: 40.99, image: require("../assets/burger_img.png"), date: "20/01/2024" },
    { id: 9, name: "New Item 7", orderId: "ORD131", status: "Pending", totalPrice: 45.99, image: require("../assets/burger_img.png"), date: "23/01/2024" },
    { id: 10, name: "New Item 8", orderId: "ORD132", status: "Top", totalPrice: 50.99, image: require("../assets/burger_img.png"), date: "19/01/2024" },
  ]);

  const calculateMetricItemWidth = (percentage) => {
    const screenWidth = Dimensions.get("window").width;
    const numberOfItems = metrics.length;
    const spacing = 10;
    const totalSpacing = (numberOfItems - 1) * spacing;
    const availableWidth = screenWidth - totalSpacing;
    const itemWidth = (availableWidth / 100) * percentage;
    return itemWidth;
  };

  const handleLogout = () => {
    navigation.navigate("Login");
  };
  
  const renderMetricItem = ({ item }) => {
  const itemWidth = calculateMetricItemWidth(24);

  // Customize background color for "Online Order" metric
  const backgroundColor = item.name === "Online Order" ? "#CCCCCC" : "#FFF";
  const textColor = item.name === "Online Order" ? "#515151" : "#000";

  return (
    <View style={[styles.metricItem, { width: itemWidth, marginRight: 2, marginLeft: 3, backgroundColor }]}>
      <Icon name={item.icon} size={24} color={textColor} />
      <Text style={[styles.metricRev, { color: textColor }]}>{item.name === "Revenue" ? `$${item.totalRev}` : item.totalRev}</Text>
      <Text style={[styles.metricName, { color: textColor }]}>{item.name}</Text>
    </View>
  );
};

  const Tab = createMaterialTopTabNavigator();

  return (
    isClubLoading
    ? <View style={styles.loaderContainer}>
        <View style={styles.loader}>
          <ActivityIndicator size="medium" color="#00c0ff" />
        </View>
      </View>
    : <View style={styles.container}>
        <Header clubName={club.post_title} onLogout={handleLogout} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <View style={styles.MetRow}>
          <FlatList
            data={metrics}
            renderItem={renderMetricItem}
            keyExtractor={(metric) => metric.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#000',
              tabBarIndicatorStyle: {
                backgroundColor: '#00c0ff',
              },
            }}
          >
          <Tab.Screen name="Latest Orders">
            {() => <LatestOrdersScreen orderedItems={orderedItems} />}
          </Tab.Screen>
          <Tab.Screen name="Top Selling">
            {() => <TopSellingScreen orderedItems={topSellingItems} />}
          </Tab.Screen>
        </Tab.Navigator>
        <View style={styles.bottomBar}>
          <BottomBar />
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90,
    position: "relative",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  titleContainer: {
    paddingTop: 15,
  },
 
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    paddingHorizontal: 15,
  },
  metricItem: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
   
  },
  metricName: {
    fontSize: 12,
    marginTop: 5,
    color: "#515151",
  },
  metricRev: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },

  MetRow: {
    padding: 15,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  orderedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 10,
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
    alignSelf: "stretch",
  },
  imageAndNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
  },
  orderedItemImage: {
    flex: 1,
    aspectRatio: 1, // Maintain aspect ratio
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
  orderedItemStatus: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
    marginLeft: 10,
    color: "#515151",
  },
  loaderContainer: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    paddingTop:80,
    paddingBottom:40,
  },
});

export default DashboardScreen;
