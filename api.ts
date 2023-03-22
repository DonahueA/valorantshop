const user_agent = "RiotClient/62.0.4.4878570.4789131 rso-auth (Windows;10;;Professional, x64)";
const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking')




const parseTokensFromUrl = (uri) => {
    let url = new URL(uri);
    let params = url.href.slice(1 + url.href.indexOf('#'));
    let f = params.split("&").map(s => {
        return s.split("=")
    })
    return {
      access_token: f[0][1],
      id_token: f[3][1],
    };
};

type AuthPutResponse = {
  type: "response",
  response: {
    mode: "fragment",
    parameters: {
      uri: string
    }
  },
  country: string
} | {
  type: "multifactor",
	multifactor: {
		email: string,
		method: string,
		methods: string[],
		multiFactorCodeLength: number,
		mfaVersion: string
	},
	country: string,
	securityProfile: string,
  error?: string
} | {
  type: "auth",
  error?: string,
  country: string
}


export async function mfaRequest(code: string) : Promise<{error:string} | {cookie: string, access_token: string, id_token: string}> {
  var access_tokens = await fetch(
    "https://auth.riotgames.com/api/v1/authorization", {
        method: "PUT",
        body: JSON.stringify({
            type: "multifactor",
            code: code,
            rememberDevice: true,

          }),
          headers: {
            "Content-Type": "application/json",
            "User-Agent": user_agent,
          },
  });

  let first_slice = access_tokens.headers.get('set-cookie').slice(access_tokens.headers.get('set-cookie').search(/ssid/))
  let ssid_cookie = first_slice.slice(0, first_slice.search(/SameSite/))
  let response = await access_tokens.json()  as AuthPutResponse;


  if(response.type == "multifactor"){
    if(response.error){
      return {error: response.error}
    }
  }
  if(response.type=="response"){
    return {cookie: ssid_cookie, ...parseTokensFromUrl( response.response.parameters.uri)}
  }

  return {error: "Unknown error"}
}

export async function authRequest(username: string, password: string) :  Promise<{multifactor: true ,  asid_cookie : string} | {multifactor: false, cookie: string, access_token: string, id_token: string}>{
  RCTNetworking.clearCookies(() => { })  
  //POST Auth Cookies
  const cookie = await fetch("https://auth.riotgames.com/api/v1/authorization", {
    method: "POST",
    body: JSON.stringify({
      client_id: "play-valorant-web-prod",
      nonce: 1,
      redirect_uri: "https://playvalorant.com/opt_in",
      response_type: "token id_token",
      scope: "account openid"
    }),
    headers: {
      "Content-Type": "application/json",
      "User-Agent": user_agent,
      cookie: ""
    },
  })
  const start = cookie.headers.get('set-cookie').search(/asid/)

  let asid_cookie = cookie.headers.get('set-cookie').slice(start)
  const end = asid_cookie.search('Strict')
  asid_cookie = asid_cookie.slice(0, end+6);

  //PUT Auth Request
  var access_tokens = await fetch(
      "https://auth.riotgames.com/api/v1/authorization", {
          method: "PUT",
          body: JSON.stringify({
              type: "auth",
              username: username,
              password: password,

            }),
            headers: {
              "Content-Type": "application/json",
              "User-Agent": user_agent,
              "cookie": asid_cookie
            },
    });

    let first_slice = access_tokens.headers.get('set-cookie').slice(access_tokens.headers.get('set-cookie').search(/ssid/))
    let ssid_cookie = first_slice.slice(0, first_slice.search(/SameSite/))
    let response = await access_tokens.json()  as AuthPutResponse;

    if(response.type == 'auth'){
      throw(response.error)
    }
    if(response.type == "multifactor"){
      return {multifactor: true, asid_cookie : asid_cookie};
    }
    return {multifactor: false, cookie: ssid_cookie, ...parseTokensFromUrl( response.response.parameters.uri)}

}

// export async function authRequest(username, password){
//   console.log("Beginning auth request")
//   RCTNetworking.clearCookies(() => { })
//   //POST Auth Cookies
//   const cookie = await fetch("https://auth.riotgames.com/api/v1/authorization", {
//     method: "POST",
//     body: JSON.stringify({
//       client_id: "play-valorant-web-prod",
//       nonce: 1,
//       redirect_uri: "https://playvalorant.com/opt_in",
//       response_type: "token id_token",
//       scope: "account openid"
//     }),
//     headers: {
//       "Content-Type": "application/json",
//       "User-Agent": user_agent,
//       cookie: ""
//     },
//   })

//   const start =cookie.headers.get('set-cookie').search(/asid/)

//   let real_cookie = cookie.headers.get('set-cookie').slice(start)
//   const end = real_cookie.search('Strict')
//   real_cookie = real_cookie.slice(0, end+6);

//   console.log(real_cookie)
//   //PUT Auth Request
//   var access_tokens = await fetch(
//       "https://auth.riotgames.com/api/v1/authorization", {
//           method: "PUT",
//           body: JSON.stringify({
//               type: "auth",
//               username: username,
//               password: password,

