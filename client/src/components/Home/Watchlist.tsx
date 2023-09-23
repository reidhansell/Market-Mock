import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoadingCircle from '../Common/LoadingCircle';
import WatchList from '../../../../models/WatchList';
import { getWatchlist } from '../../requests/watchlist';
import User from '../../../../models/User';
import './Watchlist.css';


interface WatchListProps {
    user: User;
}

const Watchlist: React.FC<WatchListProps> = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState<WatchList[]>([]);
    const [loading, setLoading] = useState<Boolean>(true);
    const [search, setSearch] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getWatchlist(user.user_id);
                setData(response);
            } catch (error) {
                console.error('Failed to fetch watchlist data', error);
            }
        };

        fetchData();
        setLoading(false);
    }, []);

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
