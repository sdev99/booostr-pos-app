import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


const CashScreen = ({ navigation, route }) => {

  const { totalAmount } = route?.params || {};

  const [amountTendered, setAmountTendered] = useState(totalAmount ? totalAmount.toString() : "0");

  const handleProcessCash = () => {
    const tenderedAmount = parseFloat(amountTendered);
    if (tenderedAmount < totalAmount) {
      Alert.alert(
        "Insufficient Amount",
        "The amount being tendered is less than the order amount. Please update tendered amount to be equal or more than the order amount.",
        [
          {
            text: "OK",
            onPress: () => console.log("OK Pressed"),
          },
        ],
        { cancelable: false }
      );
    } else {
      navigation.navigate("CashReceipt", { amountTendered });
    }
  };

  const handleKeypadPress = (value) => {
    if (value === "C") {
      setAmountTendered("0");
    } else if (value === "Exact") {
      setAmountTendered(totalAmount ? totalAmount.toString() : "0");
    } else if (!isNaN(value)) {
      setAmountTendered(value); // Set the value directly
    } else {
      if (!isNaN(value)) {
        setAmountTendered((prevAmount) => prevAmount + value); // Concatenate the values
      } else {
        setAmountTendered((prevAmount) =>
          (parseFloat(prevAmount) + parseFloat(value)).toString()
        );
      }
    }
  };
  const handleNumericButtonPress = (value) => {
    setAmountTendered((prevAmount) => prevAmount === "0" ? value.toString() : prevAmount + value.toString());
  };
  const handleClearPress = () => {
    setAmountTendered("0");
  };



  const renderNumericButton = (value) => (
    <TouchableOpacity
      key={value}
      style={styles.keypadButton}
      onPress={() => handleNumericButtonPress(value)}
    >
      <Text style={styles.keypadButtonText}>{value}</Text>
    </TouchableOpacity>
  );

  const renderClearButton = () => (
    <TouchableOpacity
      key="clear"
      style={[styles.keypadButton, styles.keypadButtonCut]}
      onPress={() => handleClearPress()}
    >
      <Icon name="backspace" size={24} color="#000" />
    </TouchableOpacity>
  );

  const renderSelectionButton = (label, value) => (
    <TouchableOpacity
      key={label}
      style={[styles.selectionButton, label === "Exact" && styles.exactButton]}
      onPress={() => handleKeypadPress(value)}
    >
      <Text style={label === "Exact" ? styles.exactButtonText : styles.SelectText}>{label}</Text>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>

      <View style={styles.mainWrap}>
         <View style={styles.dueContainer}>
          <Text style={styles.dueText}> Amount due</Text>
          <Text style={styles.dueAmount}>${totalAmount.toFixed(2)}</Text>
          </View>
        <View style={styles.mainWrapDiv}>
           
          <KeyboardAwareScrollView>
           
            <View style={styles.headerContainer}>
              <View style={styles.heading}>
                <Text style={styles.headerText}>Amount Tendered</Text>
              </View>
              <View style={styles.amountField}>
              <TextInput
                style={styles.amountInput}
                placeholder="Amount Tendered"
                keyboardType="numeric"
                value={amountTendered === "0" ? `$${totalAmount.toFixed(2)}` : `$${parseFloat(amountTendered).toFixed(2)}`}
                onChangeText={(text) => setAmountTendered(text.replace(/[^0-9.]/g, ""))}
              />
              </View>
            </View>

            <View style={styles.amountContainer}>
              <View style={styles.selectionRow}>
                {renderSelectionButton("Exact", "Exact")}
                {renderSelectionButton("$10.00", "10.00")}
                {renderSelectionButton("$20.00", "20.00")}
              </View>
            </View>

            <View style={styles.keypadContainer}>
              <View style={styles.keypadRow}>
                {[1, 2, 3].map(renderNumericButton)}
              </View>
              <View style={styles.keypadRow}>
                {[4, 5, 6].map(renderNumericButton)}
              </View>
              <View style={styles.keypadRow}>
                {[7, 8, 9].map(renderNumericButton)}
              </View>
              <View style={styles.keypadRow}>
                {[0, "00"].map(renderNumericButton)}
                {renderClearButton()}
              </View>
            </View>

             <TouchableOpacity
              style={[
                styles.processButton,
                { backgroundColor: amountTendered < totalAmount ? "#ddd" : "#00c0ff" }, // Gray if less, blue otherwise
              ]}
              onPress={handleProcessCash}
            >
              <Text style={styles.processButtonText}>PROCESS</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  mainWrap:{
    flexDirection:'column',
    padding:15
  },
  mainWrapDiv:{
    backgroundColor:'#fff',
    padding:15,
    borderRadius:6

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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heading: {
    flex: 1,
    marginRight: 10,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountField: {
    flex: 1,
  },
  amountContainer: {
    flex: 1,
    justifyContent: "center",
  },
  amountRow: {
    marginBottom: 20,
  },
  SelectText:{
    color:'#1a8bb0',
    fontSize:16
  },
  dueContainer:{
    padding:15,
  },
  dueText:{
    color:"#A9A9A9",
    textAlign:'center',
    fontSize:16,
  },
  dueAmount:{
    fontSize:24,
    fontWeight:'bold',
    textAlign:'center',
  },
  exactButtonText:{
    color:'#1a8bb0',
    fontSize:16
  },
  amountInput: {
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    color: "#515151",
    padding: 15,
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectionButton: {
    backgroundColor: "#e7effc",
    padding: 20,
    alignItems: "center",
    flex:1,
    borderWidth:1,
    borderColor:"#ddd"
  },

  processButton: {
    backgroundColor: "#00c0ff",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop:20,
  },
  processButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  keypadContainer: {
    flexDirection: "column",
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth:1,
    borderBottomColor:"#ddd",
  },
  keypadButton: {
    flex:1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderWidth:1,
    borderColor:"#ddd",
    borderBottomWidth:0,
    borderTopWidth:0,
  },
  keypadButtonText: {
    fontSize: 18,
  },
 
});

export default CashScreen;
