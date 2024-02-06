import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Header from './Header';
import BottomBar from './BottomBar';

const CustomModal = ({ isVisible, onClose, title, content }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView>
            <Text style={styles.modalText}>{content}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const SettingsScreen = ({ navigation }) => {
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const userData = { userName: "John Doe", emailAddress: "john@example.com" };

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const handleHelpAndSupport = () => {
    Linking.openURL("https://staging3.booostr.co")
      .catch((error) => console.error("Error opening URL:", error));
  };

  const toggleAccountModal = () => {
    setAccountModalVisible(!isAccountModalVisible);
  };
  const handleAgreementSupport = () => {
    navigation.navigate("Agrement");
  };

  return (
    <View style={styles.container}>
      <Header clubName="Hello Tester Club" onLogout={handleLogout} />
      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingsWrap}>
          <View style={styles.allItems}>
            <TouchableOpacity style={styles.settingItem} onPress={toggleAccountModal}>
              <Icon name="account" size={24} color="#000" style={styles.settingIcon} />
              <Text style={styles.settingTitle}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleHelpAndSupport}>
              <Icon name="help-circle" size={24} color="#000" style={styles.settingIcon} />
              <Text style={styles.settingTitle}>Help and Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleAgreementSupport}>
              <Icon name="help-circle" size={24} color="#000" style={styles.settingIcon} />
              <Text style={styles.settingTitle}>End-user License Agreement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
              <Icon name="logout" size={24} color="#000" style={styles.settingIcon} />
              <Text style={styles.settingTitle}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Account Modal */}
      <CustomModal
        isVisible={isAccountModalVisible}
        onClose={toggleAccountModal}
        title="Account Information"
        content={`User Name: ${userData.userName}\nEmail Address: ${userData.emailAddress}`}
      />

      <View style={styles.bottomBar}>
        <BottomBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingBottom: 80,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  allItems: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  settingsWrap: {
    padding: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  settingIcon: {
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: "#00c0ff",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default SettingsScreen;