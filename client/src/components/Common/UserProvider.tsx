import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { getWatchlist } from '../../requests/watchlist';
import WatchList from '../../../../models/WatchList';
import User from '../../../../models/User';
import NetWorthData from '../../../../models/NetWorthData';
import User_Stock from '../../../../models/User_Stock';
import { getUser as getUserRequest } from '../../requests/auth';

interface UserContext {
    user: User | null;
    watchlist: WatchList[];
    netWorth: NetWorthData[];
    stocks: User_Stock[];
    addTicker: (ticker: WatchList) => void;
    removeTicker: (tickerSymbol: string) => void;
    setUser: (user: User) => void;
    setWatchlist: (watchlist: WatchList[]) => void;
    setNetWorth: (netWorth: NetWorthData[]) => void;
    setStocks: (stocks: User_Stock[]) => void;
}

const defaultContext = {
    user: null,
    watchlist: [],
    netWorth: [],
    stocks: [],
    addTicker: () => { },
    removeTicker: () => { },
    setUser: () => { },
    setWatchlist: () => { },
    setNetWorth: () => { },
    setStocks: () => { }
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

    const addTicker = useCallback((ticker: WatchList) => {
        setWatchlist(prevData => [...prevData, ticker]);
    }, []);

    const removeTicker = useCallback((tickerSymbol: string) => {
        setWatchlist(prevData => prevData.filter(t => t.ticker_symbol !== tickerSymbol));
    }, []);

    const getUser = async (): Promise<Boolean> => {
        try {
            const response = await getUserRequest();
            setUser(response.data);
            return true;
        } catch (error) {
            return false;
        }
    }

    const contextValue = {
        user,
        watchlist,
        netWorth,
        stocks,
        addTicker,
        removeTicker,
        setUser,
        setWatchlist,
        setNetWorth,
        setStocks,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};