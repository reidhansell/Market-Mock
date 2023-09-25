import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { getWatchlist } from '../../requests/watchlist';
import WatchList from '../../../../models/WatchList';

interface WatchlistContext {
    data: WatchList[];
    loading: boolean;
    addTicker: (ticker: WatchList) => void;
    removeTicker: (tickerSymbol: string) => void;
}

const defaultContext = {
    data: [],
    loading: true,
    addTicker: () => { }, // Default no-op function
    removeTicker: () => { }, // Default no-op function
};

export const WatchlistContext = React.createContext<WatchlistContext>(defaultContext);

interface WatchlistProviderProps {
    children: ReactNode;
}

export const WatchlistProvider: React.FC<WatchlistProviderProps> = ({ children }) => {
    const [data, setData] = useState<WatchList[]>([]);
    const [loading, setLoading] = useState(true);

    const addTicker = useCallback((ticker: WatchList) => {
        setData(prevData => [...prevData, ticker]);
    }, []);

    const removeTicker = useCallback((tickerSymbol: string) => {
        setData(prevData => prevData.filter(t => t.ticker_symbol !== tickerSymbol));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getWatchlist();
                setData(response);
            } catch (error) {
                console.error('Failed to fetch watchlist data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const contextValue = {
        data,
        loading,
        addTicker,
        removeTicker,
    };

    return (
        <WatchlistContext.Provider value={contextValue}>
            {children}
        </WatchlistContext.Provider>
    );
};