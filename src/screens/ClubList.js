import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SectionList,
  Platform,
  Alert,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSelector, useDispatch } from "react-redux";
import { fetchClubList } from "../store/reducers/clubListSlice";
import { logout } from "../actions/auth";
import { memoizedClubList, memoizedUserData } from "../store/selectors";
import { useFocusEffect } from "@react-navigation/native";
import { fetchStoreData } from "../store/reducers/storeDetailSlice";
import FullScreenLoader from "./Modal/FullScreenLoader";

const ClubList = ({ navigation }) => {
  const dispatch = useDispatch();
  const userData = useSelector(memoizedUserData);
  const clubList = useSelector(memoizedClubList);
  const userDataLoading = useSelector((state) => state.auth.loading);
  const clubListLoading = useSelector((state) => state.clubList.loading);
  const storeDataLoading = useSelector((state) => state.storeData.loading);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          if (userData?.user_id) {
            dispatch(fetchClubList(userData?.user_id));
          }
        } catch (error) {
          // console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, [userData?.user_id]),
  );

  const handleClubClick = async (club) => {
    try {
      const result = await dispatch(fetchStoreData(club));
      if (result.success) {
        navigation.reset({
          index: 1,
          routes: [{ name: "MainApp" }],
        });
      } else {
        Alert.alert(club.post_title, ` ${result.message}`);
        console.log("❌ Failed:", result.message);
      }
    } catch (error) {
      console.error("Unable to set selected Club:", error);
    }
  };

  const handleLogout = () => {
    dispatch(logout(userData.user_id)).then((response) => {
      if (response.status === "success") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clubItem}
      onPress={() => handleClubClick(item)}
    >
      <View style={styles.clubImageContainer}>
        {/* Add your image component here */}
        <Image
          source={
            item?.user_photo
              ? { uri: item?.user_photo }
              : require("../assets/club_demo.png")
          }
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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Club List</Text>
      </View>
      {userDataLoading || clubListLoading ? (
        <View style={styles.containerLoader}>
          <ActivityIndicator size="medium" color="#00c0ff" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.wrapText}>
                Hello{" "}
                <Text style={styles.userName}>
                  {userData?.first_name} {userData?.last_name}
                </Text>{" "}
                ! You are logged into Booostr POS, but it seems you are a
                profile manager for multiple clubs. Please choose the club POS
                system below that you would like to access.
              </Text>
            </View>
            <View style={styles.headerRight}></View>
          </View>
          <View style={styles.clubListContainer}>
            {clubList?.length > 0 ? (
              <SectionList
                sections={[
                  {
                    data: clubList,
                  },
                ]}
                renderItem={renderItem}
                keyExtractor={(item) => item.post_id}
              />
            ) : (
              <View style={styles.notFoundContainer}>
                <Text style={styles.notFound}>No clubs found.</Text>
              </View>
            )}
            <View style={styles.logoutButtonContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
      <FullScreenLoader show={storeDataLoading} transparent={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
  },
  userName: {
    color: "#000",
    fontWeight: "bold",
  },
  titleContainer: {
    paddingTop: Platform.OS == "ios" ? 55 : 30,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  tabContentMain: {
    flex: 1,
    padding: 15,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  clubListContainer: {
    flex: 1,
    paddingBottom: 15,
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
    objectFit: "contain",
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

  notFoundContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  notFound: {
    textAlign: "center",
    fontSize: 20,
    padding: 20,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#FF3B30",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
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
    backgroundColor: "#fff",
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
