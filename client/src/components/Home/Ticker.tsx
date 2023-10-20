import React, { useEffect, useState, useContext } from 'react';
import TickerIntraday from '../../../../models/TickerIntraday';
import TickerEndOfDay from '../../../../models/TickerEndOfDay';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingCircle from '../Common/LoadingCircle';
import ViewModeToggle from './ViewModeToggle';
import { addTickerToWatchlist } from '../../requests/watchlist';
import { removeTickerFromWatchlist } from '../../requests/watchlist';
import { UserContext } from '../Common/UserProvider';
import MyTooltip from '../Common/Tooltip';
import { getTickerData } from '../../requests/Ticker';
import { getWatchlist } from '../../requests/watchlist';

type ViewMode = 'intraday' | 'EOD';

const Ticker: React.FC = () => {
    const { symbol } = useParams() as { symbol: string };
    const { removeTicker, stocks, setWatchlist } = useContext(UserContext);

    const [viewMode, setViewMode] = useState<ViewMode>('intraday');

    const toggleViewMode = () => {
        viewMode === 'intraday' ? setViewMode('EOD') : setViewMode('intraday');
    }

    const [intradayData, setIntradayData] = useState<TickerIntraday[]>([]);
    const [EODData, setEODData] = useState<TickerEndOfDay[]>([]);

    const [loading, setLoading] = useState(false);

    const [inWatchlist, setInWatchlist] = useState<boolean>(false);

    const fetchData = async () => {
        const watchlistPromise = getWatchlist();
        const tickerDataPromise = getTickerData(symbol, viewMode);

        try {
            const [watchlistResponse, tickerDataResponse] = await Promise.all([watchlistPromise, tickerDataPromise]);
            setWatchlist(watchlistResponse);

            if (viewMode === 'intraday') {
                setIntradayData((tickerDataResponse as TickerIntraday[]).reverse());
            } else {
                setEODData((tickerDataResponse as TickerEndOfDay[]).reverse());
            }

            if (symbol && watchlistResponse) {
                setInWatchlist(watchlistResponse.some(item => item.ticker_symbol === symbol));
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [viewMode]);


    const handleAddToWatchlist = async () => {
        setLoading(true);
        try {
            if (symbol) {
                await addTickerToWatchlist(symbol);
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
                const result = await removeTickerFromWatchlist(symbol);
                if (result) {
                    removeTicker(symbol);
                    setInWatchlist(false);
                }
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const transformToChartData = (data: TickerIntraday[] | TickerEndOfDay[]) => {
        return viewMode === 'intraday' ?
            data.map(d => ({ name: new Date(d.date * 1000).toISOString(), price: (d as TickerIntraday).last }))
            : data.map(d => ({ name: new Date(d.date * 1000).toISOString(), price: d.close }));
    };

    const chartData = transformToChartData(viewMode === 'intraday' ? intradayData : EODData);

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
                <div style={{ width: '100%', aspectRatio: "2/1" }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={chartData.length > 0 ? chartData : []}
                            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                        >
                            <XAxis dataKey="name"
                                tickFormatter={(dateStr) => {
                                    const date = new Date(dateStr);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                                style={{ fontSize: '0.75rem' }}
                                tick={{ fill: 'white' }} />
                            <YAxis domain={['dataMin', 'dataMax']}
                                tickFormatter={(price) => {
                                    return `$${price}`;
                                }}
                                style={{ fontSize: '12px' }}
                                width={50}
                                axisLine={false}
                                tick={{ fill: 'white' }}
                            />
                            <Tooltip />
                            <CartesianGrid stroke="#f5f5f5" vertical={false}
                                style={{ borderRight: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5' }} />
                            <Line type="monotone" dataKey="price" stroke="#3cb043" yAxisId={0} isAnimationActive={false} />
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
                {" "}
                <Link to={`/orderplacer/${symbol}`}>
                    < button >Place Order</button>
                </Link>
                <br />
                <br />
                {viewMode === 'intraday' ? (<>
                    <h2>Stock information <MyTooltip text={["Current: The stock's current price (includes pre/after market)",
                        "",
                        "Open: The stock's starting price for that day",
                        "",
                        "High/Low: The stock's highest/lowest price of the day",
                        "",
                        "Change: The change in price from open to current"]} /></h2>
                    <h3>Owned: {stocks.find(stock => stock.ticker_symbol === symbol)?.quantity || "0"}</h3>
                    <h3>Current: {intradayData.length > 0 ? intradayData[0].last : <LoadingCircle />}</h3>
                    <h3>Open: {intradayData.length > 0 ? intradayData[0].open : <LoadingCircle />}</h3>
                    <h3>High: {intradayData.length > 0 ? intradayData[0].high : <LoadingCircle />}</h3>
                    <h3>Low: {intradayData.length > 0 ? intradayData[0].low : <LoadingCircle />}</h3>
                    <p>Change: {intradayData.length > 0 ? (
                        <>
                            <span style={{ color: (intradayData[0].last - intradayData[0].open) >= 0 ? "green" : "red" }}>
                                {(intradayData[0].last - intradayData[0].open) >= 0 ? "+" : ""}
                                {(intradayData[0].last - intradayData[0].open).toFixed(2)} (
                                {((intradayData[0].last / intradayData[0].open * 100) - 100).toFixed(2)}%)
                            </span>
                        </>
                    ) : (
                        <LoadingCircle />
                    )}
                    </p>
                </>) : null}

                {viewMode === 'EOD' ? (
                    <>
                        <h2>Stock information <MyTooltip text={["Open/Close: The stock's starting/ending price for that day",
                            "",
                            "High/Low: The stock's highest/lowest price of the day",
                            "",
                            "Change: The change in price from open to current"]} /></h2>
                        <h3>Open: {EODData.length > 0 ? EODData[0].open : <LoadingCircle />}</h3>
                        <h3>Close: {EODData.length > 0 ? EODData[0].close : <LoadingCircle />}</h3>
                        <h3>High: {EODData.length > 0 ? EODData[0].high : <LoadingCircle />}</h3>
                        <h3>Low: {EODData.length > 0 ? EODData[0].low : <LoadingCircle />}</h3>
                        <p>Change: {EODData.length > 0 ? (
                            <span style={{ color: EODData[0].close - EODData[0].open >= 0 ? "green" : "red", }}>
                                {(EODData[0].close - EODData[0].open >= 0 ? "+" : "")}
                                {(EODData[0].close - EODData[0].open).toFixed(2)} (
                                {((EODData[0].close - EODData[0].open) / EODData[0].open * 100).toFixed(2)}%)
                            </span>
                        ) : (
                            <LoadingCircle />
                        )}
                        </p>
                    </>) : null}
            </div>
        </div >
    );
};

export default Ticker;
