import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserDetailsContext = createContext({
    fullName: '',
    email: '',
    updateUserDetails: (userDetails) => { },
    getUserDetails: () => { },
    logout: () => { }
})

function UserDetailsContextProvider({ children }) {
    const [userDetails, setUserDetails] = useState({
        fullName: '',
        email: '',
    })

    async function updateUserDetails(userDetails) {
        await AsyncStorage.removeItem("userDetails");
        await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
        setUserDetails(userDetails)
    }

    useEffect(() => {
        getUserDetails()
    }, []);

    async function getUserDetails() {
        const userDetails = await AsyncStorage.getItem("userDetails");
        setUserDetails(JSON.parse(userDetails));
    }

    function logout() {
        AsyncStorage.removeItem("userDetails");
        setUserDetails({
            fullName: '',
            email: '',
        })
    }

    const value = {
        fullName: userDetails?.fullName,
        email: userDetails?.email,
        updateUserDetails: updateUserDetails,
        getUserDetails: getUserDetails,
        logout: logout
    }

    return <UserDetailsContext.Provider value={value}>{children}</UserDetailsContext.Provider>

}

export default UserDetailsContextProvider;