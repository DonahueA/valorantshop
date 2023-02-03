import { useState, useEffect } from "react";
import { View, ScrollView , StyleSheet, Image, Text} from "react-native";

let skins = require('../assets/skins.json');

import { tierColors } from "../Constants";
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

  
function GunComponent({displayName, themeUuid, contentTierUuid, displayIcon} ){

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

export function ShopScreen() {
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

  