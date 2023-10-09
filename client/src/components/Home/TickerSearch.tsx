import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticker from "../../../../models/Ticker"
import { searchTickers } from '../../requests/Ticker';
import './TickerSearch.css';
import Tooltip from '../Common/Tooltip';

function useDebounce(value: any, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const TickerSearch = () => {
    const [watchlistSearch, setWatchlistSearch] = useState('');
    const [searchResults, setSearchResults] = useState([] as Ticker[]);
    const debouncedSearchTerm = useDebounce(watchlistSearch, 500);

    useEffect(() => {
        if (debouncedSearchTerm) {
            searchAPI(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    const searchAPI = async (value: string) => {
        try {
            const tickers = await searchTickers(value);
            setSearchResults(tickers);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="ticker-search-container">
            <div className="ticker-search-header">
                <input
                    type="text"
                    placeholder="Search all tickers..."
                    value={watchlistSearch}
                    onChange={(e) => setWatchlistSearch(e.target.value)}
                />
                <h2><Tooltip text={["A ticker symbol is a unique code representing a specific stock, ETF, or other financial asset."]} /></h2>
            </div>
            <ul className="ticker-list">
                {searchResults.length > 0 ? searchResults.map((ticker, index) => (
                    <Link key={index} to={`/ticker/${ticker.ticker_symbol}`} className="ticker-link">
                        <li className="ticker-item">
                            {`${ticker.ticker_symbol}${ticker.company_name ? `: ${ticker.company_name.slice(0, 25)}` : ''}`}
                        </li>
                    </Link>

                )) : watchlistSearch === "" ? <p style={{ padding: "0.5rem" }}>Enter a ticker symbol or company name to begin searching</p> : <p style={{ padding: "0.5rem" }}>Nothing found for the given input</p>}
            </ul>
        </div>
    );
};

export default TickerSearch;
