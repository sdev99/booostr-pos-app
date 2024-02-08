import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Button as PaperButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import bgImg from "../assets/chat-bg.png";
import { fetchEula, eulaAccept } from "../store/reducers/eulaSlice";
import { ActivityIndicator } from "react-native-paper";
import { memoizedEulaContent } from "../store/selectors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const formateString = (str) => {
  str = str.replace(/(&#8220;|&#8221;)/g, "\"")
  return str;
}

const EulaTagData = ({tag}) => {
  const tagStyles = () => {
    let tagStyles = [];
    if(tag.tag==='h2'){
      tagStyles = [styles.MainHead];
    }else if(tag.tag==='h3' || tag.tag==='h4' || tag.tag==='h5' || tag.tag==='h6'){
      tagStyles = [styles.SubHead];
    }else if(tag.tag==='p'){
      tagStyles = [styles.smallText];
    }

    return tagStyles;
  }

  return (
    <>
      { tag.tag === 'h2' || tag.tag === 'h3' || tag.tag === 'p'
        ? <Text style={tagStyles()}>
            {tag.content.constructor.name === 'Array'
              ? tag?.content.map((item, index2) => (
                  <React.Fragment key={index2}>
                    {item.type === 'link'
                      ? <Text style={styles.blueText} onPress={() => Linking.openURL(item.href)}>{formateString(item.content)}</Text>
                      : formateString(item.content)
                    }
                  </React.Fragment>
                ))
              : formateString(tag.content.content)
            }
          </Text>
          : tag.tag === 'ul' || tag.tag === 'ol'
            ? tag?.content.map((item, index2) => (
                <Text style={styles.smallText} key={index2}>{`\u2022 `}
                  {item.content.constructor.name === 'Array'
                    ? item?.content.map((listItem, index3) => (
                      <React.Fragment key={index3}>
                        {listItem.type === 'link'
                        ? <Text style={styles.blueText} onPress={() => Linking.openURL(item.href)}>{formateString(listItem.content)}</Text>
                        : formateString(listItem.content)
                        }
                      </React.Fragment>
                    ))
                    : formateString(item.content)
                  }
                </Text>
              ))
            : null
      }
    </>
  )
}

const AgreementScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const eulaContent = useSelector(memoizedEulaContent);
  const eulaContentLoading = useSelector((state) => state.eula.eulaContentLoading);

  const handleEula = async () => {
    const storedUserId = parseInt(JSON.parse(await AsyncStorage.getItem("user_id")));

    let storedEulaConsents = await AsyncStorage.getItem("eula_consent");
    storedEulaConsents = storedEulaConsents ? JSON.parse(storedEulaConsents) : [];
    let updatedEulaConsents = storedEulaConsents?.length > 0 && !storedEulaConsents.includes(storedUserId) ? [...storedEulaConsents, storedUserId] : [storedUserId];
    await AsyncStorage.setItem(
      "eula_consent",
      JSON.stringify(updatedEulaConsents)
    );

    dispatch(eulaAccept({user_id: storedUserId}));
    navigation.reset({
      index: 1,
      routes: [{ name: "Club" }],
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchEula());
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    };

    if( eulaContent=='' ) fetchData();
  }, []);

  const imgProps = Image.resolveAssetSource(bgImg).uri;
  const image = { uri: imgProps };

  return (
    <View style={[styles.top_main]}>
      <ImageBackground style={styles.img_top} source={image} resizeMode="cover">

        <View style={styles.container}>
          {route.params?.onlyView &&
            <View style={styles.backButtonContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.titleContainer}>
                <Icon name="arrow-left" size={24} color="black" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          }
          <View style={styles.logoBox}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
            <Text style={styles.title}>User License Agreement</Text>
          </View>
          <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.card}>
            {eulaContentLoading
              ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="medium" color="#00c0ff" />
                </View>
              ) : <>
                    <ScrollView style={[styles.scrollView]}>
                      {JSON.parse(eulaContent)?.map((tag, index) => (
                        <React.Fragment key={index}>
                          <EulaTagData tag={tag} />
                        </React.Fragment>
                      ))}
                    </ScrollView>
                    { route.params?.onlyView
                      ? null
                      : <PaperButton
                          mode="contained"
                          style={styles.button}
                          onPress={handleEula}
                        >
                          <Text style={styles.buttonText}>Accept</Text>
                        </PaperButton>
                    }
                  </>
            }
          </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    paddingTop:80,
    paddingBottom:40,
  },
  scrollViewContainer:{
    flexDirection:'column',
    width:"90%",
    paddingVertical:20,
    backgroundColor:'#fff',
  },
  img_top: {
    height: "100%",
    paddingTop: Platform.OS == "ios" ? 40 : 15,
  },
  logo: {
    width: 130,
    height: 40,
  },
  titleContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    
  },
  smallText: {
    color: "#a9a9a9",
    textAlign: "left",
    marginVertical: 8,
  },
  MainHead:{
    fontSize:18,
    marginBottom:10,
  },
  SubHead:{
    marginVertical:10,
  },
  card: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent:'flex-start',
    backgroundColor: "white",
    borderBottomRightRadius: 5,
    textAlign: "left",
    borderBottomLeftRadius: 5,
    position:'relative'
  },
  cardWrap:{
    width: "100%",
  },
  logoBox: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00b0ef",
    width: "90%",
    padding: 20,
    textAlign: "center",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
    textTransform: "capitalize",
    color: "#fff",
  },
  blueText: {
    color: "#00b0ef",
    textDecorationLine: "underline",
  },
  input: {
    width: "100%",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#00c0ff",
    borderRadius: 6,
    fontSize: 13,
    backgroundColor: "#e7effc",
    lineHeight: 19,
    fontWeight: "400",
    fontStyle: "normal",
    color: "#515151",
    maxWidth: "100%",
    padding: 13,
  },
  button: {
    width: "100%",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#00c0ff",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#00c0ff",
    textTransform: "uppercase",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
  forgotPasswordMain: {
    color: "#a9a9a9",
    fontSize: 18,
    marginVertical: 15,
  },
  forgotPassword: {
    color: "#a9a9a9",
    fontSize: 16,
  },
  top_main: {
    flex: 1,
   
  },
  loader: {
    marginTop: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    
    
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 10,
  },
});

export default AgreementScreen;
