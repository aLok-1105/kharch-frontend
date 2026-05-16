import { createContext, useState } from "react";

export const RefreshContext = createContext({
    refreshCnt: 0,
    triggerRefresh: () => { },
})

export default function RefreshContextProvider({ children }) {
    const [refreshCnt, setRefreshCnt] = useState(0);

    function triggerRefreshHandler() {
        setRefreshCnt(prev => prev + 1);
    }

    const value = {
        refreshCnt: refreshCnt,
        triggerRefresh: triggerRefreshHandler
    }

    return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
}