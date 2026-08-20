import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const screenWidth = Dimensions.get("window").width;

const NumericKeyboard = ({
  selectionButtons,
  handleNumericButtonPress,
  handleClearPress,
  handleSelectionButtonPress,
}) => {
  const renderSelectionButton = (label, value) => (
    <TouchableOpacity
      key={label}
      style={[styles.selectionButton, label === "Exact" && styles.exactButton]}
      onPress={() => handleSelectionButtonPress(value)}
    >
      <Text
        style={label === "Exact" ? styles.exactButtonText : styles.SelectText}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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

  return (
    <View>
      <View style={styles.amountContainer}>
        <View style={styles.selectionRow}>
          {selectionButtons.map((button) =>
            renderSelectionButton(button.label, button.value),
          )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  amountContainer: {
    flex: 1,
    justifyContent: "center",
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectionButton: {
    backgroundColor: "#e7effc",
    padding: 20,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  exactButtonText: {
    color: "#1a8bb0",
    fontSize: screenWidth < 500 ? 14 : 16,
  },
  keypadContainer: {
    flexDirection: "column",
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  keypadButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  keypadButtonText: {
    fontSize: 18,
  },
});

export default NumericKeyboard;
