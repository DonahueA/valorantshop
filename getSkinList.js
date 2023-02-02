
const fs = require('fs');


//Updates skin list
fetch('https://valorant-api.com/v1/weapons/skins').then(
    (async e=>{
        fs.writeFile("./assets/skins.json", await JSON.stringify(await e.json()), e=>{console.log(e)})
    })
)