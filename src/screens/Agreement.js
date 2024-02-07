import React, { useState, useEffect } from "react";
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
import { fetchEula } from "../store/reducers/eulaSlice";
import { memoizedEulaContent } from "../store/selectors";

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
  // const [ currentUserID, setCurrentUseData ] = useState(0);
  // const eulaContent = useSelector(memoizedEulaContent);

  const handleEula = async () => {
    // let storedEulaConsents = await AsyncStorage.getItem("eula_consent");
    // storedEulaConsents = JSON.parse(storedEulaConsents);
    // let updatedEulaConsents = storedEulaConsents?.length > 0 ? [...storedEulaConsents, currentUserID] : [currentUserID];
    // await AsyncStorage.setItem(
    //   "eula_consent",
    //   JSON.stringify(updatedEulaConsents)
    // );
    // dispatch(eulaAccept({user_id: currentUserID}));
    navigation.reset({
      index: 1,
      routes: [{ name: "Club" }],
    });
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       dispatch(fetchEula());
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   if( eulaContent==null ) fetchData();
  // }, [dispatch]);

  const [isButtonVisible, setIsButtonVisible] = useState(true);

  const handleAgreement = () => {
    navigation.navigate('Club');
    setIsButtonVisible(false);
  };

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
            {/* {loading
              ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="medium" color="#00c0ff" />
                </View>
              ) : <>
                    <ScrollView style={[styles.scrollView]}>
                      {eulaContent?.map((tag, index) => (
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
            } */}
            <View style={styles.cardWrap}>
              <Text style={styles.MainHead}>MOBILE APPLICATION END-USER LICENSE AGREEMENT (EULA)</Text>
              <Text style={styles.smallText}>
                  PLEASE READ THIS MOBILE APPLICATION END-USER LICENSE AGREEMENT(“EULA AGREEMENT”) CAREFULLY, BEFORE COMPLETING THE DOWNLOAD OR INSTALLATION PROCESS OR USING THE APPLICATION, AS IT CONTAINS IMPORTANT INFORMATION REGARDING YOUR LEGAL RIGHTS AND REMEDIES.
              </Text>
              <Text style={styles.smallText}>Last Revised: 2024-01-16 06:34:47</Text>
              <Text style={styles.SubHead}>OVERVIEW</Text>
              <Text style={styles.smallText}>This EULA agreement is a binding agreement, entered into by and between BooostrTechnologies, Inc., registered address 19600 Toyon Dr., Penn Valley, CA 95946, (“Booostr Technologies, Inc.”) and you, and is made effective as of the date you download, install or use the Application Booostr Team Chat (“Application”) or from the date of your electronic acceptance.</Text>
              <Text style={styles.smallText}>This EULA agreement sets forth the general terms and conditions of your use of the Application, provides a license to use Booostr Technologies, Inc. Application and contains liabilitydisclaimers. This EULA agreement’s terms also apply to any Application update, upgrade, internet-based service, and support service for the Application. Whether you are acquiring Application directly from Booostr Technologies, Inc. or through Booostr Technologies, Inc. authorized reseller your electronic acceptance of this EULA agreement signifies that you have read, understand, acknowledge, and agree to be bound by this EULA agreement.</Text>
              <Text style={styles.smallText}>The terms “we”, “us” or “our” shall refer to Booostr Technologies, Inc.. The terms “you”, “your”, or “User” shall refer to any individual or entity who accepts this EULA agreement, uses our Application, or has access to our Application.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. may, in its sole and absolute discretion, change or modify this Agreement, and any policies or agreements which are incorporated herein, at any time, and such changes or modifications shall be effective immediately upon posting. Your use of thisApplication after such changes or modifications have been made shall constitute your acceptance of this EULA agreement as last revised.</Text>
              <Text style={styles.smallText}>BY DOWNLOADING /INSTALLING /USING THE APPLICATION YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THIS AGREEMENT. IF YOU DO NOT AGREE TO BE BOUND BY THIS EULA AGREEMENT AS LAST REVISED, DO NOT DOWNLOAD, INSTALL, USE (OR CONTINUE TO USE) OUR APPLICATION.</Text>
              <Text style={styles.SubHead}>ELIGIBILITY</Text>
              <Text style={styles.smallText}>Our Application is available only to Users who can form legally binding contracts under the applicablelaw.BydownloadingorusingthisApplication,yourepresentandwarrantthatyouare</Text>
              <Text style={styles.smallText}>(i) at least eighteen (18) years of age, (ii) otherwise recognized as being able to form legally binding contracts under applicable law, and (iii) are not a person barred from purchasing or using the Application e under the laws of the United States, California or other applicable jurisdiction.</Text>
              <Text style={styles.smallText}>If you are entering into this EULA agreement on behalf of a company or any corporate entity, you represent and warrant that you have the legal authority to bind such corporate entity to the terms and conditions contained in this EULA agreement, in which case the terms “you”, “your”, or “User” shall refer to such corporate entity. If you do not have such authority or if you do not agree with the terms and conditions of this EULA agreement, do not install or use the Application, and you must not accept this EULA agreement. If, after your electronic acceptance of this Agreement, Booostr Technologies, Inc. finds that you do not have the legal authority to bind such a corporate entity, you will be personally responsible for the obligations contained in this EULA agreement.</Text>
              <Text style={styles.SubHead}>LICENSE GRANT</Text>
              <Text style={styles.smallText}>Subject to the terms of this EULA Agreement Booostr Technologies, Inc. hereby grants you a personal, revocable, worldwide, non-exclusive, non-sublicensable, and non-transferable license to use the Booostr Technologies, Inc. Application on your own, non-commercial use devices in accordancewiththetermsofthisEULAagreement.TheApplicationisbeinglicensedtoyouand you hereby acknowledge that no title or ownership of the Application is being transferred or assigned to you and this EULA agreement is not to be construed as a sale of any rights of the Application.</Text>
              <Text style={styles.smallText}>You are permitted to load the Booostr Technologies, Inc. Application (for example on a mobile, tablet or laptop) under your control. You are responsible for ensuring your device meets the minimum requirements of the Booostr Technologies, Inc. Application.</Text>
              <Text style={styles.SubHead}>RESTRICTIONS</Text>
              <Text style={styles.smallText}>Without first obtaining the express written consent of Booostr Technologies, Inc., you may not assign your rights and obligations under this EULA agreement, or redistribute, encumber, sell,rent, lease, sublicense or in other way transfer your rights to the Application.</Text>
              <Text style={styles.smallText}>You are not permitted to:</Text>

              <Text style={styles.smallText}>1. edit, modify, alter, adapt, or otherwise change the whole or any part of the Booostr Technologies, Inc. Application nor permit the whole or any part of the Application to be combined with or become incorporated in any other Application or any software, nor decompile, disassemble or reverse engineer the Application or attempt to do any of thelisted actions,</Text>
              <Text style={styles.smallText}>2. copy, reproduce, duplicate, resell or distribute in any medium any part of the Application, except where expressly authorized by Booostr Technologies, Inc.,</Text>
              <Text style={styles.smallText}>3. remove or alter Booostr Technologies, Inc. trademarks or logos or legal notices included in the Application or related assets,</Text>
              <Text style={styles.smallText}>4. remove, disable, circumvent, or otherwise create or implement any workaround to any copy protection, rights management, or security features in or protecting the Application,</Text>
              <Text style={styles.smallText}>5. usetheservicetotrytogainunauthorizedaccesstoanyservice,data,accountornetwork by any means,</Text>
              <Text style={styles.smallText}>6. usetheApplicationinanywaywhichbreachesanyapplicablelocal,nationalor international law,</Text>
              <Text style={styles.smallText}>7. usetheApplicationforanypurposethatBooostrTechnologies,Inc.,considersisabreach of this EULA agreement.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. reserves the right to determine in its sole discretion what kind of conduct is considered to be in violation of the terms of this EULA agreement</Text>
              <Text style={styles.smallText}>By using our Application you acknowledge and agree that your use of the Application, including any content you submit, will comply with this EULA agreement and all applicable local, state, national and international laws, rules, and regulations.</Text>
              <Text style={styles.SubHead}> INTELLECTUAL PROPERTY</Text>
              <Text style={styles.smallText}>No part of this EULA agreement is or should be interpreted as a transfer of intellectual property rights. Booostr Technologies, Inc. shall retain ownership of the Application as originally downloaded by you and all subsequent downloads of the Application by you. The Application(and the copyright, and other intellectual property rights of whatever nature in the Application, including any modifications made thereto) are and shall remain the property of Booostr Technologies, Inc..</Text>
              <Text style={styles.smallText}>In addition to the general rules above, the provisions in this Section apply specifically to your use of Booostr Technologies, Inc. content used in the Application (Booostr Technologies, Inc.content). Booostr Technologies, Inc. content used in this Application, including without limitation the text, scripts, source code, API, graphics, photos, sounds, music, videos, and interactivefeatures and the trademarks, service marks, and logos contained therein, are owned by or licensed to Booostr Technologies, Inc. in perpetuity, and are subject to copyright, trademark, and/or patent protection.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. content is provided to you “as is”, “as available” and “with all faults” for your information and personal, non-commercial use only and may not be downloaded, copied, reproduced, distributed, transmitted, broadcast, displayed, sold, licensed, or otherwise exploitedfor any purposes whatsoever without the express prior written consent of Booostr Technologies, Inc..Norightorlicenseunderanycopyright,trademark,patentorotherproprietaryrightor license is granted by this EULA agreement</Text>
              <Text style={styles.SubHead}>COLLECTION AND USE OF YOUR INFORMATION</Text>
              <Text style={styles.smallText}>You acknowledge that when you download, install, or use the Application, Booostr Technologies, Inc. may use automatic means (including, for example, cookies and web beacons) to collect information about your Mobile Device and about your use of the Application. You also may be requiredtoprovidecertaininformationaboutyourselfasaconditiontodownloading,installing, or using the Application or certain of its features or functionality. All information we collect through or in connection with this Application is subject to our Privacy policy. By downloading, installing, using, and providing information to or through this Application, you consent to all actions taken by us with respect to your information in compliance with the Privacy Policy.</Text>
              <Text style={styles.SubHead}>UPDATES</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. may from time to time in its sole discretion develop and provide Application updates, which may include upgrades, bug fixes, patches, other error corrections, and/or new features (collectively, including related documentation, “Updates”). Updates may also modify or delete in their entirety certain features and functionality. You agree that Booostr Technologies, Inc. has no obligation to provide any Updates or to continue to provide or enableany particular features or functionality. Based on your Mobile Device settings, when your Mobile Device is connected to the internet either:</Text>
              <Text style={styles.smallText}>1. the Application will automatically download and install all available Updates; or</Text>
              <Text style={styles.smallText}>2. you may receive notice of or be prompted to download and install available Updates.</Text>
              <Text style={styles.smallText}>You shall promptly download and install all Updates and acknowledge and agree that the Application or portions thereof may not properly operate should you fail to do so. You further agree that all Updates will be deemed part of the Application and be subject to all terms and conditions of this Agreement.</Text>
              <Text style={styles.SubHead}> BOOOSTR TECHNOLOGIES, INC. USE OF USER CONTENT</Text>
              <Text style={styles.smallText}>The Application may allow you to create content such as videos, data, photographs, messages, graphics, text, and other information (“User Content”), and to share such User Content with Booostr Technologies, Inc. or with other applications, sites, including social networking sites, as you may designate.</Text>
              <Text style={styles.smallText}>The provisions in this Section apply specifically to Booostr Technologies, Inc. use of UserContent posted to or through the Application.</Text>
              <Text style={styles.smallText}>You shall be solely responsible for any and all of your User Content or User Content that is submitted by you, and the consequences of, and requirements for, distributing it. You agree that any User Content that you share does not and will not violate third-party rights of any kind, including and without limitation any Intellectual Property Rights or rights of publicity and privacy.</Text>
              <Text style={styles.smallText}>With Respect to User Content, by posting or publishing User Content to or through the Application, you authorize Company to use the intellectual property and other proprietary rightsin and to your User Content to enable inclusion and use of the User Content in the manner contemplated by this Application and this EULA agreement.</Text>
              <Text style={styles.smallText}>By creating User Content through Booostr Technologies, Inc. Application, you hereby grant Booostr Technologies, Inc. a worldwide, non-exclusive, royalty-free, sub-licensable, irrevocable, and transferable license to use, reproduce, distribute, prepare derivative works of, combine with other works, display, and perform your User Content in connection with this Application,including without limitation for promoting and redistributing all or part of this Application in any media formats and through any media channels without restrictions of any kind and without payment or other consideration of any kind, or permission or notification, to you or any thirdparty. You also hereby grant each User of this Application a non-exclusive license to access your User Content through this Application, and to use, reproduce, distribute, prepare derivative works of, combine with other works, display, and perform your User Content as permitted through the functionality of this Software and under this EULA agreement.</Text>
              <Text style={styles.smallText}>The above licenses granted by you in your User Content terminate within a commercially reasonable time after you remove or delete your User Content from this Application. You understand and agree, however, that Booostr Technologies, Inc. may retain (but not distribute, display, or perform) server copies of your User Content that have been removed or deleted. The above licenses granted by you in your User Content are perpetual and irrevocable.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. generally does not pre-screen User Content but reserves the right (but undertakes no duty) to do so and decide whether any item of User Content is appropriate and/or complies with this EULA agreement. Booostr Technologies, Inc. may remove any item of User Content if it violating this EULA agreement, at any time and without prior notice.</Text>
              <Text style={styles.SubHead}>USER SUBMISSIONS</Text>
              <Text style={styles.smallText}>With Respect to User Submissions, you acknowledge and agree that:</Text>
              <Text style={styles.smallText}>1. your User Submissions are entirely voluntary,</Text>
              <Text style={styles.smallText}>2. your User Submissions do not establish a confidential relationship or obligate Booostr Technologies, Inc. to treat your User Submissions as confidential or secret.</Text>
              <Text style={styles.smallText}>3. Booostr Technologies, Inc. has no obligation, either express or implied, to develop or use your User Submissions, and no compensation is due to you or to anyone else for any intentional or unintentional use of your User Submissions.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. shall own exclusive rights (including all intellectual property and other proprietary rights) to any User Submissions provided to the Booostr Technologies, Inc. and shallbe entitled to the unrestricted use and dissemination of any User Submissions posted to or through the Software for any purpose, commercial or otherwise, without acknowledgment orcompensation to you or to anyone else.</Text>
              <Text style={styles.SubHead}>DOWNLOADING  THE  APPLICATION  FROM   THE  APPLE   APP STORE</Text>
              <Text style={styles.smallText}>The following applies to the Application accessed through or downloaded from the Apple App Store (“App Store Sourced Application”):</Text>
              <Text style={styles.smallText}>1. You acknowledge and agree that (i) this EULA agreement is concluded between you and Booostr Technologies, Inc. only, and not Apple; and (ii) Booostr Technologies, Inc., not Apple, is solely responsible for the App Store Sourced Application and content thereof.Your use of the App Store Sourced Application must comply with the Apple App Store Terms of Service.</Text>
              <Text style={styles.smallText}>2. You will use the App Store Sourced Application only (i) on an Apple-branded product that runs iOS (Apple’s proprietary operating system software); and (ii) as permitted by the “Usage Rules” set forth in the Apple App Store Terms of Service.</Text>
              <Text style={styles.smallText}>3. You acknowledge that Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the App Store Sourced Application.</Text>
              <Text style={styles.smallText}>4. In the event of any failure of any App Store Sourced Application to conform to any applicable warranty, you may notify Apple, and Apple will refund the purchase price for the App Store Sourced Application to you and to the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App Store Sourced Application. As between Booostr Technologies, Inc. and Apple, any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty will be the sole responsibility of Booostr Technologies, Inc..</Text>
              <Text style={styles.smallText}>5. You and Booostr Technologies, Inc. acknowledge that, as between Booostr Technologies, Inc. and Apple, Apple is not responsible for addressing any claims you have or any claimsof any third party relating to the App Store Sourced Application in your possession and use of the App Store Sourced Application, including but not limited to (i) product liability claims; (ii) any claim that an App Store Sourced Application fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumerprotection or similar legislation.</Text>
              <Text style={styles.smallText}>6. You and Booostr Technologies, Inc. acknowledge that, in the event of any third party claim thatanAppStoreSourcedApplicationoryourpossessionanduseofthatAppStoreSource</Text>
              <Text style={styles.smallText}>7. Application infringes that third party’s intellectual property rights, as between Booostr Technologies, Inc. and Apple, Booostr Technologies, Inc., not Apple, will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim to the extent required by this EULA agreement.</Text>
              <Text style={styles.smallText}>8. You and Booostr Technologies, Inc., acknowledge and agree that Apple and its subsidiaries are third-party beneficiaries of this EULA agreement and that upon your acceptance of this EULA agreement, Apple will have the right (and will be deemed to have accepted the right) to enforce this EULA agreement.</Text>
              <Text style={styles.smallText}>9. By using the App Store Sourced Application you represent and warrant that (i) you are not located in a country that is subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a “terrorist supporting” country; and (ii) you are not listed on any U.S. Government list of prohibited or restricted parties.</Text>
              <Text style={styles.smallText}>10. Without limiting any other terms of this EULA agreement, you must comply with all applicable third-party terms of agreement when using the App Store Sourced Application.</Text>
              <Text style={styles.SubHead}>DISCLAIMER OF WARRANTIES</Text>
              <Text style={styles.smallText}>UNLESS OTHERWISE EXPLICITLY AGREED TO IN WRITING BY Booostr Technologies, Inc.,APPLICATIONISPROVIDED“ASIS”,“ASAVAILABLE”AND“WITHALL</Text>
              <Text style={styles.smallText}>FAULTS” AND DEFECTS AND Booostr Technologies, Inc., MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, IN FACT, OR IN LAW, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT, OTHER THAN AS SET FORTH IN THIS EULA AGREEMENT.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. MAKES NO WARRANTIES ABOUT (I) THE ACCURACY, COMPLETENESS, OR CONTENT ON THIS APPLICATION AND ASSUMES NOLIABILITY OR RESPONSIBILITY FOR THE SAME. Booostr Technologies, Inc. MAKES NO WARRANTIES THAT THE OPERATION OF THE APPLICATION WILL BE SECURE, ERROR-FREE, OR FREE FROM INTERRUPTION.</Text>
              <Text style={styles.smallText}>NO ORAL OR WRITTEN ADVICE PROVIDED BY Booostr Technologies, Inc. OR ANY AUTHORIZED REPRESENTATIVE OR THIRD PARTY SHALL CREATE A WARRANTY. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF, OR LIMITATIONS ON, IMPLIED WARRANTIES OR THE LIMITATIONS ON THE APPLICABLE STATUTORY RIGHTS OF A CONSUMER, SO SOME OR ALL OF THE ABOVE EXCLUSIONS AND LIMITATIONS MAY NOT APPLY TO YOU.</Text>
              <Text style={styles.smallText}>THE FOREGOING DISCLAIMER OF REPRESENTATIONS AND WARRANTIES SHALL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW AND SHALL SURVIVE ANY TERMINATION OR EXPIRATION OF THIS EULA AGREEMENT OR YOUR USE OF THIS SITE OR THE SERVICES FOUND AT THIS SITE.</Text>
              <Text style={styles.SubHead}>LIMITATION OF LIABILITY</Text>
              <Text style={styles.smallText}>TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, IN NO EVENTSHALL Booostr Technologies, Inc., ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND ALL THIRD-PARTY SERVICE PROVIDERS, BE LIABLE TO YOU OR ANY OTHER PERSON OR ENTITY FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER, INCLUDING ANY DAMAGES THAT MAY RESULT FROM (I) THIS AGREEMENT, (II) THE ACCURACY, COMPLETENESS,OR CONTENT ON THIS APPLICATION, (III) OR FROM THE FURNISHING, PERFORMANCE, INSTALLATION, OR USE OF THE APPLICATION, WHEATHER DUETOABREACHOFCONTRACT,BREACHOFWARRANTY,ORTHENEGLIGENCEOF</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. OR ANY OTHER PARTY, EVEN IF Booostr Technologies, Inc. IS ADVISED BEFOREHAND OF THE POSSIBILITY OF SUCH DAMAGES.</Text>
              <Text style={styles.smallText}>SOME JURISDICTIONS DO NOT ALLOW A LIMITATION OF LIABILITY FOR DEATH, PERSONAL INJURY, FRAUDULENT MISREPRESENTATIONS OR CERTAIN INTENTIONAL OR NEGLIGENT ACTS, OR VIOLATION OF SPECIFIC STATUTES, OR THELIMITATIONOFINCIDENTALORCONSEQUENTIALDAMAGES,SOSOMEOR</Text>
              <Text style={styles.smallText}>ALLOFTHEABOVELIMITATIONSOFLIABILITYMAYNOTAPPLYTOYOU.INNO</Text>
              <Text style={styles.smallText}>EVENT SHALL Booostr Technologies, Inc.’S TOTAL LIABILITY TO YOU FOR ALL DAMAGES (EXCEPT AS REQUIRED BY APPLICABLE LAW) EXCEED THE AMOUNT ACTUALLY PAID BY YOU FOR THE APPLICATION. THIS LIMITATION APPLIES, BUT IT IS NOT LIMITED TO ANYTHING RELATED TO THE APPLICATION, SERVICES, OR CONTENT MADE AVAILABLE THROUGH THE APPLICATION. YOU AGREE THAT THE PROVISIONS IN THIS EULA AGREEMENT THAT LIMIT LIABILITY ARE ESSENTIAL TERMS OF THIS EULA AGREEMENT.</Text>
              <Text style={styles.smallText}>THE FOREGOING LIMITATION OF LIABILITY SHALL APPLY TO THE FULLEST EXTENT PERMITTED BY LAW AND SHALL SURVIVE ANY TERMINATION OR EXPIRATION OF THIS EULA AGREEMENT.</Text>
              <Text style={styles.SubHead}>INDEMNITY</Text>
              <Text style={styles.smallText}>You agree to protect, defend, indemnify and hold harmless Booostr Technologies, Inc. and its officers, directors, employees, agents from and against any and all claims, demands, costs, expenses, losses, liabilities, and damages of every kind and nature (including, without limitation, reasonable attorneys’ fees) imposed upon or incurred by Booostr Technologies, Inc. directly or indirectly arising from (i) your use of the Application; (ii) your violation of any provision of this Agreement; and/or (iii) your violation of any third-party right, including without limitation any intellectual property or other proprietary rights. The indemnification obligations under this section shall survive any termination or expiration of this Agreement or your use of Application.</Text>
              <Text style={styles.SubHead}>AVAILABILITY OF APPLICATION</Text>
              <Text style={styles.smallText}>Subject to the terms and conditions of this Agreement and our policies, we shall use commercially reasonable efforts to attempt to provide this Application on 24/7 basis. You acknowledge andagree that from time to time this Application may be inaccessible for any reason including, but not limited to, periodic maintenance, repairs or replacements that we undertake from time to time, or other causes beyond our control including, but not limited to, interruption or failure of telecommunication or digital transmission links or other failures.</Text>
              <Text style={styles.smallText}>You acknowledge and agree that we have no control over the availability of this Application on a continuous or uninterrupted basis and that we assume no liability to you or any other party with regard thereto.</Text>
              <Text style={styles.SubHead}>TERMINATION</Text>
              <Text style={styles.smallText}>This EULA agreement is effective from the date you first download, install or use the Application and shall continue until terminated. You may terminate this Agreement by deleting theApplication and all copies thereof from your Mobile Device.</Text>
              <Text style={styles.smallText}>This EULA agreement will also be terminated immediately if you fail to comply with any term of this EULA agreement. Upon such termination, the licenses granted by this EULA agreement will immediately terminate and you agree to stop all access and use of the Application. The provisions that by their nature continue and survive will survive any termination of this EULA agreement.</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. reserves the right to cease offering or providing Application at any time, for any or no reason, and without prior notice. Although Booostr Technologies, Inc. makes a great effort to maximize the lifespan of the Application, it might be, that the Application we offer will be discontinued. If that is the case, this EULA agreement will be terminated, and the Application will no longer be supported by Booostr Technologies, Inc..</Text>
              <Text style={styles.smallText}>Upon termination, all rights granted to you under this EULA agreement will also terminate andyou must cease all use of the Application and delete all copies of the Application from yourMobile Device and account.</Text>
              <Text style={styles.SubHead}>COMPLIANCE WITH LOCAL LAWS</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc. makes no representation or warranty that all the content available on this Application is appropriate in every country or jurisdiction and use of this Application from countries or jurisdictions where its content is illegal is prohibited. Users who choose to use this Software are responsible for compliance with all local laws, rules, and regulations.</Text>
              <Text style={styles.SubHead}>GOVERNING LAW</Text>
              <Text style={styles.smallText}>This EULA agreement is governed by and construed in accordance with the internal laws of the State of [STATE Q9] without giving effect to any choice or conflict of law provision or rule. Any legal suit, action, or proceeding arising out of or related to this EULA agreement or theApplication shall be instituted exclusively in the federal courts of the United States or the courtsof the State of California. You waive any and all objections to the exercise of jurisdiction overyou by such courts and to venue in such courts.</Text>
              <Text style={styles.SubHead}>TITLES AND HEADINGS</Text>
              <Text style={styles.smallText}>The titles and headings of this EULA agreement are for convenience and ease of reference only and shall not be utilized in any way to construe or interpret the agreement of the parties as otherwise set forth herein.</Text>
              <Text style={styles.SubHead}>LIMITATION OF TIME TO FILE CLAIMS</Text>
              <Text style={styles.smallText}>ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE ARISING OUT OF OR RELATING TOTHISAGREEMENTORTHEAPPLICATIONMUSTBECOMMENCEDWITHINONE</Text>
              <Text style={styles.smallText}>(1)YEARAFTERTHECAUSEOFACTIONACCRUESOTHERWISESUCHCAUSEOF ACTION OR CLAIM IS PERMANENTLY BARRED.</Text>
              <Text style={styles.SubHead}>SEVERABILITY</Text>
              <Text style={styles.smallText}>Each covenant and agreement in this EULA agreement shall be construed for all purposes to be a separate and independent covenant or agreement. If a court of competent jurisdiction holds any provision (or portion of a provision) of this EULA agreement to be illegal, invalid, or otherwise unenforceable, the remaining provisions (or portions of provisions) of this EULA agreement shall not be affected thereby and shall be found to be valid and enforceable to the fullest extent permitted by law.</Text>
              <Text style={styles.SubHead}>CONTACT INFORMATION</Text>
              <Text style={styles.smallText}>If you have any questions about this EULA agreement, please contact us by email or regular mail at the following address:</Text>
              <Text style={styles.smallText}>Booostr Technologies, Inc.</Text>
              <Text style={styles.smallText}>19600ToyonDr.,PennValley,CA95946 support@booostr.co</Text>
            </View>
            {isButtonVisible && (
              <PaperButton
                mode="contained"
                style={styles.button}
                onPress={handleAgreement}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </PaperButton>
            )}
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
