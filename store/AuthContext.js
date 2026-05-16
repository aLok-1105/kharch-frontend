import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
    token: '',
    isAuthenticated: false,
    authenticate: (token) => { },
    logout: () => { }
})

function AuthContextProvider({ children }) {

    const [token, setToken] = useState(null);

    async function getToken() {
        //await AsyncStorage.removeItem("token");
        const token = await AsyncStorage.getItem("token");
        setToken(token);
    }
    useEffect(() => {
        getToken();
    }, []);


    async function authenticate(token) {
        await AsyncStorage.setItem("token", token);
        setToken(token);
    }

    async function logout() {
        await AsyncStorage.removeItem("token");
        setToken(null);
    }

    const value = {
        token: token,
        isAuthenticated: !!token,
        authenticate: authenticate,
        logout: logout
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export default AuthContextProvider