import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserProvider';
import { getWatchlist } from '../../requests/watchlist';
import { Box, Header, Button, SpaceBetween, Input, Spinner, Link } from '../../../theme/build/components/index';
import WalletIcon from '../../icons/wallet-solid.svg';

interface WatchlistProps {
    fullscreen: boolean;
}

const Watchlist: React.FC<WatchlistProps> = ({ fullscreen }) => {
    const navigate = useNavigate();
    const { watchlist, stocks, setWatchlist } = useContext(UserContext);
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const sortedWatchlist = useMemo(() => {
        const ownedStocksSet = new Set(stocks.map(stock => stock.ticker_symbol));

        return [...watchlist].sort((a, b) => {
            const userOwnsA = ownedStocksSet.has(a.ticker_symbol);
            const userOwnsB = ownedStocksSet.has(b.ticker_symbol);

            if (userOwnsA && !userOwnsB) return -1;
            if (!userOwnsA && userOwnsB) return 1;

            return a.ticker_symbol.localeCompare(b.ticker_symbol);
        });
    }, [watchlist, stocks]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getWatchlist();
                setWatchlist(response);
            } catch (error) {
                console.error('Failed to fetch watchlist data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header
                    variant="h1"
                    actions={
                        !fullscreen &&
                        <Button variant="primary" onClick={() => navigate('/tickersearch')}>
                            Search All Tickers
                        </Button>
                    }>
                    Watchlist
                </Header>
                <Input
                    placeholder="Search your watchlist..."
                    value={search}
                    onChange={({ detail }) => setSearch(detail.value)}
                />

                {loading ? <Spinner /> : (
                    watchlist.length < 1 ?
                        <p>
                            No tickers found. Select Search All Tickers to add a ticker to your watch list.
                        </p>
                        : <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            <SpaceBetween size='m'>
                                {sortedWatchlist.filter(ticker => search === "" ||
                                    ticker.company_name?.toLowerCase().includes(search) ||
                                    ticker.ticker_symbol.toLowerCase().includes(search)).map((ticker, index) => (
                                        <Link key={index} href="">
                                            <span onClick={() => navigate(`/ticker/${ticker.ticker_symbol}`)}>
                                                <SpaceBetween direction='horizontal' size='s'>
                                                    {ticker.ticker_symbol + ":"}
                                                    {ticker.company_name ? ticker.company_name.slice(0, 25) : 'Name not found'}
                                                    {stocks.filter(stock => stock.ticker_symbol === ticker.ticker_symbol).length > 0 ? <img src={WalletIcon} alt="Wallet Icon" style={{ width: '1rem', height: '1rem' }} /> : null}
                                                </SpaceBetween>
                                            </span>
                                        </Link>
                                    ))}
                                {sortedWatchlist.filter(ticker => search === "" ||
                                    ticker.company_name?.toLowerCase().includes(search) ||
                                    ticker.ticker_symbol.toLowerCase().includes(search)).length === 0 ? <p>Nothing in your watchlist matched the search provided. Did you mean use <Link href=""><span onClick={() => navigate(`/tickersearch`)}>Ticker Search</span></Link>?</p> : null}
                            </SpaceBetween>
                        </div>
                )}
            </SpaceBetween>
        </Box>);
};

export default Watchlist;
