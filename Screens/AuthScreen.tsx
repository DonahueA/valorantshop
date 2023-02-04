import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useState } from "react";
import { Keyboard, Text, View, Image, TextInput, Button } from "react-native";
import { AuthContext } from "../AuthContext";
import { BASE_URL } from "../Constants";



export function AuthScreen(){
  const { setAuth } : any = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [error, setError] = useState('');
  return (<View style={{width: '100%', height: '100%', backgroundColor: "#1B1B1B", padding:30, paddingTop: 60}}>
      <StatusBar style='light'/>

    <View style={{flexDirection: 'row', alignItems: 'flex-end',}}>
      <Image source={require("../assets/shopping-cart-white.png")}  style={{width: 100, height: 100}}/>
      <View style={{marginLeft: 8}}>
        <Text style={{color: 'white', fontSize: 40, fontWeight: '700', }}>VALORANT</Text>
        <Text style={{color: '#EB0029', fontSize: 40, fontWeight: '700'}}>Shop</Text>
      </View>
    </View> 
     <View style={{marginTop: 16}}>
      <TextInput placeholder='Username' onChangeText={text => setUsername(text)} autoCorrect={false} autoComplete='username' autoCapitalize='none' style={{padding: 20, backgroundColor: 'white', borderRadius: 3}} />
      <TextInput placeholder='Password' onChangeText={text => setPassword(text)} secureTextEntry={true} autoCorrect={false} autoComplete='password' style={{padding: 20, backgroundColor: 'white', marginTop: 16, borderRadius: 3}} />
      <View style={{height: 14, marginTop: 4}}>
        {error && <Text style={{color: 'red',}}>{error}</Text>}
      </View>
      
      <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{backgroundColor:'#D9D9D9', borderRadius: 3}} >
          <Button onPress={()=>{Keyboard.dismiss()}} title="NA" color="#1B1B1B" />
        </View>
        <View style={{backgroundColor: loggingIn ? '#a16869' : '#D13639',  width: 100, borderRadius: 3}} >
          <Button onPress={async ()=>{
            Keyboard.dismiss();
            
            const servResponse = fetch("http://192.168.0.116:3000/api/login", {method: 'POST', body: JSON.stringify({username: username ,password: password})})
            setLoggingIn(true);
            let response =  await (await servResponse).json();
            setLoggingIn(false);

            if(response.success){
              AsyncStorage.setItem('@token', response.token)
              setAuth(response.token)
              //store token
            }else{
              setError(response.reason)
            }
            }} title="Login" color="#FFFF"  />
        </View>
        
      </View>
      
    </View>
  </View>);
}