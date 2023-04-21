import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect, useContext } from "react";
import { View, ScrollView , StyleSheet, Image, Text, ActivityIndicator, RefreshControl} from "react-native";
import { AuthContext, PatchContext } from "../AuthContext";

import { tierColors } from "../Constants";
import { StoreFromCookie } from "../api";


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
        Image.getSize(displayIcon, (width, height)  => {setSize({width: width, height: height })}, (error) =>{})

      }
    }, [displayIcon])
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
    
    const {gunData} = useContext(PatchContext);
    const {auth, setAuth} = useContext(AuthContext);
    let [secondsToRefresh, setSecondsToRefresh] = useState(getSecondsToRefresh());
    
    const updateData = ()=>{
      if(gunData){
        auth.map(async (account, index) =>{
          return await StoreFromCookie(account.cookie, account.region).then(r=>
            {
              //r.data.SkinsPanelLayout.SingleItemStoreOffers[ind].Cost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
              const newData = r.SkinsPanelLayout.SingleItemOffers.map((val: string, ind: number) => {

                return {
                    uuid: val,
                    ...gunData[val],
  
                    price: r.SkinsPanelLayout.SingleItemStoreOffers[ind].Cost['85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741']
                }
              }) 
              
              setAuth((prevAuth)=>{
                prevAuth[index].shopdata = newData
                AsyncStorage.setItem('@auth', JSON.stringify(prevAuth))
                return prevAuth
              })
          // })
            }).catch(e=>{
              console.log(`Update failure ${account.username}`)
              console.log(e)
              setAuth((prevAuth)=>{
                prevAuth[index].authvalid = false;
                AsyncStorage.setItem('@auth', JSON.stringify(prevAuth))
                return prevAuth
              })
  
            })
        })
      }   


    }
    //Update Data
    useEffect(()=>{
      let IntervalId;
      

      updateData()

      const ref = setTimeout(()=>{
        updateData()
        
        IntervalId = setInterval(()=>{
          updateData()
        }, 24*60*60*1000)

      }, getSecondsToRefresh() *1000 + 2000 )
      return ()=>{
        clearTimeout(ref)
        clearInterval(IntervalId)
      }
    },[auth]);


    //Timer
    useEffect(()=>{
      let timer = setInterval(()=>{
        setSecondsToRefresh(getSecondsToRefresh());

      }, 1000)
      return ()=>clearTimeout(timer);
    }, [secondsToRefresh])
    

    const [refreshing, setRefreshing] = useState(false);
    const handleRefresh = () => {
      // Set refreshing state to true to indicate that the view is refreshing
      setRefreshing(true);
  
      // Perform your refresh action here, e.g. fetch data from an API
      updateData();
      // After the refresh action is completed, set refreshing state to false
      // to indicate that the view is no longer refreshing
      setRefreshing(false);
    }

    return (
      <View style={styles.container}>
        <Text style={{alignSelf: 'flex-start', color: 'white'}}>Resets in {secondsToHHMMSS(secondsToRefresh)}</Text>
        <ScrollView style={styles.gunCardWrapper}  refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="white" // Set the color of the refresh spinner to white
          colors={['white']}
        />}>
          {auth.map(({username, shopdata, game_name, tag_line}, userIndex) => {

            return (<View key={userIndex}><Text style={{fontSize: 36, color: "#FFF", marginTop: userIndex==0 ? 0 : 16}}>{game_name}<Text style={{fontSize:24, color:"#707070"}}>#{tag_line}</Text></Text>
            {shopdata && shopdata.map((f, index)=>{
                return <GunComponent key={index} price={f.price} contentTierUuid={f.contentTierUuid} displayIcon={f.displayIcon} displayName={f.displayName} themeUuid={f.themeUuid} />
              }
            )}
            
            </View>);
          })}
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

  