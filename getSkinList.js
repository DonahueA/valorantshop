
const fs = require('fs');
const { validateHeaderValue } = require('http');


//Updates skin list
fetch('https://valorant-api.com/v1/weapons/skins').then(
    (async e=>{

        const json = await e.json();
        json.data = json.data.filter((v, i) => {
            return !(v.displayName.toLowerCase().includes('standard') || v.displayName.toLowerCase().includes('random'))
        })
        fs.writeFile("./assets/skins.json", await JSON.stringify(json), e=>{console.log(e)})
    })
)