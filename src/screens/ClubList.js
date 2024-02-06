import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SectionList,
  Platform,
  ActivityIndicator,
} from "react-native";

const ClubList = ({ navigation }) => {
  const [clubs, setClubs] = useState([
    { post_id: "1", post_title: "Test submit club 01", role: "manager" },
    { post_id: "2", post_title: "Test submit club 02", role: "support" },
    { post_id: "3", post_title: "Test submit club 03", role: "manager" },
    { post_id: "4", post_title: "Test submit club 04", role: "support" },
    { post_id: "5", post_title: "Test submit club 05", role: "manager" },
    { post_id: "6", post_title: "Test submit club 06", role: "support" },
    { post_id: "7", post_title: "Test submit club 07", role: "manager" },
    { post_id: "8", post_title: "Test submit club 08", role: "support" },
    { post_id: "9", post_title: "Test submit club 09", role: "support" },
    { post_id: "10", post_title: "Test submit club 10", role: "manager" },
    { post_id: "11", post_title: "Test submit club 11", role: "manager" },
    { post_id: "12", post_title: "Test submit club 12", role: "manager" },
 
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleClubClick = async (club) => {
    try {
      setIsLoading(true);

      // Simulate a loading delay (replace with your actual loading logic)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // After loading, navigate to the Dashboard screen
      navigation.navigate("Dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchTermChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const filteredClubs = clubs.filter((item) =>
    item.post_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clubItem}
      onPress={() => handleClubClick(item)}
    >
      <View style={styles.clubImageContainer}>
        {/* Add your image component here */}
        <Image
          source={require("../assets/club_demo.png")}
          style={styles.clubImage}
        />
      </View>
      <View style={styles.clubInfo}>
        <Text style={styles.clubName}>{item?.post_title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/*<View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.wrapText}>
            Choose a club you support or manage to join a Pos.
          </Text>
        </View>
        <View style={styles.headerRight}></View>
      </View>*/}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Club List</Text>
      </View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.wrapText}>
          Hello <Text style={styles.userName}>Ap Singh</Text> ! You are logged into Booostr POS, but it seems you are a profile manager for multiple clubs. Please choose the club POS system below that you would like to access.
          </Text>
        </View>
        <View style={styles.headerRight}></View>
      </View>
      {isSearchBarVisible && <View style={styles.searchBarSpace} />}
      <View style={styles.clubListContainer}>
        {clubs.length > 0 ? (
          <SectionList
            sections={[
              {
                data: filteredClubs,
              },
            ]}
            renderItem={renderItem}
            keyExtractor={(item) => item.post_id}
          />
        ) : (
          <Text style={styles.notFound}>No clubs found.</Text>
        )}
      </View>
      {isLoading && (
        <View style={styles.containerLoader}>
          <ActivityIndicator size="large" color="#00c0ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position:'relative',
  },
  tabContent: {
    flex: 1,
    backgroundColor:'#fff',
    borderRadius:6,
    padding:10,
  },
  userName:{
    color:'#000',
    fontWeight:'bold'
  },
  titleContainer: {
    paddingTop: Platform.OS == "ios" ? 55 : 30,
    padding: 15,
    flexDirection: "row",
   alignItems: "center",
   paddingBottom:0,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  tabContentMain:{
    flex: 1,
    padding:15,
    
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  clubListContainer: {
    flex: 1,
    paddingBottom:15,
  },
  clubItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    backgroundColor: "#fdfdfd",
  },
  wrapText: {
    fontSize: 14,
    marginTop: 3,
    color: "#777",
  },
  clubImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  clubImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#efefef",
    padding: 2,
    objectFit:'contain'
  },
  clubInfo: {
    flex: 1,
    marginLeft: 16,
  },
  clubName: {
    fontSize: 17,
    fontWeight: "bold",
  },
  membersCount: {
    color: "#777",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchBarSpace: {
    height: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
  },
  notFound: {
    textAlign: "center",
    fontSize: 20,
    padding: 20,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  containerLoader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 11,
    marginTop: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    borderRadius: 6,
    padding: 15,
    marginHorizontal: 5,
    backgroundColor:"#fff"
  },
  tabButtonText: {
    color: "#000", // Change the text color as needed
    fontSize: 14,
    fontWeight: "bold",
  },
  activeTab: {
    backgroundColor: "#00c0ff", // Change the active tab background color as needed
  },
  activeTabText: {
    color: "#fff", // Change the active tab text color as needed
  },
});

export default ClubList;
