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




//Context
import { AccountInfo, AuthContext, PatchContext } from "./AuthContext";


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
import { AccountScreen } from './Screens/AccountScreen';

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

import { createNativeStackNavigator } from '@react-navigation/native-stack';
const AccountScreenStack = createNativeStackNavigator();

function DetailsScreen({navigation}) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Details!</Text>
      <Button title="Return" onPress={()=> navigation.navigate('default')}></Button>
    </View>
  );
}
function AccountStack(){
  return (

      <AccountScreenStack.Navigator>
            <AccountScreenStack.Screen  name="default" options={{headerShown: false}} component={AccountScreen} />
          <AccountScreenStack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
              <AccountScreenStack.Screen name="login" >
              {(props) => <AuthScreen {...props} isModal={true} />}
              </AccountScreenStack.Screen>
          </AccountScreenStack.Group>
      </AccountScreenStack.Navigator>

  )
}
export default function App() {

  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AccountInfo[]>(null);
  const [gunData, setGunData] = useState<any>({gunData: null});

  
  //Check if we need to update the JSON
  useEffect(()=>{
    AsyncStorage.getItem('@auth').then(token =>
      {setAuth(JSON.parse(token));})
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
                  
                  AsyncStorage.setItem("@apibranch", newBranch.data.branch)
                  AsyncStorage.setItem("@weaponskins", JSON.stringify(skin))
                  setGunData(skin)
                  setLoading(false)
                }catch(e){
                  //TODO
                  console.log(e)
                }
              }
            }
        )
      }else{//Version is not new.
        AsyncStorage.getItem("@weaponskins").then(weaponskin=> setGunData(JSON.parse(weaponskin))).then(()=>{setLoading(false)})

      }
    })

    
    
      
  }, [])

  
  if (loading){
    return <Splash />;
  }

  if (!auth) {
    return (
      <AuthContext.Provider value={{ auth, setAuth }}>
        <AuthScreen  navigation={null}/>
      </AuthContext.Provider>
    )
  }

  return (
    <PatchContext.Provider value={{gunData: gunData}} >
    <AuthContext.Provider value={{ auth, setAuth }}>
      <NavigationContainer>
        <StatusBar style='light' />
        <Tab.Navigator screenOptions={{
          headerShown: false,

          tabBarActiveBackgroundColor: '#464646',
          tabBarInactiveBackgroundColor: '#333333',
          tabBarActiveTintColor: '#ffffff',
          tabBarStyle: { borderTopWidth: 0 , backgroundColor: "#333333"},
          
          
        }}  >

          <Tab.Screen name="Shop" 
            component={ShopScreen} 
            options={{
              tabBarIcon: ({ color, size }) => (
                 <Shoppingcartsvg color={color} />
                ),
              }} 
          />
          <Tab.Screen name="Accounts" component={AccountStack} options={{
            tabBarIcon: ({ color, size }) => (
              <Listsvg color={color} />
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
    </PatchContext.Provider>

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


