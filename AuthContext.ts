import React, { createContext } from "react";

export const AuthContext = createContext<{auth: {access_token: string, region: string} | null, setAuth: React.Dispatch<React.SetStateAction<{access_token: string, region: string}>>} | null>(null);
