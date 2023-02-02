import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Image, FlatList, TextInput, TouchableHighlight } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {useEffect, useState} from 'react';

import { Picker } from '@react-native-community/picker'
import { SafeAreaProvider } from 'react-native-safe-area-context';



let skins = require('./assets/skins.json');

function getSecondsToRefresh(){

  let now= new Date()

  let refreshDate = new Date(now)
  refreshDate.setUTCHours(0, 0, 0)
  if(refreshDate - now < 0){
    refreshDate.setUTCDate(now.getUTCDate() + 1);
  }
  
  const seconds = (refreshDate - now)/1000;

  return seconds;
}
const tierImages = {
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25' : require('./assets/0cebb8be-46d7-c12a-d306-e9907bfc5a25.png'),
  'e046854e-406c-37f4-6607-19a9ba8426fc' : require('./assets/e046854e-406c-37f4-6607-19a9ba8426fc.png'),
  '60bca009-4182-7998-dee7-b8a2558dc369' : require('./assets/60bca009-4182-7998-dee7-b8a2558dc369.png'),
  '12683d76-48d7-84a3-4e09-6985794f0445'  : require('./assets/12683d76-48d7-84a3-4e09-6985794f0445.png'),
  '411e4a55-4e59-7757-41f0-86a53f101bb5' : require('./assets/411e4a55-4e59-7757-41f0-86a53f101bb5.png')
}

const tierColors ={
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25' : '#009a84',
  'e046854e-406c-37f4-6607-19a9ba8426fc' : '#574517',
  '60bca009-4182-7998-dee7-b8a2558dc369' : '#341b26',
  '12683d76-48d7-84a3-4e09-6985794f0445' : '#1c2a37',
  '411e4a55-4e59-7757-41f0-86a53f101bb5' : '#fad563'
}
function GunComponent({displayName, themeUuid, contentTierUuid, displayIcon} ){

  //console.log(displayName, themeUuid, contentTierUuid, displayIcon)
  return <View style={[gunCard.gunCard,     {backgroundColor: tierColors[contentTierUuid]},]}>

    <View style={{ position: 'absolute', top: 10, right: 10}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image source={{uri: "https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png"}} style={{width: 16, height: 16}}/>
        
        <Text style={{color: 'white', alignSelf: 'flex-end'}}>3,550</Text>
        <Image source={tierImages[contentTierUuid]} style={{width: 16, height: 16}} />
      </View>
    </View>

    

    <View style={{alignSelf: 'center', width: '100%'}} >
      <Image source={{uri: `https://media.valorant-api.com/themes/${themeUuid}/displayicon.png`}}  style={{left: 50, top: -50 ,width: 200, height: 200, position: 'absolute', opacity: 0.1}}/>
      <View style={{ transform: [{scale: 0.7},{rotate: '45deg'}]}}>
      <Image  source={{uri: displayIcon}} style={{width: 300, height:100}} />
      </View>
    </View>
    
    <View style={{maxWidth: 100, position: 'absolute', bottom: 10, left: 10}}>
    <Text style={{color: 'white', textTransform: 'uppercase', fontWeight: '600' }}>{displayName}</Text>
    </View>
  </View>
}

const gunCard = StyleSheet.create({
  gunCard: {
    marginTop: 10,

    color: 'white',
    height: 150,
    overflow: 'hidden',
    padding: 5,
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  }
})

function secondsToHHMMSS(seconds){

  const hours = String(Math.floor((seconds / (60 * 60)))).padStart(2, '0')
  const minutes = String(Math.floor((seconds / 60) % 60)).padStart(2, '0')
  const seconds_r = String(seconds%60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds_r}`
}
function ShopScreen() {
  let shop_guns = skins.data.slice(20,28)

  let [secondsToRefresh, setSecondsToRefresh] = useState(getSecondsToRefresh());
  useEffect(()=>{
    let timer = setInterval(()=>{
      setSecondsToRefresh(secondsToRefresh-1);
    }, 1000)
    return ()=>clearTimeout(timer);
  })

  return (
    <View style={styles.container}>
      <Text style={{alignSelf: 'flex-start', color: 'white'}}>Resets in {secondsToHHMMSS(secondsToRefresh)}</Text>
      <ScrollView style={styles.gunCardWrapper}>
        {shop_guns.map((f, index)=> <GunComponent key={index} contentTierUuid={f.contentTierUuid} displayIcon={f.displayIcon} displayName={f.displayName} themeUuid={f.themeUuid} />)}
      </ScrollView>
    </View>
  );
}

function Item({skinData, selected, onPress}){

  return  <TouchableHighlight onPress={onPress}>
  <View style={{height: 80, width: '100%', padding: 10, borderRadius: 6,  backgroundColor: tierColors[skinData.contentTierUuid], marginVertical: 8, marginHorizontal: 0, borderColor: selected ? "white" : tierColors[skinData.contentTierUuid], borderWidth: 2}}>
    <Text style={{position: 'absolute', top:5, left: 5, textTransform: 'uppercase', fontWeight: '600', color: 'white'}}>{skinData.displayName}</Text>
    <Image source={{url: skinData.displayIcon}}  style={{width: '66%', height: 55, borderColor: 'red', position: 'absolute', right: 5, bottom: 5}}/>
  </View>
  </TouchableHighlight>
}
function Settings() {

  const [filter, setFilter] = useState('smite');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [notificationSetting, setNotificationSetting] = useState("never");


  return (
    <View style={styles.container}>
      {/* <Picker selectedValue={notificationSetting} onValueChange={(itemValue, itemIndex) =>setNotificationSetting(itemValue)}>
        <Picker.Item label="Never" value="never" />
        <Picker.Item label="Shop Refresh" value="shop-refresh" />
        <Picker.Item label="Selected Guns" value="selected-guns" />
      </Picker> */}
      <TextInput
        style={{ width:200, padding:10, marginBottom: 12, backgroundColor: "white", color: "black"}}
        placeholder="Search"
        onChangeText={newText => setFilter(newText.toLowerCase())}
        
      />
      <View style={{width: '100%'}}>
      <FlatList
        data={skins.data.filter(skin=>skin.displayName.toLowerCase().includes(filter))}
        selected={{}}
        renderItem={({item}) => <Item skinData={item}
          onPress={()=>{
            const newSelected = new Set(selectedItems);
            newSelected.has(item.uuid) ? newSelected.delete(item.uuid) : newSelected.add(item.uuid);
            setSelectedItems(newSelected);
            }
          }
          selected={selectedItems.has(item.uuid)} />}
        keyExtractor={item => item.uuid}
      />
      </View>
    </View>
  );
}



const Tab = createBottomTabNavigator();

export default function App() {
  
  const [auth, notAuth] = useState(false);

  if(auth){
    return (
      <View>
        <Text>Auth Screen</Text>
      </View>
    )
  }
  return (
    <NavigationContainer>
      <StatusBar style='light'/>
      <Tab.Navigator screenOptions={{headerShown: false}} >
        
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </NavigationContainer>

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
