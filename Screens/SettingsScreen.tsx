import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import { Text, View, Button, Alert } from "react-native";
import { AuthContext } from "../AuthContext";
import DropDownPicker from 'react-native-dropdown-picker';

import { cookieReauth } from "../api";

import * as Notifications from 'expo-notifications';



export function Settings(){
    const {auth, setAuth} : any = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('NEVER');

    useEffect(()=>{
      AsyncStorage.getItem('@notification_reference').then(notification_reference => { if(notification_reference) {setValue(notification_reference);} })
    }, [])
    
    return <View style={{   alignItems: "center", justifyContent: "space-around",  backgroundColor: '#1B1B1B', flex: 1}}>

      <View style={{maxWidth:250, zIndex: 1, elevation: 1}}>
        <View style={{width: "100%",flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
          <Text style={{color: '#ffffff', fontSize: 18}}>Notifications</Text>
          <View style={{width: 120}}>
          <DropDownPicker style={{width: 120, zIndex: 2, elevation: 2}}
          open={open}
          value={value}
          setOpen={setOpen}
          setValue={setValue}
          onSelectItem={async (item)=>{
            if(item.value == "NEVER"){
              AsyncStorage.setItem('@notification_reference', item.value)

              Notifications.cancelAllScheduledNotificationsAsync();
            }
            if(item.value == "ALWAYS"){
              let result = await Notifications.getPermissionsAsync();
              if(result.canAskAgain){
                result = await Notifications.requestPermissionsAsync()
              }
              if (!result.granted && !result.canAskAgain) {
                Alert.alert("Missing permissions for notifications", "You must enable notifications under Settings")
                setValue("NEVER")
              }else if(result.granted){ 
                AsyncStorage.setItem('@notification_reference', item.value)
                Notifications.cancelAllScheduledNotificationsAsync();
                Notifications.scheduleNotificationAsync({
                  content: {
                    title: 'Your shop has refreshed!',
                  },
                  trigger: {
                    timezone: 'UTC',
                    hour: 0,
                    minute: 0,
                    repeats:true
                  },
                });
              }else{
                //Should never reach here.
                setValue("NEVER");
              }
            }
          }}
          items={[
            {label: 'Daily', value: 'ALWAYS'},
            // {label: 'Favorites', value: 'FAVORITES'},
            {label: 'Off', value: 'NEVER'}
          ]}
          />

          </View>
        </View>
      </View>
      <View >
        {/* <View style={{borderWidth: 1, borderColor: '#888888', marginTop: 10, width: 150, borderRadius: 3}}>
          <Button title='Delete Account' color={"#888888"} onPress={()=>{setAuth(null);AsyncStorage.setItem('@token', '') }} />
        </View> */}
        <View style={{borderWidth: 1, borderColor: '#D13639', marginTop: 10, width: 150, borderRadius: 3}}>
          <Button title='Sign Out' color={"white"} onPress={()=>{setAuth(null);AsyncStorage.setItem('@token', '') }} />
          {/* <Button title='Delete AsyncSTorage' color={"white"} onPress={()=>{setAuth(null);AsyncStorage.clear() }} />
          <Button title='Get AsyncStorage' color={"white"} onPress={()=>{AsyncStorage.getItem('@auth').then(r=>console.log(r)) }} />
          <Button title='Cookie Reauth' color={"white"} onPress={()=>{
            if(auth){
              cookieReauth(auth[0].cookie)
            }
            }} /> */}

        </View>
      </View>
    </View>
}