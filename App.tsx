import React, { useContext, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, FlatList, TextInput, TouchableHighlight, Button, Touchable, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useState } from 'react';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

//Notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      //TODO Handle.
      //alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({experienceId:'@donahue/ValorantShop'})).data;
    
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}


//Context
import { AuthContext } from "./AuthContext";


//Screens
import { AuthScreen } from "./Screens/AuthScreen"
import { Settings } from './Screens/SettingsScreen';
import { ShopScreen } from './Screens/ShopScreen';

//Constants and Images
import { BASE_URL, tierColors } from './Constants';
import Listsvg from "./assets/list.svg";
import Settingssvg from "./assets/settings.svg";
import Shoppingcartsvg from "./assets/shopping-cart.svg";
import Heartsvg from "./assets/heart.svg";
import AsyncStorage from '@react-native-async-storage/async-storage';

let skins = require('./assets/skins.json');

function symmetricDifference(setA, setB) {
  const _difference = new Set(setA);
  for (const elem of setB) {
    if (_difference.has(elem)) {
      _difference.delete(elem);
    } else {
      _difference.add(elem);
    }
  }
  return _difference;
}


function Item({ skinData, selected, onPress }) {

  return <TouchableHighlight onPress={onPress} activeOpacity={0.7} underlayColor={'transparent'}>
    <View style={{ height: 80, width: '100%', padding: 10, borderRadius: 6, backgroundColor: tierColors[skinData.contentTierUuid], marginVertical: 8, marginHorizontal: 0}}>
      <Text style={{ position: 'absolute', top: 5, left: 5, textTransform: 'uppercase', fontWeight: '600', color: 'white' }}>{skinData.displayName}</Text>
      <Image source={{ uri: skinData.levels[0].displayIcon }} style={{ width: '66%', height: 55, borderColor: 'red', position: 'absolute', right: 5, bottom: 5 }} />
      
      <Heartsvg color={"#ffffff"} fill={selected ? "white" : "none"} style={{position: 'absolute', bottom: 5, left: 5}}/>
      
    </View>
  </TouchableHighlight>
}
function Filter() {

  const {auth} = useContext(AuthContext);
  const [filter, setFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [newSelectedItems, setNewSelectedItems] = useState( new Set());
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(()=>{
    fetch(BASE_URL + "/api/favorites", {method: 'POST', body: JSON.stringify({id: auth})}).then(r=>r.json().then(j =>{ 
  
    if (j.success){
        let temp = new Set();
        for (const item of j.favorites){
          temp.add(item.gun_uuid)
        }
        setSelectedItems(temp)
      }
    }));
  }, [])

  return (
    <View style={styles.container}>


      <View style={{width :"100%", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' , marginBottom: 12}}>
        <TextInput
          style={{flex: 1, width: 200,  borderRadius: 3, padding: 10, backgroundColor: "white", color: "black" }}
          placeholder="Search"
          onChangeText={newText => setFilter(newText.toLowerCase())}
          
        />
        <TouchableHighlight style={{marginLeft: 6}} onPress={() => {(setFilterFavorites(!filterFavorites))}} activeOpacity={0.7} underlayColor={'transparent'} >
          <Heartsvg  stroke={'white'} fill={filterFavorites ? 'white': 'none'} width={40} height={40} />
        </TouchableHighlight>
      </View>
      <TouchableWithoutFeedback onPress={()=>{Keyboard.dismiss()}}>
      <View style={{ width: '100%' }}>
        <FlatList
          ListEmptyComponent={<View><Text style={{color:"white"}}>No matching skins</Text></View>}
          data={skins.data.filter(skin => skin.displayName.toLowerCase().includes(filter) && (!filterFavorites || (selectedItems.has(skin.uuid) !== newSelectedItems.has(skin.uuid)) ) )}

          renderItem={({ item }) => <Item skinData={item}
            onPress={() => {
              const updated = new Set(newSelectedItems);
              newSelectedItems.has(item.uuid) ? updated.delete(item.uuid) : updated.add(item.uuid);
              setNewSelectedItems(updated);
            }
            }
            selected={selectedItems.has(item.uuid) !== newSelectedItems.has(item.uuid)} />}
          keyExtractor={item => item.uuid}
        />
      </View>
      </TouchableWithoutFeedback>
      {newSelectedItems.size != 0 &&
      <View style={{position: 'absolute', width: 250 , bottom: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{width: 100, paddingVertical:5, backgroundColor: "grey", borderRadius: 5}}>
          <Button color={"white"} title="Save" onPress={()=>{
            const updatedSet = symmetricDifference(newSelectedItems, selectedItems);
            //TODO notify  update failure/success
            fetch(BASE_URL + "/api/favorites", {method: 'PUT', body: JSON.stringify({id: auth, favorites: Array.from(updatedSet.values())})})
            setSelectedItems(updatedSet);
            setNewSelectedItems(new Set())}} />
        </View>
        <View style={{width: 100, paddingVertical:5, backgroundColor: "grey", borderRadius: 5}}>
          <Button color={"white"} title="Cancel" onPress={()=>{setNewSelectedItems(new Set())}}/>
        </View>
      </View>
      }
    </View>
  );
}

function Splash(){
  return <View></View>
}
const Tab = createBottomTabNavigator();
export default function App() {

  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<{access_token: string, region: string} | null>(null);
  const [gunData, setGunData] = useState({});

  useEffect(() => {
    AsyncStorage.getItem('@auth').then(token =>
      { setAuth(JSON.parse(token)); setLoading(false)})
  }, []);

  //Check if we need to update the JSON
  useEffect(()=>{
    AsyncStorage.getItem("@apibranch").then(async branch =>{
      //Check API version
      const newBranch  = await (await fetch('https://valorant-api.com/v1/version')).json() as {status: number, data: {
        manifestId: string,
        branch: string,
        version: string,
        buildVersion: string,
        engineVersion: string,
        riotClientVersion: string,
        riotClientBuild: string,
        buildDate: string} } 
    
      //If version is new
      if(newBranch.status == 200 && newBranch.data.branch != branch){
        fetch('https://valorant-api.com/v1/weapons/skins').then(
            async e=>{
              //Get data then resort
              if(e.status == 200){
                const skin: { [key: string]: any } = {}
                const data = await e.json()
                data.data.forEach((element: any) => {
                    skin[element.levels[0].uuid] = {
                        displayName: element.displayName,
                        themeUuid: element.themeUuid,
                        contentTierUuid: element.contentTierUuid,
                        displayIcon: element.levels[0].displayIcon,
                    }
                
                });

                try{
                  
                  AsyncStorage.setItem("@skins", JSON.stringify(skin) )
                  AsyncStorage.setItem("@apibranch", newBranch.data.branch)
                  setGunData(skin)
                }catch(e){
                  //TODO
                }
                console.log("Updated!")
              }
            }
        )
      }else{//Version is not new.
        console.log("Version is not new")
        fetch('https://valorant-api.com/v1/weapons/skins').then(
            async e=>{
              //Get data then resort
              if(e.status == 200){
                const skin: { [key: string]: any } = {}
                const data = await e.json()
                data.data.forEach((element: any) => {
                    skin[element.levels[0].uuid] = {
                        displayName: element.displayName,
                        themeUuid: element.themeUuid,
                        contentTierUuid: element.contentTierUuid,
                        displayIcon: element.levels[0].displayIcon,
                    }
                
                });

                try{
                  //console.log(skin)
                  AsyncStorage.setItem("@skins", JSON.stringify(skin) )
                  AsyncStorage.setItem("@apibranch", newBranch.data.branch)
                  setGunData(skin)
                }catch(e){
                  //TODO Diagnostic

                }
              }
            })

      }
    })

    
  }, [])

  
  if (loading){
    return <Splash />;
  }

  if (!auth) {
    return (
      <AuthContext.Provider value={{ auth, setAuth }}>
        <AuthScreen />
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <NavigationContainer>
        <StatusBar style='light' />
        <Tab.Navigator screenOptions={{
          headerShown: false,
          tabBarActiveBackgroundColor: '#464646',
          tabBarInactiveBackgroundColor: '#333333',
          tabBarActiveTintColor: '#ffffff',
          tabBarStyle: { borderTopWidth: 0 }
        }}  >

          <Tab.Screen name="Shop" component={ShopScreen} initialParams={{gunData: gunData}} options={{
            tabBarIcon: ({ color, size }) => (
              <Shoppingcartsvg color={color} />
            ),
          }} />
          {/* <Tab.Screen name="Favorites" component={Filter} options={{
            tabBarIcon: ({ color, size }) => (
              <Listsvg color={color} />
            ),
          }} /> */}
          <Tab.Screen name="Settings" component={Settings} options={{
            tabBarIcon: ({ color, size }) => (
              <Settingssvg color={color} />
            ),
          }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1B1B',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 30,
  },
  gunCardWrapper: {
    flex: 1,
    width: '100%',
  }
});


