import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingCircle from '../Common/LoadingCircle';
import './Watchlist.css';
import { UserContext } from '../Common/UserProvider';
import { getWatchlist } from '../../requests/watchlist';
import DashboardModule from '../Common/DashboardModule';

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

    const content = (<>
        <div className="top-bar">
            <input
                type="text"
                className="search-input"
                placeholder="Search your watchlist..."
                value={search}
                onChange={(e) => { console.log(e.target.value); setSearch(e.target.value) }}
            />
            &nbsp;
            <button
                className="button"
                onClick={() => navigate('/tickersearch')}
            >
                +
            </button>
        </div>

        {loading ? <h1 style={{ width: "100%", textAlign: "center" }}><LoadingCircle /></h1> : (
            watchlist.length < 1 ?
                <>
                    <br />
                    <p className="no-tickers">
                        No tickers found. Click the + to add a ticker to your watch list.
                    </p>
                </>
                :
                <ul className="ticker-list">
                    {sortedWatchlist.filter(ticker => search === "" ||
                        ticker.company_name?.toLowerCase().includes(search) ||
                        ticker.ticker_symbol.toLowerCase().includes(search)).map((ticker, index) => (
                            <Link key={index} to={`/ticker/${ticker.ticker_symbol}`} className="ticker-link">
                                <li className="ticker-item">
                                    {`${ticker.ticker_symbol}: ${ticker.company_name ? ticker.company_name.slice(0, 25) : 'Name not found'}`}
                                    {stocks.filter(stock => stock.ticker_symbol === ticker.ticker_symbol).length > 0 ? <div className='wallet-icon' /> : null}
                                </li>
                            </Link>
                        ))}
                    {sortedWatchlist.filter(ticker => search === "" ||
                        ticker.company_name?.toLowerCase().includes(search) ||
                        ticker.ticker_symbol.toLowerCase().includes(search)).length === 0 ? <p style={{ paddingTop: "0.5rem" }}>Nothing in your watchlist matched the search provided. Did you mean use <a style={{ color: "var(--brand)", cursor: "pointer" }} onClick={() => navigate("/tickersearch")}>Ticker Search</a>?</p> : null}
                </ul>
        )}
    </>);

    return (
        <DashboardModule title="Watchlist" content={content} fullscreen={fullscreen} />
    );
};

export default Watchlist;
