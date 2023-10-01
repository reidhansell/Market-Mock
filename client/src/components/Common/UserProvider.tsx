import React, { useState, ReactNode, useCallback } from 'react';
import WatchList from '../../../../models/WatchList';
import User from '../../../../models/User';
import NetWorthData from '../../../../models/NetWorthData';
import User_Stock from '../../../../models/User_Stock';
import Notification from '../../../../models/Notification';

interface UserContext {
    user: User | null;
    watchlist: WatchList[];
    netWorth: NetWorthData[];
    stocks: User_Stock[];
    notifications: Notification[];
    addTicker: (ticker: WatchList) => void;
    removeTicker: (tickerSymbol: string) => void;
    setUser: (user: User) => void;
    setWatchlist: (watchlist: WatchList[]) => void;
    setNetWorth: (netWorth: NetWorthData[]) => void;
    setStocks: (stocks: User_Stock[]) => void;
    setNotifications: (notifications: Notification[]) => void;
}

const defaultContext = {
    user: null,
    watchlist: [],
    netWorth: [],
    stocks: [],
    notifications: [],
    addTicker: () => { },
    removeTicker: () => { },
    setUser: () => { },
    setWatchlist: () => { },
    setNetWorth: () => { },
    setStocks: () => { },
    setNotifications: () => { }
};

export const UserContext = React.createContext<UserContext>(defaultContext);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [watchlist, setWatchlist] = useState<WatchList[]>([]);
    const [netWorth, setNetWorth] = useState<NetWorthData[]>([]);
    const [stocks, setStocks] = useState<User_Stock[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addTicker = useCallback((ticker: WatchList) => {
        setWatchlist(prevData => [...prevData, ticker]);
    }, []);

    const removeTicker = useCallback((tickerSymbol: string) => {
        setWatchlist(prevData => prevData.filter(t => t.ticker_symbol !== tickerSymbol));
    }, []);

    const contextValue = {
        user,
        watchlist,
        netWorth,
        stocks,
        notifications,
        addTicker,
        removeTicker,
        setUser,
        setWatchlist,
        setNetWorth,
        setStocks,
        setNotifications
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};