// DashboardScreen.js
import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect, NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import Header from "./Header";
import BottomBar from "./BottomBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import { fetchStoreData } from "../store/reducers/storeDetailSlice";
import axios from "axios";
import { POS_STORE_API_URL, POS_API_TOKEN } from "../config";
import productPlaceholder from "../assets/product-placeholder.png";
import { memoizedStoreData } from "../store/selectors";
import * as SQLite from "expo-sqlite";
import { setupOrderList } from "../store/reducers/orderListSlice";

const screenWidth = Dimensions.get("window").width;

const LatestOrdersScreen = ({ orderedItems }) => {
  const storeData = useSelector(memoizedStoreData);
  const renderOrderedItem = ({ item }) => (
    <View style={styles.orderedItem}>
      {/* <View style={styles.imageAndNameContainer}>
        <Image source={item?.orderitems[0]?.term?.media?.value ? {uri: item?.orderitems[0].term.media.value} : productPlaceholder} style={[styles.orderedItemImage, {width: 70, aspectRatio: 1 }]} />
        <Text style={styles.orderedItemText}>{item?.orderitems[0]?.term?.title}</Text>
      </View> */}
      <Text style={styles.orderedItemText}>#{item?.invoice_no}</Text>
      <Text style={styles.orderedItemStatus}>
        {item?.created_at?.substring(0, 10)}
      </Text>
      <Text style={styles.orderedItemText}>
        {storeData?.currency_info?.currency_icon}
        {item?.total?.toFixed(2)}
      </Text>
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
        <Image
          source={
            item?.media?.value
              ? { uri: item?.media?.value }
              : productPlaceholder
          }
          style={[styles.cartItemImage, { width: 70, aspectRatio: 1 }]}
        />
        <Text style={styles.orderedItemText}>{item.title}</Text>
      </View>
      <Text style={styles.orderedItemText}>
        {storeData?.currency_info?.currency_icon}
        {item?.firstprice?.price.toFixed(2)}
      </Text>
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
  const [latestOrders, setLatestOrders] = useState([]);
  const storeData = useSelector(memoizedStoreData);
  const [selectedCol, setSelectedCol] = useState("latestOrders");
  const flatListRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [previousLastItemPosition, setPreviousLastItemPosition] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [isMoreOrderLoading, setIsMoreOrderLoading] = useState(false);
  const [isLatestOrdersLoading, setIsLatestOrdersLoading] = useState(false);
  const [isTopSellingOrdersLoading, setIsTopSellingOrdersLoading] =
    useState(false);
  const db = SQLite.openDatabaseSync("pos.db");

  const [latestOrderErrorMsg, setLatestOrderErrorMsg] = useState("");
  const [topSellingErrorMsg, setTopSellingErrorMsg] = useState("");

  // Setup Order Database
  useEffect(() => {
    const setupDb = async () => {
      console.log("starting db setup");
      if (club?.post_slug) {
        db.transaction((tx) => {
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS onHoldOrders (id INTEGER PRIMARY KEY AUTOINCREMENT, data LONGTEXT, createdAt DATETIME, club TEXT);",
            [],
            () => {
              db.transaction((tx) => {
                tx.executeSql(
                  `select * from onHoldOrders WHERE club = ?;`,
                  [club.post_slug],
                  (_, { rows: { _array } }) =>
                    dispatch(
                      setupOrderList(
                        _array.map((item) => JSON.parse(item.data))
                      )
                    )
                );
              });
            },
            (_, error) => {
              console.error("Error creating table:", error);
            }
          );
        });
      }
    };

    setupDb();
  }, [club]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const club = await AsyncStorage.getItem("club");
        if (club) {
          setClub(JSON.parse(club));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsClubLoading(false);
      }
    };

    fetchData();
  }, [storeData]);

  // Get Store Anylytics
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const club = await AsyncStorage.getItem("club");
          if (JSON.parse(club)?.post_slug) {
            const response = await axios.post(
              `${POS_STORE_API_URL}/pos-order-info`,
              {},
              {
                headers: {
                  Apitoken: POS_API_TOKEN,
                  "X-Tenant": JSON.parse(club).post_slug,
                },
              }
            );
            if (response?.data?.result) {
              setMetrics([
                {
                  id: 1,
                  name: "Revenue",
                  icon: "cash",
                  totalRev:
                    response?.data?.result?.pos_order_revenue.toFixed(2),
                },
                {
                  id: 2,
                  name: "Orders",
                  icon: "clipboard-list",
                  totalRev: response?.data?.result?.total_order_count,
                },
                {
                  id: 3,
                  name: "Walk-ins",
                  icon: "walk",
                  totalRev: response?.data?.result?.pos_order_count,
                },
                {
                  id: 4,
                  name: "Online Order",
                  icon: "web",
                  totalRev: response?.data?.result?.website_order_count,
                },
              ]);
            } else if (response?.data?.error && response?.data?.message) {
              console.error(response.data.message);
            } else {
              console.error("kindly try after some time.");
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          console.error(error.message ?? error);
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
          setIsTopSellingOrdersLoading(true);

          const club = await AsyncStorage.getItem("club");
          if (JSON.parse(club)?.post_slug) {
            const response = await axios.post(
              `${POS_STORE_API_URL}/pos-order-list`,
              {},
              {
                headers: {
                  Apitoken: POS_API_TOKEN,
                  "X-Tenant": JSON.parse(club).post_slug,
                },
              }
            );
            if (response?.data?.heighest_sell_terms?.data) {
              setTopSellingErrorMsg("");
              setTopSellingItems(response.data.heighest_sell_terms.data);
            } else if (response?.data?.error && response?.data?.message) {
              setTopSellingErrorMsg(response.data.message);
            }
          }
        } catch (error) {
          // console.error("Error fetching data:", error);
          setTopSellingErrorMsg("No orders found");
        } finally {
          setIsTopSellingOrdersLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  // Get Latest Orders
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLatestOrdersLoading(true);
        try {
          const club = await AsyncStorage.getItem("club");
          if (JSON.parse(club)?.post_slug) {
            const response = await axios.post(
              `${POS_STORE_API_URL}/pos-order-list`,
              { key: "latest" },
              {
                headers: {
                  Apitoken: POS_API_TOKEN,
                  "X-Tenant": JSON.parse(club).post_slug,
                },
              }
            );
            if (response?.data?.result?.data) {
              setCurrentPage(1);
              setTotalPages(response.data.result.last_page);
              setLatestOrders(response.data.result.data);
              setLatestOrderErrorMsg("");
            } else if (response?.data?.error && response?.data?.message) {
              setLatestOrderErrorMsg(response.data.message);
            } else {
              setLatestOrderErrorMsg("No orders found");
            }
          }
        } catch (error) {
          // console.error("Error fetching data:", error);
          setLatestOrderErrorMsg("No orders found");
        } finally {
          setIsLatestOrdersLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  // Get More Latest Orders
  const getMoreLatestOrders = async () => {
    try {
      const club = await AsyncStorage.getItem("club");
      if (JSON.parse(club)?.post_slug) {
        const response = await axios.post(
          `${POS_STORE_API_URL}/pos-order-list`,
          { key: "latest" },
          {
            headers: {
              Apitoken: POS_API_TOKEN,
              "X-Tenant": JSON.parse(club).post_slug,
            },
          }
        );
        if (response?.data?.result?.data) {
          setLatestOrders(response.data.result.data);
          setLatestOrderErrorMsg("");
        } else if (response?.data?.error && response?.data?.message) {
          setLatestOrderErrorMsg(response.data.message);
        } else {
          setLatestOrderErrorMsg("No orders found");
        }
      }
    } catch (error) {
      // console.error("Error fetching data:", error);
    } finally {
    }
  };

  const [metrics, setMetrics] = useState([
    { id: 1, name: "Revenue", icon: "cash", totalRev: "" },
    { id: 2, name: "Orders", icon: "clipboard-list", totalRev: "" },
    { id: 3, name: "Walk-ins", icon: "walk", totalRev: "" },
    { id: 4, name: "Online Order", icon: "web", totalRev: "" },
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
    // const backgroundColor = item.name === "Online Order" ? "#CCCCCC" : "#FFF";
    const backgroundColor = item.name === "Online Order" ? "#FFF" : "#FFF";
    // const textColor = item.name === "Online Order" ? "#515151" : "#000";
    const textColor = item.name === "Online Order" ? "#000" : "#000";

    return (
      <View
        style={[
          styles.metricItem,
          { width: itemWidth, marginRight: 2, marginLeft: 3, backgroundColor },
        ]}
      >
        <Icon name={item.icon} size={24} color={textColor} />
        <Text style={[styles.metricRev, { color: textColor }]}>
          {item.name === "Revenue" ? `$${item.totalRev}` : item.totalRev}
        </Text>
        <Text style={[styles.metricName, { color: textColor }]}>
          {item.name}
        </Text>
      </View>
    );
  };

  const Tab = createMaterialTopTabNavigator();

  const renderOrderedItem = (item, index) => (
    <View style={styles.orderedItem} key={index}>
      {/* <View style={styles.imageAndNameContainer}>
        <Image source={item?.orderitems[0]?.term?.media?.value ? {uri: item?.orderitems[0].term.media.value} : productPlaceholder} style={[styles.orderedItemImage, {width: 70, aspectRatio: 1 }]} />
        <Text style={styles.orderedItemText}>{item?.orderitems[0]?.term?.title}</Text>
      </View> */}
      <Text style={styles.orderedItemText}>#{item?.invoice_no}</Text>
      <Text style={styles.orderedItemStatus}>
        {item?.created_at?.substring(0, 10)}
      </Text>
      <Text style={styles.orderedItemText}>
        {storeData?.currency_info?.currency_icon}
        {item?.total?.toFixed(2)}
      </Text>
    </View>
  );

  // Load more products
  const loadMoreContent = async () => {
    let updatedCurrentPage = currentPage;
    updatedCurrentPage += 1;

    const club = await AsyncStorage.getItem("club");
    if (JSON.parse(club)?.post_slug) {
      setIsMoreOrderLoading(true);
      const response = await axios.post(
        `${POS_STORE_API_URL}/pos-order-list?page=${updatedCurrentPage}`,
        { key: "latest" },
        {
          headers: {
            Apitoken: POS_API_TOKEN,
            "X-Tenant": JSON.parse(club).post_slug,
          },
        }
      );
      if (response?.data?.result?.data) {
        setCurrentPage(updatedCurrentPage);
        setLatestOrders([...latestOrders, ...response.data.result.data]);
        setIsMoreOrderLoading(false);
      } else if (response?.data?.error && response?.data?.message) {
        console.error(response.data.message);
        setIsMoreOrderLoading(false);
      } else {
        console.error("Unable to load more products.");
        setIsMoreOrderLoading(false);
      }
    }
  };

  return isClubLoading ? (
    <View style={styles.loaderContainer}>
      <View style={styles.loader}>
        <ActivityIndicator size="medium" color="#00c0ff" />
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Header
        clubName={storeData?.club_info?.club_name ?? club.post_title}
        onLogout={handleLogout}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      {screenWidth < 500 ? (
        <View style={{ marginTop: 15, marginBottom: 25 }}>
          <View style={styles.MetRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricTitle]}>
                <Icon name={metrics[0].icon} size={24} color={"#000"} />
                <Text style={styles.metricName}>{metrics[0].name}</Text>
              </View>
              <Text style={styles.metricRev}>
                {storeData?.currency_info?.currency_icon}
                {metrics[0].totalRev}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricTitle]}>
                <Icon name={metrics[1].icon} size={24} color={"#000"} />
                <Text style={styles.metricName}>{metrics[1].name}</Text>
              </View>
              <Text style={styles.metricRev}>{metrics[1].totalRev}</Text>
            </View>
          </View>

          <View style={styles.MetRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricTitle]}>
                <Icon name={metrics[2].icon} size={24} color={"#000"} />
                <Text style={styles.metricName}>{metrics[2].name}</Text>
              </View>
              <Text style={styles.metricRev}>{metrics[2].totalRev}</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={[styles.metricTitle]}>
                <Icon name={metrics[3].icon} size={24} color={"#000"} />
                <Text style={styles.metricName}>{metrics[3].name}</Text>
              </View>
              <Text style={styles.metricRev}>{metrics[3].totalRev}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.MetRow}>
          <FlatList
            data={metrics}
            renderItem={renderMetricItem}
            keyExtractor={(metric) => metric.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListMetricContent}
          />
        </View>
      )}
      <View style={styles.tabContainer}>
        <View style={styles.tabClickNav}>
          <TouchableOpacity
            style={[
              styles.tabClickNavBtn,
              {
                borderColor:
                  selectedCol === "latestOrders" ? "#00c0ff" : "#fff",
              },
            ]}
            onPress={() => setSelectedCol("latestOrders")}
          >
            <Text style={styles.tabText}>Latest Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabClickNavBtn,
              {
                borderColor: selectedCol === "topSelling" ? "#00c0ff" : "#fff",
              },
            ]}
            onPress={() => setSelectedCol("topSelling")}
          >
            <Text style={styles.tabText}>Top Selling</Text>
          </TouchableOpacity>
        </View>
        {selectedCol === "latestOrders" ? (
          <View style={styles.tabContent}>
            {/* <FlatList
                  ref={flatListRef}
                  data={latestOrders}
                  renderItem={renderOrderedItem}
                  keyExtractor={(item) => item.id.toString()}
                  onScroll={({ nativeEvent }) => {
                    const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 10;
                    if (isCloseToBottom && !isMoreOrderLoading && currentPage < totalPages) {
                        setPreviousLastItemPosition(nativeEvent.layoutMeasurement.height-50);
                        setIsMoreOrderLoading(true);
                        loadMoreContent();
                    }
                  }}
                  scrollEventThrottle={16}
                /> */}
            <ScrollView
              ref={scrollViewRef}
              onScroll={({ nativeEvent }) => {
                const isCloseToBottom =
                  nativeEvent.layoutMeasurement.height +
                    nativeEvent.contentOffset.y >=
                  nativeEvent.contentSize.height - 10;
                if (
                  isCloseToBottom &&
                  !isMoreOrderLoading &&
                  currentPage < totalPages
                ) {
                  setPreviousLastItemPosition(
                    nativeEvent.layoutMeasurement.height - 50
                  );
                  loadMoreContent();
                }
              }}
              scrollEventThrottle={16}
            >
              {latestOrders?.length > 0 ? (
                latestOrders.map((item, index) => {
                  return renderOrderedItem(item, index);
                })
              ) : (
                <>
                  {(isMoreOrderLoading || isLatestOrdersLoading) &&
                  currentPage < totalPages ? (
                    <View style={styles.loadMoreContainer}>
                      <View style={styles.loader}>
                        <ActivityIndicator size="medium" color="#00c0ff" />
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.errorMessage}>
                      {latestOrderErrorMsg}
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        ) : (
          <>
            {topSellingItems?.length > 0 ? (
              <TopSellingScreen orderedItems={topSellingItems} />
            ) : (
              <>
                {isTopSellingOrdersLoading ? (
                  <View style={styles.loadMoreContainer}>
                    <View style={styles.loader}>
                      <ActivityIndicator size="medium" color="#00c0ff" />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.errorMessage}>{topSellingErrorMsg}</Text>
                )}
              </>
            )}
          </>
        )}
        {/* <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: '#000',
                tabBarIndicatorStyle: {
                  backgroundColor: '#00c0ff',
                },
                tabBarStyle : {
                  height: 50
                }
              }}
            >
            <Tab.Screen name="Latest Orders">
              {() => <LatestOrdersScreen orderedItems={latestOrders} />}
            </Tab.Screen>
            <Tab.Screen name="Top Selling">
              {() => <TopSellingScreen orderedItems={topSellingItems} />}
            </Tab.Screen>
          </Tab.Navigator> */}
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
  flatListMetricContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  metricItem: {
    width: screenWidth < 500 ? "48%" : "100%",
    padding: 15,
    marginBottom: screenWidth < 500 ? 0 : 15,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  metricTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  metricName: {
    fontSize: screenWidth < 500 ? 13 : 12,
    fontWeight: screenWidth < 500 ? "bold" : "normal",
    marginTop: screenWidth < 500 ? 0 : 5,
    alignSelf: screenWidth < 500 ? "center" : "auto",
    color: screenWidth < 500 ? "#000" : "#515151",
  },
  metricRev: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
    color: "#000",
  },

  MetRow: {
    padding: screenWidth < 500 ? "2%" : 15,
    paddingHorizontal: screenWidth < 500 ? 15 : 0,
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
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  tabContainer: {
    height: "100%",
    position: "relative",
    paddingBottom: screenWidth < 500 ? 410 : 330,
  },
  tabClickNav: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  tabClickNavBtn: {
    height: 50,
    width: "50%",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderBottomWidth: 2,
  },
  tabText: {
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  loadMoreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  errorMessage: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#444",
    width: "100%",
    textAlign: "center",
  },
});

export default DashboardScreen;
