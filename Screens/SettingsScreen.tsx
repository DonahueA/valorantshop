import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useState } from "react";
import { Text, View, Button } from "react-native";
import { AuthContext } from "../AuthContext";
import DropDownPicker from 'react-native-dropdown-picker';

export function Settings(){
    const {setAuth} : any = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('never');

    return <View style={{   alignItems: "center", justifyContent: "space-around",  backgroundColor: '#1B1B1B', flex: 1}}>
      {/* <Text style={{color: 'white', fontSize:24}}>Account Settings</Text> */}

      <View style={{maxWidth:250, zIndex: 1, elevation: 1}}>
        <View style={{width: "100%",flexDirection: "row", justifyContent: "space-between", alignItems: "baseline"}}>
          <Text style={{color: '#ffffff', fontSize: 18}}>Notifications</Text>
          <View style={{width: 120}}>
          <DropDownPicker style={{width: 120, zIndex: 2, elevation: 2}}
          open={open}
          value={value}
          setOpen={setOpen}
          setValue={setValue}
          items={[
            {label: 'Always', value: 'always'},
            {label: 'Favorites', value: 'favorites'},
            {label: 'Never', value: 'never'}
          ]}
          />
          </View>
        </View>
      </View>
      <View >
        <View style={{borderWidth: 1, borderColor: '#888888', marginTop: 10, width: 150, borderRadius: 3}}>
          <Button title='Delete Account' color={"#888888"} onPress={()=>{setAuth(null);AsyncStorage.setItem('@token', '') }} />
        </View>
        <View style={{borderWidth: 1, borderColor: '#D13639', marginTop: 10, width: 150, borderRadius: 3}}>
          <Button title='Sign Out' color={"white"} onPress={()=>{setAuth(null);AsyncStorage.setItem('@token', '') }} />
        </View>
      </View>
    </View>
}