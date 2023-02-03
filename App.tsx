import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, FlatList, TextInput, TouchableHighlight } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {useState} from 'react';
import { AuthContext } from "./AuthContext";




import {AuthScreen} from "./Screens/AuthScreen"
import  {Settings}  from './Screens/SettingsScreen';

import React from 'react';
import { ShopScreen } from './Screens/ShopScreen';
import { tierColors } from './Constants';
let skins = require('./assets/skins.json');



function Item({skinData, selected, onPress}){

  return  <TouchableHighlight onPress={onPress}>
  <View style={{height: 80, width: '100%', padding: 10, borderRadius: 6,  backgroundColor: tierColors[skinData.contentTierUuid], marginVertical: 8, marginHorizontal: 0, borderColor: selected ? "white" : tierColors[skinData.contentTierUuid], borderWidth: 2}}>
    <Text style={{position: 'absolute', top:5, left: 5, textTransform: 'uppercase', fontWeight: '600', color: 'white'}}>{skinData.displayName}</Text>
    <Image source={{uri: skinData.levels[0].displayIcon}}  style={{width: '66%', height: 55, borderColor: 'red', position: 'absolute', right: 5, bottom: 5}}/>
  </View>
  </TouchableHighlight>
}
function Filter() {

  const [filter, setFilter] = useState('');
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
  
  const [auth, setAuth] = useState<string | null>('asdffdsf');

  if(!auth){
    return (
      <AuthContext.Provider value={{auth, setAuth}}>
        <AuthScreen />
      </AuthContext.Provider>
    )
  }
  return (
    <AuthContext.Provider value={{auth, setAuth}}>
    <NavigationContainer>
      <StatusBar style='light'/>
      <Tab.Navigator screenOptions={{headerShown: false}} >
        
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Filter" component={Filter} />
        <Tab.Screen name="Settings" component={Settings} />
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
