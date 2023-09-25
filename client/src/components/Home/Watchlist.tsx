import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingCircle from '../Common/LoadingCircle';
import WatchList from '../../../../models/WatchList';
import User from '../../../../models/User';
import './Watchlist.css';
import { WatchlistContext } from '../Common/WatchlistProvider';


interface WatchListProps {
    user: User;
}

const Watchlist: React.FC<WatchListProps> = ({ user }) => {
    const navigate = useNavigate();
    const { data, loading } = useContext(WatchlistContext);
    const [search, setSearch] = useState<string>("");

    return (
        <>
            <div className="top-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search your watchlist..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                &nbsp;
                <button
                    className="button"
                    onClick={() => navigate('/tickersearch')}
                >
                    +
                </button>
            </div>

            {loading ? <LoadingCircle /> : (
                data.length < 1 ?
                    <>
                        <br />
                        <p className="no-tickers">
                            No tickers found. Click the + to add a ticker.
                        </p>
                    </>
                    :
                    <ul className="ticker-list">
                        {data.map((ticker: WatchList, index) => (
                            <Link key={index} to={`/ticker/${ticker.ticker_symbol}`} className="ticker-link">
                                <li className="ticker-item">
                                    {`${ticker.ticker_symbol}: ${ticker.company_name ? ticker.company_name.slice(0, 25) : 'Name not found'}`}
                                </li>
                            </Link>
                        ))}
                    </ul>
            )}
        </>
    );
};

export default Watchlist;
