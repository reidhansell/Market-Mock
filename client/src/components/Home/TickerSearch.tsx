import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticker from "../../../../models/Ticker"
import { searchTickers } from '../../requests/Ticker';
import './TickerSearch.css';

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
    const [companyName, setCompanyName] = useState('');
    const [searchResults, setSearchResults] = useState([] as Ticker[]);
    const debouncedSearchTerm = useDebounce(companyName, 500);

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
        <div className="search-ticker">
            <input
                type="text"
                className="search-input"
                placeholder="Search tickers..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
            />
            <ul className="ticker-list">
                {searchResults.map((ticker: Ticker, index) => (
                    <Link key={index} to={`/ticker/${ticker.ticker_symbol}`} className="ticker-link">
                        <li className="ticker-item">
                            {`${ticker.ticker_symbol}: ${ticker.company_name.slice(0, 25)}`}
                        </li>
                    </Link>

                ))}
            </ul>
        </div>
    );
};

export default TickerSearch;
