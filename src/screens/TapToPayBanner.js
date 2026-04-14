import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Enable animation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY = "#00c0ff";

const TapToPayBanner = ({ navigation }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View
      style={{
        backgroundColor: "#e6f9ff", // light version of your theme
        borderRadius: 12,
        marginHorizontal: 15,
        marginTop: 8,
        borderWidth: 1,
        borderColor: PRIMARY,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={toggleExpand}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          paddingVertical: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="credit-card-outline" size={20} color={PRIMARY} />
          <Text
            style={{
              marginLeft: 10,
              fontSize: 15,
              fontWeight: "700",
              color: "#000",
            }}
          >
            Tap to Pay on iPhone
          </Text>
        </View>

        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={PRIMARY}
        />
      </TouchableOpacity>

      {/* Content */}
      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <Text style={{ fontSize: 13, color: "#333" }}>
            Accept Apple Pay, contactless cards, and digital wallets directly on
            your iPhone.
          </Text>

          <Text style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
            Customers may need to enter their PIN. Accessibility features like
            VoiceOver are supported.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={{
              marginTop: 12,
              alignSelf: "flex-start",
              backgroundColor: PRIMARY,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              Enable from Settings
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TapToPayBanner;
