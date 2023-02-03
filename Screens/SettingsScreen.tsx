import React, { useContext } from "react";
import { View, Button } from "react-native";
import { AuthContext } from "../AuthContext";


export function Settings(){
    const {setAuth} : any = useContext(AuthContext);
    return <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
      <Button title='Sign Out' onPress={()=>{setAuth(null)}} />
    </View>
}