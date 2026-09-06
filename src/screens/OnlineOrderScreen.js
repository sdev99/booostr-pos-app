import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "./Header";
import BottomBar from "./BottomBar";
import { memoizedOrderList, memoizedStoreData } from "../store/selectors";
import { removeOrderFromOrderList } from "../store/reducers/orderListSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";
import * as SQLite from "expo-sqlite";
import { getItemPrice } from "../api/product";
import CancelOrderConfirmationModal from "./Modal/CancelOrderConfirmationModal";

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
  const [club, setClub] = useState([]);
  const [isLoadingCompletedOrders, setIsLoadingCompletedOrders] =
    useState(true);
  const isLoadingOrderList = useSelector((state) => state.orderList.loading);
  const [completedOrders, setCompletedOrders] = useState([]);
  const storeData = useSelector(memoizedStoreData);
  const db = SQLite.openDatabaseSync("pos.db");
  const [selectedCol, setSelectedCol] = useState("onHold");
  const [completedOrdersErrorMsg, setCompletedOrdersErrorMsg] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Get completed orders with pagination
  const loadMoreOrders = async () => {
    if (loadingMore || !hasMoreData) return;

    try {
      setLoadingMore(true);

      const clubStr = await AsyncStorage.getItem("club");
      const clubData = JSON.parse(clubStr);

      const nextPage = page + 1;

      const response = await axios.post(
        `${POS_STORE_API_URL}/pos-order-list?page=${nextPage}`,
        {},
        {
          headers: {
            Apitoken: POS_API_TOKEN,
            "X-Tenant": clubData.post_slug,
          },
        },
      );

      const newOrders = response?.data?.result?.data || [];
      if (
        response?.data?.result?.current_page >= response?.data?.result?.last_page
      ) {
        setHasMoreData(false);
      }
      console.log("Pagination response:", response?.data?.result);

      if (newOrders.length > 0) {
        setCompletedOrders((prev) => [...prev, ...newOrders]);
        setPage(nextPage);
      }
    } catch (error) {
      console.log("Pagination error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Get completed orders
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        if (completedOrders.length === 0) {
          setIsLoadingCompletedOrders(true);
        }
        try {
          const club = await AsyncStorage.getItem("club");
          if (JSON.parse(club)?.post_slug) {
            setClub(JSON.parse(club));
            setPage(1); // Reset page to 1 when fetching new data
            const response = await axios.post(
              `${POS_STORE_API_URL}/pos-order-list?page=1`,
              {},
              {
                headers: {
                  Apitoken: POS_API_TOKEN,
                  "X-Tenant": JSON.parse(club).post_slug,
                },
              },
            );
            console.log("response?.data?.result?::", response?.data?.result);
            if (response?.data?.result?.data) {
              const newOrders = response.data.result.data;
              setCompletedOrdersErrorMsg("");
              setCompletedOrders((prevOrders) => {
                if (JSON.stringify(prevOrders) === JSON.stringify(newOrders)) {
                  return prevOrders;
                }
                return newOrders;
              });
            } else if (response?.data?.error && response?.data?.message) {
              setCompletedOrdersErrorMsg(response.data.message);
            } else {
              setCompletedOrdersErrorMsg("No orders found");
            }
          }
        } catch (error) {
          // console.error("Error fetching data:", error);
          setCompletedOrdersErrorMsg("No orders found");
        }
        setIsLoadingCompletedOrders(false);
      };

      fetchData();
    }, []),
  );

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const formatedOrderStatus = (status) => {
    switch (status) {
      case "on-hold":
        status = "On Hold";
        break;
      case "completed":
        status = "Completed";
        break;
      default:
        break;
    }
    return status;
  };

  const getOrderTotalPrice = (items) => {
    return (
      "$" +
      items
        ?.reduce(
          (total, item) => total + getItemPrice(item) * item.cart_quantity,
          0,
        )
        .toFixed(2)
    );
  };

  const getOnHoldOrderId = (order) => {
    return "#OH" + (orderList.indexOf(order) + 1).toString().padStart(5, "0");
  };

  const getOrderTotalItems = (items) => {
    return items?.reduce((total, item) => total + item.cart_quantity, 0);
  };

  const renderOrderedItem = (order) => {
    return (
      <TouchableOpacity
        onPress={() => handleItemPress(orderList.indexOf(order))}
      >
        <View style={styles.orderedItemContainer}>
          <View style={styles.orderedItem}>
            {/* <View style={[styles.imageAndNameContainer, styles.pdBottom]}>
            <Image source={item.image} style={styles.orderedItemImage} />
              <Text style={styles.orderedItemText}>{item.name}</Text>
            </View>*/}
            {/* <Text style={[styles.orderedItemText, styles.pdBottom]}>{item.name}</Text> */}
            <Text style={[styles.orderedItemText, styles.pdBottom]}>
              {getOnHoldOrderId(order)}
            </Text>
            <Text
              style={[
                styles.orderedItemStatus,
                styles.pdBottom,
                { color: order.status === "completed" ? "green" : "red" },
              ]}
            >
              {formatedOrderStatus(order.status)}
            </Text>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>
              {getOrderTotalPrice(order.items)}
            </Text>
            <View style={[styles.tmRow, styles.tmRowTop]}>
              <Text style={[styles.orderedItemText, styles.quantText]}>
                Number of items: {getOrderTotalItems(order.items)}
              </Text>
              <Text style={styles.orderedItemText}>
                {order?.created_at?.substring(11)}
              </Text>
              <Text style={styles.orderedItemText}>
                {order?.created_at?.substring(0, 10)}
              </Text>
            </View>
            <View
              style={[
                styles.tmRow,
                order.status === "on-hold" && styles.flexEnd,
              ]}
            >
              {/* <Text style={[styles.CustomerText,styles.pdBottom]}>Customer: {item.Customer}</Text> */}
              {order.status === "on-hold" && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOrder(orderList.indexOf(order));
                    setCancelModalVisible(true);
                  }}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getRefundedAmount = (order) => {
    // Full refund
    if (Number(order?.payment_status) === 5) {
      return Number(order?.total || 0);
    }

    // Partial / item refunds
    const refundLogs = order?.orderlasttrans?.partial_refund_logs || [];

    const totalRefunded = refundLogs.reduce((total, refund) => {
      const refundAmount = refund?.items?.reduce((itemTotal, item) => {
        return itemTotal + Number(item?.amount || 0) + Number(item?.tax || 0);
      }, 0);

      return total + refundAmount;
    }, 0);

    return totalRefunded;
  };

  const getCompletedOrderTotalItems = (items) => {
    return items.reduce(
      (total, item) => total + (item.qty || item.quantity),
      0,
    );
  };

  const renderCompletedOrderedItem = (order) => {
    const refundAmount = getRefundedAmount(order);

    return (
      <TouchableOpacity onPress={() => handleCompletedOrderPress(order)}>
        <View style={styles.orderedItemContainer}>
          <View style={styles.orderedItem}>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>
              #{order.invoice_no}
            </Text>
            <Text
              style={[
                styles.orderedItemStatus,
                styles.pdBottom,
                { color: "green" },
              ]}
            >
              Completed
            </Text>
            <Text style={[styles.orderedItemText, styles.pdBottom]}>
              {storeData?.currency_info?.currency_icon}
              {order.total.toFixed(2)}
            </Text>
            <View style={[styles.tmRow, styles.tmRowTop]}>
              <Text style={[styles.orderedItemText, styles.quantText]}>
                Number of items:{" "}
                {getCompletedOrderTotalItems(order.orderitems) +
                  getCompletedOrderTotalItems(order.quick_sale_items ?? [])}
              </Text>
              <Text style={styles.orderedItemText}>
                {order?.created_at?.substring(11, 19)}
              </Text>
              <Text style={styles.orderedItemText}>
                {order?.created_at?.substring(0, 10)}
              </Text>
            </View>

            {/* Refunded Line */}
            {refundAmount > 0 && (
              <View style={styles.refundContainer}>
                <Text style={styles.refundText}>
                  Refunded: {storeData?.currency_info?.currency_icon || "$"}
                  {refundAmount.toFixed(2)}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.tmRow,
                order.status === "on-hold" && styles.flexEnd,
              ]}
            >
              {/* <Text style={[styles.CustomerText,styles.pdBottom]}>Customer: {item.Customer}</Text> */}
              {order.status === "on-hold" && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedOrder(orderList.indexOf(order));
                    setCancelModalVisible(true);
                  }}
                  style={styles.cancelButton}
                >
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
    console.log("successfully");

    try {
      dispatch(removeOrderFromOrderList(selectedOrder))
        .then(() => {
          try {
            db.transaction((tx) => {
              tx.executeSql(
                "DELETE FROM onHoldOrders WHERE createdAt = ? AND club = ?;",
                [orderList[selectedOrder].created_at, club.post_slug],
                () => {
                  console.log("Row deleted successfully");
                },
                (_, error) => {
                  console.error("Error deleting row:", error);
                },
              );
            });
          } catch (error) {}
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
                type: "tabPress",
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
                <Text
                  style={[
                    styles.tabButtonText,
                    isFocused ? styles.activeTabText : null,
                  ]}
                >
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const PendingOrdersScreen = () => {
    const holdedOrdersList = orderList.filter(
      (item) => item.status === "on-hold",
    );
    return isLoadingOrderList ? (
      <View style={styles.containerLoaderTop}>
        <ActivityIndicator size="medium" color="#00c0ff" />
      </View>
    ) : (
      <View style={styles.pdMain}>
        {holdedOrdersList?.length > 0 ? (
          <FlatList
            data={holdedOrdersList}
            renderItem={({ item }) => renderOrderedItem(item)}
            keyExtractor={(item) => orderList.indexOf(item).toString()}
          />
        ) : (
          <Text style={styles.errorMessage}>No orders found</Text>
        )}
      </View>
    );
  };

  // Remove Expired On-Hold Orders
  useFocusEffect(
    React.useCallback(() => {
      // Function to check if the order's created_at date has passed 72 hours
      const checkOrderCreatedDate = (order) => {
        const createdAtDate = new Date(order.created_at);
        const currentTime = new Date();

        const diffInMs = currentTime - createdAtDate;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours >= 72) {
          setSelectedOrder(orderList.indexOf(order));
          handleCancelOrder();
        }
      };

      const checkOrders = () => {
        setInterval(() => {
          orderList.forEach((order) => {
            if (order.status === "on-hold") {
              checkOrderCreatedDate(order);
            }
          });
        }, 1000); // Run every second
      };

      checkOrders();
    }, []),
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
      <View style={styles.nestedTabContainer}>
        <View style={styles.tabClickNav}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              styles.tabClickNavBtn,
              {
                backgroundColor: selectedCol === "onHold" ? "#00c0ff" : "#fff",
                color: selectedCol === "onHold" ? "#fff" : "#000",
              },
            ]}
            onPress={() => setSelectedCol("onHold")}
          >
            <Text
              style={[
                styles.tabButtonText,
                { color: selectedCol === "onHold" ? "#fff" : "#000" },
              ]}
            >
              On Hold
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              styles.tabClickNavBtn,
              {
                backgroundColor:
                  selectedCol === "completed" ? "#00c0ff" : "#fff",
              },
            ]}
            onPress={() => setSelectedCol("completed")}
          >
            <Text
              style={[
                styles.tabButtonText,
                { color: selectedCol === "completed" ? "#fff" : "#000" },
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        {/* <Tab.Navigator tabBar={CustomTabBar}>
          <Tab.Screen name="On Hold" component={PendingOrdersScreen} />
          <Tab.Screen name="Completed" component={CompletedOrdersScreen} />
        </Tab.Navigator> */}
        {selectedCol === "onHold" ? (
          <PendingOrdersScreen />
        ) : isLoadingCompletedOrders ? (
          <View style={styles.containerLoaderTop}>
            <ActivityIndicator size="medium" color="#00c0ff" />
          </View>
        ) : (
          <View style={styles.cmMain}>
            {completedOrders?.length > 0 ? (
              <FlatList
                data={completedOrders}
                renderItem={({ item }) => renderCompletedOrderedItem(item)}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={loadMoreOrders}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  loadingMore ? (
                    <View style={{ paddingVertical: 15 }}>
                      <ActivityIndicator size="small" color="#00c0ff" />
                    </View>
                  ) : null
                }
              />
            ) : (
              <Text style={styles.errorMessage}>{completedOrdersErrorMsg}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        <BottomBar />
      </View>
      {/* Cancel Order Modal */}
      <CancelOrderConfirmationModal
        visible={isCancelModalVisible}
        onConfirm={handleCancelOrder}
        onRequestClose={() => setCancelModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
    position: "relative",
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
  tabM: {
    paddingHorizontal: 11,
    paddingTop: 15,
  },
  cmMain: {
    padding: 15,
    width: "100%",
  },
  pdMain: {
    padding: 15,
    width: "100%",
  },
  tabContainer: {
    height: "100%",
    flexDirection: "row",
    borderRadius: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 15,
    width: "49%",
    marginHorizontal: "1%",
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  orderedItemContainer: {
    marginVertical: 5,
  },
  tmRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: "100%",
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
    marginTop: 10,
  },
  tmRowTop: {
    borderRadius: 0,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    backgroundColor: "none",
  },
  flexEnd: {
    justifyContent: "flex-end",
  },
  quantText: {
    padding: 8,
  },
  Customer: {
    textAlign: "right",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  orderedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    padding: 15,
    borderRadius: 6,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    height: "auto",
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
  pdBottom: {
    paddingVertical: 10,
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
  CustomerText: {
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
    padding: 8,
    backgroundColor: "red",
    borderRadius: 6,
  },

  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  containerLoaderTop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  nestedTabContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "row",
    position: "relative",
    paddingTop: 55,
    paddingBottom: 150,
  },
  tabClickNav: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  tabClickNav: {
    padding: 15,
    paddingHorizontal: 10,
    position: "absolute",
    top: 0,
    width: "100%",
    height: 80,
    display: "flex",
    flexDirection: "row",
  },
  tabClickNavBtn: {
    width: "100%",
    backgroundColor: "#fff",
    zIndex: 1,
  },
  errorMessage: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#444",
    width: "100%",
    textAlign: "center",
  },
  refundContainer: {
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 4,
  },

  refundText: {
    color: "#ff4d4d",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default OnlineOrderScreen;
