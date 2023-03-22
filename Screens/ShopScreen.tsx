import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useContext } from "react";
import { View, ScrollView , StyleSheet, Image, Text, ActivityIndicator} from "react-native";
import { AuthContext } from "../AuthContext";

import { BASE_URL, tierColors, user_agent } from "../Constants";

async function getPuuid(access_token) {
  const response = await fetch('https://auth.riotgames.com/userinfo', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": user_agent,
      "Authorization": `Bearer ${access_token}`
    }
  })
  return await response.json()

}

async function getEntitlement(access_token) {

  const response = await fetch('https://entitlements.auth.riotgames.com/api/token/v1', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": user_agent,
      "Authorization": `Bearer ${access_token}`
    }
  })

  let r = await response.json()
  console.log(r)
  if(r.errorCode =="CREDENTIALS_EXPIRED"){
    throw("CREDENTIALS_EXPIRED")
  }
  return r.entitlements_token
}
async function getStorefrontV2(access_token, puuid, entitlements_token){

  const response = await fetch(`https://pd.na.a.pvp.net/store/v2/storefront/${puuid}`,
   {
      method: "GET",
      headers: {
        'X-Riot-Entitlements-JWT': entitlements_token,
        "Authorization": `Bearer ${access_token}`
      }
    }
  )

  const result = await response.json()
  return result
}


async function StoreFromAccessToken(access_token){
  const puuid =  await getPuuid(access_token);
  const entitlements_token = await getEntitlement(access_token);
  const shop = await getStorefrontV2(access_token, puuid.sub, entitlements_token);
  return shop
}

const tierImages = {
    '0cebb8be-46d7-c12a-d306-e9907bfc5a25' : require('../assets/0cebb8be-46d7-c12a-d306-e9907bfc5a25.png'),
    'e046854e-406c-37f4-6607-19a9ba8426fc' : require('../assets/e046854e-406c-37f4-6607-19a9ba8426fc.png'),
    '60bca009-4182-7998-dee7-b8a2558dc369' : require('../assets/60bca009-4182-7998-dee7-b8a2558dc369.png'),
    '12683d76-48d7-84a3-4e09-6985794f0445'  : require('../assets/12683d76-48d7-84a3-4e09-6985794f0445.png'),
    '411e4a55-4e59-7757-41f0-86a53f101bb5' : require('../assets/411e4a55-4e59-7757-41f0-86a53f101bb5.png')
  }
  
function getSecondsToRefresh(){
    let now= new Date()
  
    let refreshDate = new Date(now)
    refreshDate.setUTCHours(0, 0, 0)
    if(refreshDate<now){
      refreshDate.setUTCDate(now.getUTCDate() + 1);
    }
    const seconds = (refreshDate.getTime() - now.getTime())/1000;
  
  
    return seconds;
  }

  
function GunComponent({displayName, themeUuid, contentTierUuid, displayIcon, price} ){

    const [size, setSize] = useState<{width: number, height: number}>({width: 100, height: 100})
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
      if(displayIcon){
        Image.getSize(displayIcon, (width, height)  => {setSize({width: width, height: height }); console.log(displayIcon, width, height)}, (error) =>{})

      }
    }, [])
    return <View style={[gunCard.gunCard,     {backgroundColor: tierColors[contentTierUuid]},]}>
  
      <View style={{ position: 'absolute', top: 10, right: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image source={{uri: "https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png"}} style={{width: 16, height: 16}}/>
          
          <Text style={{color: 'white', alignSelf: 'flex-end'}}>{price}</Text>
          <Image source={tierImages[contentTierUuid]} style={{width: 16, height: 16}} />
        </View>
      </View>
  
      
  
      <View style={{alignSelf: 'center', alignItems: 'center', width: '100%'}} >
        
          <Image source={{uri: `https://media.valorant-api.com/themes/${themeUuid}/displayicon.png`}}  style={{width: 200, height: 200, opacity: 0.1}}/>

          <View style={{ transform: [{rotate: '45deg'}] ,position: 'absolute' ,left: 0, right: 0, top:0, bottom: 0, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            
            <Image  source={{uri: displayIcon}} style={{width: size.width/2, height: size.height/2}} onLoadEnd={()=>setLoading(false)} />
            {loading && <ActivityIndicator
              animating={loading}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            /> }
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

export function ShopScreen(initialParams) {
    
    const {auth, setAuth} = useContext(AuthContext);
  
    let [gunData, setGunData] = useState([]);

    let [secondsToRefresh, setSecondsToRefresh] = useState(getSecondsToRefresh());
    

    useEffect(()=>{

      if(!auth){
        return;
      }
      let isActive = true;
      // fetch(BASE_URL + "/api/getShop", {method: 'POST', body: JSON.stringify({id: auth})}).then(
      //   data=> data.json().then(r => {
      //     if (r.success){
      //         setGunData(r.shop)
      //       }else{
      //         setAuth('');
      //         AsyncStorage.setItem('@token', '') 
      //     } 
      //     }))
        StoreFromAccessToken(auth).then(r=>
          {
            //r.data.SkinsPanelLayout.SingleItemStoreOffers[ind].Cost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
            setGunData(r.SkinsPanelLayout.SingleItemOffers.map((val: string, ind: number) => {
              return {
                  uuid: val,
                  ...initialParams.route.params.gunData[val],

                  price: r.SkinsPanelLayout.SingleItemStoreOffers[ind].Cost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
              }
            }))
        // })
          }).catch(e=>{
            console.log(e)
            setAuth('')
          })

      

      return ()=>{isActive = false}
      
    }, [])

    useEffect(()=>{
      let timer = setInterval(()=>{
        // if(secondsToRefresh == 0){

        //   fetch(BASE_URL + "/api/getShop", {method: 'POST', body: JSON.stringify({id: auth})}).then(
        //     data=> data.json().then(r => {
        //       if (r.success){
        //           setGunData(r.shop)
        //         }else{
        //           setAuth('');
        //           AsyncStorage.setItem('@token', '') 
        //       } 
        //       }))
        // }

        setSecondsToRefresh(getSecondsToRefresh());

      }, 1000)
      return ()=>clearTimeout(timer);
    }, [secondsToRefresh])
    
    return (
      <View style={styles.container}>
        <Text style={{alignSelf: 'flex-start', color: 'white'}}>Resets in {secondsToHHMMSS(secondsToRefresh)}</Text>
        <ScrollView style={styles.gunCardWrapper}>
          {gunData.map((f, index)=> <GunComponent key={index} price={f.price} contentTierUuid={f.contentTierUuid} displayIcon={f.displayIcon} displayName={f.displayName} themeUuid={f.themeUuid} />)}
        </ScrollView>
      </View>
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

  