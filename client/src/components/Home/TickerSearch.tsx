import React, { useState, useEffect } from 'react';
import Ticker from "../../../models/Ticker"
import { searchTickers } from '../../requests/Ticker';
import { Box, Header, Input, SpaceBetween, Link } from '../../../theme/build/components/index';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

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
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header
                    variant="h1">
                    Ticker Search
                </Header>
                <Input
                    type="text"
                    placeholder="Search all tickers..."
                    value={watchlistSearch}
                    onChange={({ detail }) => setWatchlistSearch(detail.value)}
                />
                {searchResults.length > 0 ? searchResults.map((ticker, index) => (
                    <Link key={index} href="">
                        <span onClick={() => navigate(`/ticker/${ticker.ticker_symbol}`)}>
                            <SpaceBetween direction='horizontal' size='s'>
                                {`${ticker.ticker_symbol}${ticker.company_name ? `: ${ticker.company_name.slice(0, 25)}` : ''}`}
                            </SpaceBetween>
                        </span>
                    </Link>

                )) : watchlistSearch === "" ? <p style={{ padding: "0.5rem" }}>Enter a ticker symbol or company name to begin searching</p> : <p style={{ padding: "0.5rem" }}>Nothing found for the given input</p>}
            </SpaceBetween>
        </Box >
    );
};

export default TickerSearch;
