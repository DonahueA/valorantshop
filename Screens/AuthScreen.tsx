import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useState } from "react";
import { Keyboard, Text, View, Image, TextInput, Button } from "react-native";
import { AuthContext } from "../AuthContext";

import { authRequest, getEntitlement, getMMR, getPuuid, getRegion, mfaRequest } from "../api";






export function AuthScreen({isModal, navigation} : {navigation: any, isModal? : boolean}){
  const { auth, setAuth }  = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState<"LOGIN" | "MFA">("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const [error, setError] = useState('');
  return (<View style={{width: '100%', height: '100%', backgroundColor: "#1B1B1B", padding:30, paddingTop: 60}}>
      <StatusBar style='light'/>

    {isModal && 
      <View>
        <Text style={{color: 'white', fontSize: 32, fontWeight: '700', }}>Add an account</Text>
        
      </View>
    }
    {!isModal && 
    <View style={{flexDirection: 'row', alignItems: 'flex-end',}}>
      <Image source={require("../assets/shopping-cart-white.png")}  style={{width: 100, height: 100}}/>
      <View style={{marginLeft: 8}}>
        <Text style={{color: 'white', fontSize: 40, fontWeight: '700', }}>VALORANT</Text>
        <Text style={{color: '#EB0029', fontSize: 40, fontWeight: '700'}}>Shop</Text>
      </View>
    </View> 
    }
    { loggingIn == "LOGIN" &&   
     <View style={{marginTop: 16}}>
      <TextInput placeholder='Username' onChangeText={text => setUsername(text)} autoCorrect={false} autoComplete='username' autoCapitalize='none' style={{padding: 20, backgroundColor: 'white', borderRadius: 3}} />
      <TextInput placeholder='Password' onChangeText={text => setPassword(text)} secureTextEntry={true} autoCorrect={false} autoComplete='password' style={{padding: 20, backgroundColor: 'white', marginTop: 16, borderRadius: 3}} />
      <View style={{height: 14, marginTop: 4}}>
        {error && <Text style={{color: 'red',}}>{error}</Text>}
      </View>
      
      <View style={{ marginTop: 16, flexDirection: 'row-reverse', justifyContent: 'space-between'}}>
        {/* <View style={{backgroundColor:'#D9D9D9', borderRadius: 3}} > Region select?
          <Button onPress={()=>{Keyboard.dismiss()}} title="NA" color="#1B1B1B" />
        </View> */}
        <View style={{backgroundColor: isLoading ? '#a16869' : '#D13639',  width: 100, borderRadius: 3}} >
          <Button onPress={async ()=>{
            Keyboard.dismiss();
            /*
            const servResponse = fetch(BASE_URL + "/api/login", {method: 'POST', body: JSON.stringify({username: username ,password: password})})
            let response =  await (await servResponse).json();
            */
            try{
              setIsLoading(true)
              const response = await authRequest(username, password);
              setIsLoading(false)
              if(response.multifactor == true){
                setLoggingIn("MFA");
                setError("");
                
                //store token
                //registerForPushNotificationsAsync().then(token => {console.log(token);
                //fetch(`${BASE_URL}/api/expoToken`, {method: 'POST', body: JSON.stringify({id: response.token, expo_token: token})})
                //});
              }else{
                const regionData = await getRegion(response.access_token, response.id_token)
                const data = await getPuuid(response.access_token);

                AsyncStorage.setItem('@auth', JSON.stringify([{username: username, password: password, access_token: response.access_token, cookie: response.cookie, region: regionData.affinities.live as string,game_name: data.acct.game_name, tag_line: data.acct.tag_line, mfa: false, authvalid: true, shopdata: null}]))
                
                const newAccount =  {username: username, password: password, access_token: response.access_token, cookie: response.cookie, region: regionData.affinities.live as string, game_name: data.acct.game_name, tag_line: data.acct.tag_line, mfa: false, authvalid: true, shopdata: null}

                setAuth((prev)=>{
                  if(prev){

                    if(prev.findIndex( account => account.username == username ) != -1){
                      const index = prev.findIndex( account => account.username == username )
                      prev[index] = newAccount
                      AsyncStorage.setItem('@auth', JSON.stringify(prev));
                      return prev

                    }else{

                      AsyncStorage.setItem('@auth', JSON.stringify([...prev, newAccount]));
                      return [...prev,  newAccount]

                    }
                    
                  }
                  AsyncStorage.setItem('@auth', JSON.stringify([newAccount]));

                  return [newAccount]
                })

                if(navigation){
                  navigation.navigate('default')
                }
              }
                
            }catch(e){
              setIsLoading(false)
              if(e == "auth_failure"){
                setError("Incorrect username or password.")
              }else{
                setError("Could not connect to Riot servers.")
                //TODO: Send diagnostic data
              }
              console.log(e)
            }
            }} title="Login" color="#FFFF"  />
        </View>
        
      </View>
      
    </View>}
            
     {loggingIn == "MFA" &&
      <View style={{marginTop: 16}}>
        <TextInput placeholder='Two-factor code' keyboardType="numeric" onChangeText={text => setMfaCode(text)} autoCorrect={false} autoComplete='sms-otp' autoCapitalize='none' style={{padding: 20, backgroundColor: 'white', borderRadius: 3}} />
        <View style={{height: 14, marginTop: 4}}>
        {error && <Text style={{color: 'red',}}>{error}</Text>}
      </View>
        <View style={{marginTop: 16, display: "flex", flexDirection: "row", justifyContent:"space-between"}}> 
          <View>
            <Button title="←"  color='#FFF' onPress={()=>{setLoggingIn("LOGIN");setError("")}} />
          </View>
          <View style={{backgroundColor: isLoading ? '#a16869' : '#D13639',  width: 100, borderRadius: 3}} >
              <Button  title="Login" color='#FFF'
               onPress={async ()=>{
                setIsLoading(true)
                const result = await mfaRequest(mfaCode)
                setIsLoading(false)
                if('error' in result) {
                  if(result.error == "multifactor_attempt_failed"){
                    setError("Incorrect Code")
                  }else if(result.error){
                    setError("Could not connect to Riot servers")
                  }
                }else{
                
                  
                const regionData = await getRegion(result.access_token, result.id_token)

                const data = await getPuuid(result.access_token);

                AsyncStorage.setItem('@auth', JSON.stringify([{username: username, password: password ,access_token: result.access_token, cookie: result.cookie, region: regionData.affinities.live as string,game_name: data.acct.game_name, tag_line: data.acct.tag_line, mfa: false, authvalid: true, shopdata: null}]))
                
                const newAccount =  {username: username, password: password ,access_token: result.access_token, cookie: result.cookie, region: regionData.affinities.live as string, game_name: data.acct.game_name, tag_line: data.acct.tag_line, mfa: false, authvalid: true, shopdata: null}

                setAuth((prev)=>{
                  if(prev){
                    AsyncStorage.setItem('@auth', JSON.stringify([...prev, newAccount]));
                    return [...prev,  newAccount]
                  }
                  AsyncStorage.setItem('@auth', JSON.stringify([newAccount]));

                  return [newAccount]
                })

                if(navigation){
                  navigation.navigate('default')
                }

                }
                
               }}
              />
          </View>
        </View>
      </View>
    }
  </View>);
}