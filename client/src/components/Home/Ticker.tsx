import React, { useEffect, useState, useContext } from 'react';
import Axios from 'axios';
import TickerIntraday from '../../../../models/TickerIntraday';
import { useParams } from 'react-router-dom';
import config from '../../config.json'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import LoadingCircle from '../Common/LoadingCircle';
import ViewModeToggle from './ViewModeToggle';
import { addTickerToWatchlist } from '../../requests/watchlist';
import { removeTickerFromWatchlist } from '../../requests/watchlist';
import { WatchlistContext } from '../Common/WatchlistProvider';

type ViewMode = 'intraday' | 'EOD';

const Ticker: React.FC = () => {
    const { symbol } = useParams();
    const { addTicker, removeTicker } = useContext(WatchlistContext);
    const watchlist = useContext(WatchlistContext).data;
    console.log(watchlist);

    const [viewMode, setViewMode] = useState<ViewMode>('intraday');

    const toggleViewMode = () => {
        viewMode === 'intraday' ? setViewMode('EOD') : setViewMode('intraday');
    }

    const [data, setData] = useState<TickerIntraday[]>([]);

    const [loading, setLoading] = useState(false);



    const [inWatchlist, setInWatchlist] = useState<boolean>(false);

    const fetchData = async () => {
        const response = await Axios.get(`${config.serverURL}/api/ticker/${viewMode}/${symbol}`);
        console.log(response);
        setData(response.data);
    };

    const handleAddToWatchlist = async () => {
        setLoading(true);
        try {
            if (symbol) {
                await addTickerToWatchlist(symbol);
                addTicker({ ticker_symbol: symbol });
                setInWatchlist(true);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWatchlist = async () => {
        setLoading(true);
        try {
            if (symbol) {
                await removeTickerFromWatchlist(symbol);
                removeTicker(symbol);
                setInWatchlist(false);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (symbol && watchlist && watchlist.length > 0) {
            console.log(symbol);
            console.log(watchlist);
            setInWatchlist(watchlist.some(watchlist => watchlist.ticker_symbol === symbol));
        }
    }, [viewMode, symbol, watchlist]);

    // Transforms the API response into a dataset suitable for Recharts
    const transformToChartData = (data: TickerIntraday[]) => {
        return data.map(d => ({ name: new Date(d.date).toLocaleDateString(), price: d.close }));
    };

    const chartData = transformToChartData(data);

    return (
        <div className='dashboard-module dashboard-module-large'>
            <h1 className='dashboard-module-header dashboard-module-header-large'>
                {symbol}
                <ViewModeToggle
                    currentViewMode={viewMode}
                    viewModeToggle={toggleViewMode}
                />
            </h1>
            <div className='dashboard-module-content'>
                <div style={{ width: '100%', height: '20rem', maxHeight: '50vh', minHeight: '15rem' }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={chartData}
                            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                        >
                            <XAxis dataKey="name"
                                style={{ fontSize: '0.75rem' }}
                                tick={{ fill: 'white' }} />
                            <YAxis domain={['dataMin', 'dataMax']}
                                style={{ fontSize: '12px' }}
                                width={40}
                                axisLine={false}
                                tick={{ fill: 'white' }}
                            />
                            <Tooltip />
                            <CartesianGrid stroke="#f5f5f5" vertical={false}
                                style={{ borderRight: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5' }} />
                            <Line type="monotone" dataKey="price" stroke="#3cb043" yAxisId={0} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {!inWatchlist ?
                    (<button onClick={handleAddToWatchlist}>
                        {loading ? <LoadingCircle /> : "Add to Watchlist"}
                    </button>) :
                    (<button onClick={handleRemoveFromWatchlist}>
                        {loading ? <LoadingCircle /> : "Remove from Watchlist"}
                    </button>)}
                < button onClick={() => { }}>Place Order</button>
                <br />
                <br />
                <h3>Current: {data.length > 0 ? data[data.length - 1].last : <LoadingCircle />}</h3>
                <h3>Open: {data.length > 0 ? data[data.length - 1].open : <LoadingCircle />}</h3>
                <h3>High: {data.length > 0 ? data[data.length - 1].high : <LoadingCircle />}</h3>
                <h3>Low: {data.length > 0 ? data[data.length - 1].low : <LoadingCircle />}</h3>
                <p>Change: {data.length > 0 ? (
                    <>
                        <span
                            style={{
                                color: data[data.length - 1].last - data[data.length - 1].open >= 0 ? "green" : "red",
                            }}
                        >
                            {(
                                (data[data.length - 1].last - data[data.length - 1].open) >= 0 ? "+" : ""
                            )}
                            {(data[data.length - 1].last - data[data.length - 1].open).toFixed(2)} (
                            {(((data[data.length - 1].last - data[data.length - 1].open) / data[data.length - 1].open) * 100).toFixed(2)}%)
                        </span>
                    </>
                ) : (
                    <LoadingCircle />
                )}
                </p>

            </div>
        </div >
    );
};

export default Ticker;
