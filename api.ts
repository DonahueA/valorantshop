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
              remember: true,

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

type PlayerInfoResponse = {
  country: string;
  /** Player UUID */
  sub: string;
  email_verified: boolean;
  player_plocale?: unknown | null;
  /** Milliseconds since epoch */
  country_at: number;
  pw: {
      /** Milliseconds since epoch */
      cng_at: number;
      reset: boolean;
      must_reset: boolean;
  };
  phone_number_verified: boolean;
  account_verified: boolean;
  ppid?: unknown | null;
  federated_identity_providers: string[];
  player_locale: string;
  acct: {
      type: number;
      state: string;
      adm: boolean;
      game_name: string;
      tag_line: string;
      /** Milliseconds since epoch */
      created_at: number;
  };
  age: number;
  jti: string;
  affinity: {
      [x: string]: string;
  };
};

export async function getPuuid(access_token) {
  const response = await fetch('https://auth.riotgames.com/userinfo', {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": user_agent,
      "Authorization": `Bearer ${access_token}`
    }
  })
  return await response.json() as PlayerInfoResponse

}


export async function getMMR(access_token){
  const entitlements_token = await  getEntitlement(access_token);
  const response = await fetch('https://pd.na.a.pvp.net/name-service/v1/players', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": user_agent,
      "Authorization": `Bearer ${access_token}`,
      "X-Riot-Entitlements-JWT": entitlements_token
    }
  })

  const json_data = await response.json()
  return json_data
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
export async function getEntitlement(access_token) {

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



export async function cookieReauth(cookie) {
  RCTNetworking.clearCookies(() => {})  
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
    "cookie": cookie,
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
  const regex = new RegExp(`access_token=(.*?)(&|$)`, 'i'); // Create a regex pattern to match the parameter
  const match = params.match(regex); // Try to find a match in the query string
 
  if(!match){
    throw("COOKIE_EXPIRED")
  }
  return match[1];
}


async function getStorefrontV2(access_token, puuid, entitlements_token, region){

  const response = await fetch(`https://pd.${region}.a.pvp.net/store/v2/storefront/${puuid}`,
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


export async function StoreFromCookie(cookie, region){

  const access_token =  await cookieReauth(cookie)
  const puuid =  await getPuuid(access_token);
  const entitlements_token = await getEntitlement(access_token);
  const shop = await getStorefrontV2(access_token, puuid.sub, entitlements_token, region);
  return shop
}
