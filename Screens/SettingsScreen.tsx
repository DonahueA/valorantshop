import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext } from "react";
import { Text, View, Button } from "react-native";
import { AuthContext } from "../AuthContext";


export function Settings(){
    const {setAuth} : any = useContext(AuthContext);
    return <View style={{   alignItems: "center", justifyContent: "center",  backgroundColor: '#1B1B1B', flex: 1}}>
      {/* <Text style={{color: 'white', fontSize:24}}>Account Settings</Text> */}
      <View style={{borderWidth: 1, borderColor: '#D13639', marginTop: 10, width: 150, borderRadius: 3}}>
        <Button title='Sign Out' color={"white"} onPress={()=>{setAuth(null);AsyncStorage.setItem('@token', '') }} />
      </View>
    </View>
}