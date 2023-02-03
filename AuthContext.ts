import { createContext } from "react";

export const AuthContext = createContext<{auth: string | null, setAuth: React.Dispatch<React.SetStateAction<string | null>>} | null>(null);