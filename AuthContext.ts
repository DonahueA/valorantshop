import React, { createContext } from "react";

export type AccountInfo = {username: string, password: string, mfa: boolean, access_token: string, cookie: string , region: string,
    game_name: string, tag_line: string, authvalid: boolean, shopdata: any}

export const AuthContext = createContext<{auth: AccountInfo[], setAuth: React.Dispatch<React.SetStateAction<AccountInfo[]>>}>(null);

export const PatchContext = createContext<{gunData: any}>(null);