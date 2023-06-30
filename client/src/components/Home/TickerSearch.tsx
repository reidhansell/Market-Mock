import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Ticker from "../../../../models/Ticker"
import { searchTickers } from '../../requests/Ticker';

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

const SearchTicker = () => {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyName(''); //reset the state to cancel pending debounced request
        searchAPI(companyName);
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Search tickers..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
            <ul>
                {searchResults.slice(0, 10).map((ticker: Ticker, index) => (
                    <li key={index}>
                        <Link to={`{tickerDetailURL}/${ticker.ticker_symbol}`}>
                            {`${ticker.ticker_symbol}: ${ticker.company_name.slice(0, 25)}`}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchTicker;
