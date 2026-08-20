import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Button as PaperButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import {
  memoizedProductCategoryList,
  memoizedProductList,
  memoizedCart,
  memoizedStoreData,
} from "../store/selectors";
import { fetchStoreData } from "../store/reducers/storeDetailSlice";
import { fetchProductCategoryList } from "../store/reducers/productCategorySlice";
import { fetchProductList } from "../store/reducers/productSlice";
import { addToOrderList } from "../store/reducers/orderListSlice";
import { addProductToCart, resetCart } from "../store/reducers/cartSlice";
import productPlaceholder from "../assets/product-placeholder.png";
import Header from "./Header";
import * as SQLite from "expo-sqlite";
import { ProductVariantModal } from "./Modal/ProductVariantModal";
import { getCartTotalPrice, getItemPrice } from "../api/product";

const screenWidth = Dimensions.get("window").width;

const OrdersScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [club, setClub] = useState([]);
  const [isClubLoading, setIsClubLoading] = useState(true);
  const storeData = useSelector(memoizedStoreData);
  const productCategoryListWithoutAll = useSelector(memoizedProductCategoryList);
  const productCategoryList = [{ id: 0, name: "All" }, ...productCategoryListWithoutAll];
  const isProductCategoryLoading = useSelector((state) => state.productCategoryList.loading);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const productList = useSelector(memoizedProductList);
  const filteredProducts = productList[selectedCategory] ? productList[selectedCategory] : {};
  const categoryCurrentPage = JSON.parse(useSelector((state) => state.productList.currentPage));
  const categoryTotalPages = JSON.parse(useSelector((state) => state.productList.totalPages));
  const [isMoreProductLoading, setIsMoreProductLoading] = useState(false);
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);
  const cart = useSelector(memoizedCart);
  const flatListRef = useRef(null);
  const variantModalRef = useRef();
  const scrollViewRef = useRef(null);
  const [previousLastItemPosition, setPreviousLastItemPosition] = useState(0);
  const db = SQLite.openDatabaseSync("pos.db");

  // useFocusEffect(
  //     React.useCallback(() => {
  //         // Empty cart
  //         dispatch(resetCart());
  //     }, [])
  // );

  // Fetch Product List for ALL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const club = await AsyncStorage.getItem("club");
        if (club) {
          setClub(JSON.parse(club));
          dispatch(fetchStoreData(JSON.parse(club)));
          dispatch(fetchProductCategoryList(JSON.parse(club).post_slug))
            .then(() => {
              setSelectedCategory(productCategoryList[0].id);
              dispatch(
                fetchProductList(JSON.parse(club).post_slug, 0, { 0: [] }, { 0: 1 }, { 0: 1 }),
              ).catch((error) => {
                console.error("Error fetching product list:", error);
              });
            })
            .catch((error) => {
              console.error("Error fetching category list:", error);
            });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsClubLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product, quantity) => {
    try {
      dispatch(addProductToCart(product, quantity)).catch((error) => {
        console.error("Error adding product to cart:", error);
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  

  const holdOrder = async () => {
    try {
      let order = {};
      const d = new Date();
      order["created_at"] = `${d.getFullYear()}-${(d.getMonth() + 1 + "").padStart(
        2,
        "0",
      )}-${(d.getDate() + "").padStart(2, "0")} ${d
        .getHours()
        .toString()
        .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
      order["items"] = cart;
      order["status"] = "on-hold";
      dispatch(addToOrderList(order))
        .then(() => {
          console.log("inserting order into db");
          dispatch(resetCart());
          navigation.navigate("OnlineOrder");
          // db.transaction((tx) => {
          //   tx.executeSql(
          //     "INSERT INTO onHoldOrders (data, createdAt, club) VALUES (?, ?, ?)",
          //     [JSON.stringify(order), order["created_at"], club.post_slug],
          //     (_, { insertId }) => {
          //       console.log(`Order inserted with ID: ${insertId}`);
          //       dispatch(resetCart());
          //       navigation.navigate("OnlineOrder");
          //     },
          //     (_, error) => {
          //       console.error("Error inserting order:", error);
          //       dispatch(resetCart());
          //       navigation.navigate("OnlineOrder");
          //     }
          //   );
          // });
        })
        .catch((error) => {
          console.error("Error putting order on hold:", error);
        });
    } catch (error) {
      console.error("Error putting order on hold:", error);
    }
  };

  const renderCheckoutButton = () => (
    <View style={styles.checkoutContainer}>
      <TouchableOpacity style={styles.holdButton} onPress={holdOrder}>
        <View style={styles.checkoutContent}>
          <Icon style={styles.leftIcon} name="pause" size={24} color="#FFF" />
          <Text style={styles.holdText}>Hold Order</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.totalPrice}>Total: ${getCartTotalPrice(cart)}</Text>
        <View style={styles.checkoutContent}>
          <Text style={styles.checkoutText}>Checkout</Text>
          <Icon style={styles.rightIcon} name="chevron-right" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderQuickSaleCard = () => (
    <View style={styles.quickSaleCard}>
      <Text style={styles.quickSaleTitle}>Create a Quick Sale to:</Text>

      <View style={styles.quickSalePoints}>
        <Text style={styles.quickSaleBullet}>-</Text>
        <Text style={styles.quickSaleText}>
          Custom item with custom pricing to quickly charge a customer
        </Text>
      </View>

      <View style={styles.quickSalePoints}>
        <Text style={styles.quickSaleBullet}>-</Text>
        <Text style={styles.quickSaleText}>
          Custom item with custom pricing as part of an itemized sales order.
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <PaperButton
        style={styles.quickSaleButton}
        onPress={() => {
          navigation.navigate("AddQuickSale", {});
        }}
      >
        <Text style={styles.quickSaleButtonText}>Quick Sale</Text>
      </PaperButton>
    </View>
  );

  // Render Products
  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        if (item.is_variation === 1) {
          variantModalRef.current?.open({
            product: item,
            club,
          });
        } else {
          handleAddToCart(item);
        }
      }}
    >
      <View style={styles.productInfoView}>
        <Image
          source={item?.media?.value ? { uri: item?.media?.value } : productPlaceholder}
          style={styles.productImage}
        />
        <Text style={styles.productPrice}>${getItemPrice(item).toFixed(2)}</Text>
        <Text style={styles.productName}>{item.title}</Text>
      </View>
      <PaperButton mode="contained" style={styles.addToCartButton}>
        {item.is_variation === 1 ? "Choose Option" : "Add to Order"}
      </PaperButton>
    </TouchableOpacity>
  );

  // Render Category Items
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item.id && styles.selectedCategory]}
      onPress={() => {
        setSelectedCategory(item.id);
        scrollToCategory(item.id);
      }}
    >
      {/* <Image
                source={item.image}
                style={[
                    styles.categoryImage,
                    selectedCategory === item.id && styles.selectedCategoryImage,
                ]}
            /> */}
      <Text
        style={selectedCategory === item.id ? styles.selectedCategoryText : styles.categoryName}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Group Products in twos
  const groupedProducts = [];
  for (let i = 0; i < filteredProducts?.length; i += 2) {
    groupedProducts.push([filteredProducts[i] || null, filteredProducts[i + 1] || null]);
  }

  // Render the grouped products
  const renderTwoProductsInRow = (item, index) => (
    <View style={styles.twoProductsContainer} key={index}>
      <View style={styles.productCard}>{item[0] && renderProductItem({ item: item[0] })}</View>
      <View style={styles.productCard}>{item[1] && renderProductItem({ item: item[1] })}</View>
    </View>
  );

  // On click Scroll to Category
  const scrollToCategory = (categoryId) => {
    const index = productCategoryList.findIndex((category) => category.id === categoryId);
    flatListRef.current.scrollToIndex({
      animated: true,
      index,
      viewPosition: 0.5, // 0 for the start, 0.5 for the middle, 1 for the end
    });

    // Fetch Product List for the selected category
    const fetchData = async () => {
      try {
        if (club && categoryCurrentPage[categoryId] == undefined) {
          dispatch(
            fetchProductList(
              club.post_slug,
              categoryId,
              productList,
              categoryCurrentPage,
              categoryTotalPages,
            ),
          ).catch((error) => {
            console.error("Error fetching products:", error);
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  };

  // Load more products
  const loadMoreContent = async () => {
    let updatedCategoryCurrentPage = categoryCurrentPage;
    updatedCategoryCurrentPage[selectedCategory] = categoryCurrentPage[selectedCategory] + 1;
    dispatch(
      fetchProductList(
        club.post_slug,
        selectedCategory,
        productList,
        updatedCategoryCurrentPage,
        categoryTotalPages,
      ),
    ).catch((error) => {
      console.error("Error fetching products:", error);
    });

    setTimeout(() => {
      setIsMoreProductLoading(false);
      if (scrollViewRef.current && previousLastItemPosition !== 0) {
        scrollViewRef.current.scrollTo({
          y: previousLastItemPosition,
          animated: true,
        });
      }
    }, 500);
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      navigation.navigate("Cart");
    } else {
      alert("Your cart is empty. Add items to your cart before checkout.");
    }
  };

  const handleCancelOrder = async () => {
    dispatch(resetCart()); // Clear Cart
    setCancelModalVisible(false); // Close the modal after handling cancel
  };

  return isClubLoading || isProductCategoryLoading ? (
    <View style={styles.loaderContainer}>
      <View style={styles.loader}>
        <ActivityIndicator size="medium" color="#00c0ff" />
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Header clubName={club?.post_title} />
      <View style={styles.titleContainer}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>New Order</Text>
        </View>
        <View style={styles.titleRight}>
          {cart.length > 0 && (
            <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
              <Text style={styles.titleCancel}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.categoryContainer}>
        <FlatList
          ref={flatListRef}
          data={productCategoryList}
          renderItem={renderCategoryItem}
          keyExtractor={(category) => category.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View style={[styles.productContainer, { paddingBottom: cart.length > 0 ? 90 : 0 }]}>
        {groupedProducts?.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            onScroll={({ nativeEvent }) => {
              const isCloseToBottom =
                nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
                nativeEvent.contentSize.height - 10;
              if (
                isCloseToBottom &&
                !isMoreProductLoading &&
                categoryCurrentPage[selectedCategory] < categoryTotalPages[selectedCategory]
              ) {
                setPreviousLastItemPosition(nativeEvent.layoutMeasurement.height - 50);
                setIsMoreProductLoading(true);
                loadMoreContent();
              }
            }}
            scrollEventThrottle={16}
          >
            {/* First row: Quick Sale + First Product */}
            <View style={styles.twoProductsContainer}>
              <View style={styles.productCard}>{renderQuickSaleCard()}</View>

              <View style={styles.productCard}>
                {groupedProducts[0]?.[0] && renderProductItem({ item: groupedProducts[0][0] })}
              </View>
            </View>

            {/* Remaining products */}
            {groupedProducts.slice(1).map((item, index) => {
              return renderTwoProductsInRow(item, index);
            })}
            {(categoryCurrentPage[selectedCategory] == undefined ||
              categoryCurrentPage[selectedCategory] < categoryTotalPages[selectedCategory]) && (
              <View style={styles.loadMoreContainer}>
                <View style={styles.loader}>
                  <ActivityIndicator size="medium" color="#00c0ff" />
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <Text style={styles.errorMessage}>No products found</Text>
        )}
      </View>
      {cart.length > 0 && renderCheckoutButton()}
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
              You have chosen to CANCEL an order in progress. If you wish to CANCEL this current
              order, please click CONFIRM CANCELLATION below. If you chose this by error, please
              click CANCEL CANCELLATION.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.confirmButton} onPress={handleCancelOrder}>
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

      <ProductVariantModal
        ref={variantModalRef}
        onConfirm={(product, quantity) => {
          handleAddToCart(product, quantity);
        }}
      />
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
    justifyContent: "space-between",
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
  titleCancel: {
    color: "#fff",
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: "#c7c8c7",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#c7c8c7",
  },
  categoryItem: {
    padding: 15,
    marginRight: 10,
    backgroundColor: "#e7effc",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#FFF",
  },
  categoryImage: {
    width: 35,
    height: 35,
    marginBottom: 10,
    resizeMode: "contain",
  },
  categoryContainer: {
    padding: 15,
    backgroundColor: "#f2f2f2",
  },
  selectedCategoryImage: {
    tintColor: "#FFF",
  },
  selectedCategory: {
    backgroundColor: "#00c0ff",
  },
  selectedCategoryText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  twoProductsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productCard: {
    flex: 1,
    padding: 10,
  },
  productItem: {
    flex: 1,
    borderRadius: 6,
    padding: 15,
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
  productInfoView: {
    flex: 1,
  },
  productImage: {
    width: "100%",
    height: 80,
    borderRadius: 6,
    marginBottom: 15,
    objectFit: "contain",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    color: "#222222",
    marginVertical: 8,
  },
  productPrice: {
    fontSize: 14,
    color: "#515151",
    textAlign: "center",
  },
  addToCartButton: {
    backgroundColor: "#00c0ff",
    marginTop: 5,
  },
  productContainer: {
    flex: 1,
  },
  checkoutButton: {
    backgroundColor: "#00c0ff",
    flexDirection: screenWidth < 500 ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    width: "58%",
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
  checkoutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  holdButton: {
    backgroundColor: "#ff9800", // You can change the color as needed
    borderRadius: 6,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    width: "38%",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3, // For Android shadow
    height: screenWidth < 500 ? "100%" : "auto",
  },

  leftIcon: {
    marginRight: 10,
  },

  holdText: {
    color: "#FFF",
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
    maxWidth: 500,
    marginHorizontal: "auto",
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    color: "#777",
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
  confirmButton: {
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
    paddingTop: 40,
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
  quickSaleCard: {
    borderColor: "#00D5A0",
    justifyContent: "space-between",
    padding: 15,
    margin: 5,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
  },

  quickSaleTitle: {
    fontSize: 10,
    color: "#222",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
  },

  quickSalePoints: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },

  quickSaleBullet: {
    fontSize: 16,
    color: "#222",
    marginRight: 8,
    lineHeight: 18,
  },

  quickSaleText: {
    flex: 1,
    lineHeight: 12,
    fontSize: 10,
    // fontWeight: "bold",

    color: "#222",
  },

  quickSaleButton: {
    backgroundColor: "#00D5A0",
    borderRadius: 50,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quickSaleButtonText: {
    color: "#FFF",
    fontSize: 18,
  },
});

export default OrdersScreen;
