import { useContext, useRef, useState } from "react";
import { View, Text, StyleSheet, Button, TouchableHighlight, Animated, TouchableWithoutFeedback, Image, Alert } from "react-native";
import { AccountInfo, AuthContext } from "../AuthContext";
import LogoutX from "../assets/x.svg";

const test = <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width={24} height={24} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
<path d="M18 6l-12 12"></path>
<path d="M6 6l12 12"></path>
</svg>

const confirmDelete = (deleteAcc) =>
Alert.alert('Remove account?', 'You will have to sign in again.', [
  {
    text: 'Cancel',
    style: 'cancel',
  },
  {text: 'Delete', onPress: deleteAcc},
]);

function AccountCard({game_name, tag_line, onDelete, authvalid, navigation}, relog=false) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        // Will change fadeAnim value to 1 in 5 seconds
        Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        // Will change fadeAnim value to 0 in 3 seconds
        Animated.timing(fadeAnim, {
        toValue: 50,
        duration: 240,
        useNativeDriver: true,
        }).start();
    };

    return (<View style={{width: "100%"}}>
        <View style={{backgroundColor: "#333333", width: "100%", padding: 8, borderRadius: 4 , flexDirection: "row", justifyContent: "space-between"}}>

            <View >
                <Text style={{color: "#fff", fontSize: 18}}>{game_name}</Text>
                <Text style={{color: "#707070"}}>#{tag_line}</Text>
                {false && <Text style={{color: "#CB5151"}}>Please log in again.</Text>}
            </View>

        <View style={{flexDirection: "row", }}>
            {!authvalid && 
             <TouchableWithoutFeedback onPress={()=> navigation.navigate('login')}>
                <View style={{backgroundColor:"#494949", alignSelf: "center", paddingVertical: 4, paddingHorizontal: 10,  borderRadius: 4}}>
                    <Text style={{color: "#fff"}}>Reauthorize</Text>
                </View>
            </TouchableWithoutFeedback>
            }
            <View style={{ alignSelf: "center", marginLeft: 15, borderRadius: 4}}>
                <LogoutX  color={"#ffffff"}  onPress={onDelete} />     

                {/* <Button title="Remove"  color={"#fff"} /> */}
            </View>
        </View>

    </View>
    {/* {true && <TouchableHighlight style={{zIndex: -1}} onPress={()=> console.log("pressed")}>
                <Animated.View style={{transform: [{translateY: fadeAnim}] ,position: "relative", borderBottomLeftRadius: 4, borderBottomRightRadius:4, top: -50, zIndex: -1, height: 50, backgroundColor:"#D23E3E", width: "100%", alignItems: "center"}}>
                    <Text style={{color: "white", fontSize: 24, paddingVertical: 10}}>Remove Account</Text>
                </Animated.View>
            </TouchableHighlight>} */}

    </View>);
}


export function AccountScreen({navigation }){
    const {auth, setAuth} = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <Text style={{color: "white", fontSize: 38, alignSelf: "flex-start", marginBottom: 8}}>Accounts</Text>
        
            
            {auth.map((v, i) => {return <View key={i} style={{width: "100%", marginBottom: 8}}><AccountCard navigation={navigation} {...v} onDelete={
                    ()=>
                        {
                            confirmDelete(()=>{ setAuth(auth.filter(acc=>acc.username != v.username))})
                        }} 
                    /></View>
                
                })}
            
            <TouchableWithoutFeedback onPress={()=> navigation.navigate('login')}>
                <View style={{padding: 20}}>
                    <Text style={{color: "white", fontSize: 16 , marginBottom: 8}}>Add an account</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1B1B1B',
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 30,
    }
  });
