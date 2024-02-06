import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image,Modal } from "react-native";
import { Button as PaperButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';

const OrdersScreen = ({ navigation }) => {
    const [isCancelModalVisible, setCancelModalVisible] = useState(false);
    const [categories, setCategories] = useState([
        { id: 1, name: "Mens", image: require("../assets/meals.png") },
        { id: 2, name: "Womens", image: require("../assets/burgers.png") },
        { id: 3, name: "Kids", image: require("../assets/sandwiches.png") },
        { id: 4, name: "Shirts", image: require("../assets/sides.png") },
        { id: 5, name: "T-Shirts", image: require("../assets/sandwiches.png") },
        { id: 6, name: "Jeans", image: require("../assets/sandwiches.png") },
        { id: 7, name: "Shorts", image: require("../assets/sandwiches.png") },
        { id: 8, name: "Beauty", image: require("../assets/sandwiches.png") },
        { id: 9, name: "Mens", image: require("../assets/sandwiches.png") },
        { id: 10, name: "Kids", image: require("../assets/sandwiches.png") },
    ]);

    const [products, setProducts] = useState([
        { id: 101, name: "Roadster", category: 1, price: 10.99, image: require("../assets/burger_img.png") },
        { id: 102_1, name: "FBAR", category: 1, price: 11.99, image: require("../assets/burger_img-02.png") },
        { id: 103, name: "CHKOKKO", category: 1, price: 12.99, image: require("../assets/burger_img-01.png") },
        { id: 104, name: "HRX by Hrithik Roshan", category: 1, price: 13.99, image: require("../assets/burger_img-03.png") },
        { id: 105, name: "Hypernation", category: 1, price: 10.99, image: require("../assets/burger_img-04.png") },
        { id: 106, name: "Chicken Meal 6", category: 1, price: 11.99, image: require("../assets/burger_img.png") },
        { id: 107, name: "Hypernation", category: 1, price: 12.99, image: require("../assets/burger_img-02.png") },
        { id: 108, name: "Chicken Meal 8", category: 1, price: 13.99, image: require("../assets/burger_img.png") },
        { id: 109, name: "HRX by Hrithik Roshan", category: 2, price: 7.99, image: require("../assets/burger_img-01.png") },
        { id: 110, name: "FBAR", category: 3, price: 5.99, image: require("../assets/burger_img.png") },
        { id: 111, name: "Roadster", category: 4, price: 2.99, image: require("../assets/burger_img.png") },
        { id: 112, name: "CHKOKKO", category: 5, price: 1.99, image: require("../assets/burger_img-01.png") },
        { id: 113, name: "Hypernation", category: 6, price: 4.99, image: require("../assets/burger_img.png") },
        { id: 114, name: "HRX by Hrithik Roshan", category: 2, price: 8.99, image: require("../assets/burger_img-03.png") },
        { id: 115, name: "Hypernation", category: 3, price: 6.99, image: require("../assets/burger_img-04.png") },
    ]);

    const [selectedCategory, setSelectedCategory] = useState(1);
    const flatListRef = useRef(null);
    const [cart, setCart] = useState([]);
    

    useEffect(() => {
        // Set the first category as active when the component mounts
        setSelectedCategory(categories[0].id);
    }, []);

    const handleAddToCart = (product) => {
        setCart([...cart, product]);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };
    const holdOrder = () => {
        navigation.navigate("OnlineOrder");
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
                <Text style={styles.totalPrice}>Total: ${getTotalPrice().toFixed(2)}</Text>
                <View style={styles.checkoutContent}>
                    <Text style={styles.checkoutText}>Checkout</Text>
                    <Icon style={styles.rightIcon} name="chevron-right" size={24} color="#FFF" />
                </View>
            </TouchableOpacity>
        </View>
    );
    

      const renderProductItem = ({ item }) => (
        <TouchableOpacity style={styles.productItem} onPress={() => handleAddToCart(item)}>
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <PaperButton mode="contained" style={styles.addToCartButton}>
                Add to Order
            </PaperButton>
        </TouchableOpacity>
    );

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory === item.id && styles.selectedCategory,
            ]}
            onPress={() => {
                setSelectedCategory(item.id);
                scrollToCategory(item.id);
            }}
        >
            <Image
                source={item.image}
                style={[
                    styles.categoryImage,
                    selectedCategory === item.id && styles.selectedCategoryImage,
                ]}
            />
            <Text style={selectedCategory === item.id ? styles.selectedCategoryText : styles.categoryName}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const filteredProducts = selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : [];

    const groupedProducts = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
        groupedProducts.push([
            filteredProducts[i] || null,
            filteredProducts[i + 1] || null,
        ]);
    }

    const renderTwoProductsInRow = ({ item }) => (
        <View style={styles.twoProductsContainer}>
            <View style={styles.productCard}>{item[0] && renderProductItem({ item: item[0] })}</View>
            <View style={styles.productCard}>{item[1] && renderProductItem({ item: item[1] })}</View>
        </View>
    );

    const scrollToCategory = (categoryId) => {
        const index = categories.findIndex((category) => category.id === categoryId);
        flatListRef.current.scrollToIndex({
            animated: true,
            index,
            viewPosition: 0.5, // 0 for the start, 0.5 for the middle, 1 for the end
        });
    };

    const handleCheckout = () => {
        if (cart.length > 0) {
          navigation.navigate("Cart", {
            cart,
          });
        } else {
          alert("Your cart is empty. Add items to your cart before checkout.");
        }
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
                    <Text style={styles.title}> New Order</Text>
                </View>
                <View style={styles.titleRight}>
                    <TouchableOpacity onPress={() => setCancelModalVisible(true)}>
                     <Text style={styles.titleCancel}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.categoryContainer}>
                <FlatList
                    ref={flatListRef}
                    data={categories}
                    renderItem={renderCategoryItem}
                    keyExtractor={(category) => category.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <View style={[styles.productContainer, { paddingBottom: cart.length > 0 ? 90 : 0 }]}>
                <FlatList
                    data={groupedProducts}
                    renderItem={renderTwoProductsInRow}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={1}
                />
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
    categoryItem: {
        width: 120,
        padding: 15,
        marginRight: 10,
        backgroundColor: "#e7effc",
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: "#FFF",
       
    },
    categoryImage: {
        width: 35,
        height: 35,
        marginBottom: 10,
        resizeMode: 'contain',
    },
    categoryContainer: {
        padding: 15,
        backgroundColor: '#f2f2f2',
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
        textAlign: 'center',
    },
    categoryName: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: 'center',
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
    productImage: {
        width: "100%",
        height: 80,
        borderRadius: 6,
        marginBottom: 15,
        objectFit: 'contain',
    },
    productName: {
        fontSize: 14,
        fontWeight: "700",
        textAlign: 'center',
        color: "#222222",
        marginVertical: 8,
    },
    productPrice: {
        fontSize: 14,
        color: "#515151",
        textAlign: 'center',
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
        flexDirection: "row",
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

export default OrdersScreen;