//             }),
//             headers: {
//               "Content-Type": "application/json",
//               "User-Agent": user_agent,
//               "cookie": real_cookie
//             },
//     });
//     let response = await access_tokens.json()
//     console.log("RESPONSE")
//     console.log(response)
    
//     //Testing to get ssid
//     const ssid = await fetch("https://auth.riotgames.com/api/v1/authorization", {
//       method: "POST",
//       body: JSON.stringify({
//         client_id: "play-valorant-web-prod",
//         nonce: 1,
//         redirect_uri: "https://playvalorant.com/opt_in",
//         response_type: "token id_token",
//         scope: "account openid"
//       }),
//       headers: {
//         "Content-Type": "application/json",
//         "User-Agent": user_agent,
//         "cookie": cookie.headers.get('set-cookie')
//       },

//     })

//     return {cookie: access_tokens.headers.get('set-cookie'), ...parseTokensFromUrl( response.response.parameters.uri)}
  
// }

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

export async function getRegion(access_token, id_token){

  const response = await fetch('https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant', {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": user_agent,
      "Authorization": `Bearer ${access_token}`
    },
    body: JSON.stringify({
      id_token: id_token
    })
  })
  const response_data = await response.json()
  return response_data

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

  return r.entitlements_token
}



async function cookieReauth(cookie) {
  
  let reauthResponse = await fetch("https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.7",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1",
    "cookie": "ssid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzc2lkIjoiaFZGOHFQdF9LMENYR001RDZUcEFEZy5zNGkzcDRnRm5ZZnZHZGs0Ynh1Z2pRIiwic3ViIjoiNWFjMjIyNzAtYzhmMy01NjQyLTllYTktZTM2YjA0OWMwZjQzIiwiaWF0IjoxNjc3OTY3OTY1fQ.j_0FRS_ExRPR9DXtanZCU7laQNh-mAmSjUstq_9oKkE",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    
  },
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET"
});
  // let reauthResponse = await fetch('https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1',
  //   {
  //     method: 'GET',
  //     cookie: cookie,
  //     headers: {
  //       "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
  //     },
  //     agent: {}
  //   }
  // )

  
  let url = new URL(reauthResponse.url);
  

  

  let params = url.href.slice(1 + url.href.indexOf('#'));
  //get and return access token and id_token {access_token: #, id_token: #}
}
async function test_reauth(){
  const authRequestResponse = await cookieReauth('tdid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE0MzNmOTNkLWViOTQtNGQzYS1hODM0LWMzMDFlMTk2NTIzZSIsIm5vbmNlIjoiUnczaDRRSERBNmM9IiwiaWF0IjoxNjc3OTc0NzkzfQ.9hyg6_ovggDiZvwkWSSiqWZU4oVDjlg3wEg6LIE6EtI; Max-Age=31536000; Domain=riotgames.com; Path=/; Expires=Mon, 04 Mar 2024 00:06:33 GMT; HttpOnly; Secure, asid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure, clid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure, ssid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzc2lkIjoiU3JKOWYyV05VUVlQTkNOWFdNNElVdy44LVlhaVFpMTlzUUNEYVgyT09lSU1nIiwic3ViIjoiYmQ4ZWU1YzAtYjQ0MC01ZGJiLWI3ODYtYjc1ZTFkZGI4NjgwIiwiaWF0IjoxNjc3OTc0NzkzfQ.C_G89y3kfipLnuIEPXID36owrBizuORoj5MPWAjTGvk; Path=/; HttpOnly; Secure; SameSite=None, clid=ue1; Path=/; HttpOnly; Secure, sub=bd8ee5c0-b440-5dbb-b786-b75e1ddb8680; Path=/; Secure, csid=SrJ9f2WNUQYPNCNXWM4IUw.8-YaiQi19sQCDaX2OOeIMg; Path=/; Secure; SameSite=None, __cf_bm=.yygRKP0P6ijDpYX9FwsHjN6t1E9YWUIPR66mVBa7AY-1677974794-0-AVSxEmPXr5b+Sz1f3CQzKMO+cIH7EMYqj67d1kdDSL3A3BFqhTTLLTN7nA/OxtvELREZNtoJwFi6YgDWRtqMp9o=; path=/; expires=Sun, 05-Mar-23 00:36:34 GMT; domain=.riotgames.com; HttpOnly; Secure; SameSite=None')
  
  console.log(authRequestResponse)
  
}



export async function test_login(){
  // //Login Step
  // const result =  await authRequest('testaccountq2', 'testaccountq2')
  // console.log(result)
  // //Shop one time
  // const puuid =  await getPuuid(result.access_token);
  // console.log(puuid)
  // const entitlements_token = await getEntitlement(result.access_token);
  // console.log(entitlements_token);

  // console.log("RESULTS!!")
  // console.log(result.access_token, puuid.sub, entitlements_token)
  // const shop = await getStorefrontV2(result.access_token, puuid.sub, entitlements_token);
  // console.log(shop);
}
