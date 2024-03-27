import React, { useEffect, useState, useContext } from 'react';
import TickerIntraday from '../../../models/TickerIntraday';
import TickerEndOfDay from '../../../models/TickerEndOfDay';
import { useParams } from 'react-router-dom';
import { addTickerToWatchlist } from '../../requests/watchlist';
import { removeTickerFromWatchlist } from '../../requests/watchlist';
import { UserContext } from '../../UserProvider';
import { getTickerData } from '../../requests/Ticker';
import { getWatchlist } from '../../requests/watchlist';
import { Box, Header, Button, SpaceBetween, Spinner, LineChart, SegmentedControl, Container } from '../../../theme/build/components/index';

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
            data.map(d => ({ x: new Date(d.date * 1000), y: (d as TickerIntraday).last }))
            : data.map(d => ({ x: new Date(d.date * 1000), y: d.close }));
    };

    let chartData: { x: Date; y: number }[] = [];

    chartData = transformToChartData(viewMode === 'intraday' ? intradayData : EODData);

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header
                    variant="h1">
                    <SpaceBetween direction='horizontal' size='m'>
                        {symbol}
                        <SegmentedControl
                            selectedId={viewMode}
                            onChange={({ detail }) =>
                                setViewMode(detail.selectedId as ViewMode)
                            }
                            label="Default segmented control"
                            options={[
                                { text: "24H", id: "intraday" },
                                { text: "30D", id: "EOD" }
                            ]}
                        />
                    </SpaceBetween>
                </Header>
                <LineChart
                    height={300}
                    series={[
                        {
                            title: "Net Worth",
                            type: "line",
                            data: chartData,
                        }
                    ]}
                    hideFilter
                    hideLegend
                    xDomain={[
                        chartData.length > 0 ? chartData[0].x : new Date(),
                        chartData.length > 0 ? chartData[chartData.length - 1].x : new Date()
                    ]}
                    yDomain={[
                        Math.min(...chartData.map(d => d.y)),
                        Math.max(...chartData.map(d => d.y))
                    ]}
                    xScaleType='time'
                    i18nStrings={{
                        xTickFormatter: e =>
                            e
                                .toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: !1
                                })
                                .split(",")
                                .join("\n"),
                        yTickFormatter: function numberFormatter(e) {
                            return Math.abs(e) >= 1e9
                                ? (e / 1e9).toFixed(1).replace(/\.0$/, "") +
                                "G"
                                : Math.abs(e) >= 1e6
                                    ? (e / 1e6).toFixed(1).replace(/\.0$/, "") +
                                    "M"
                                    : Math.abs(e) >= 1e3
                                        ? (e / 1e3).toFixed(1).replace(/\.0$/, "") +
                                        "K"
                                        : e.toFixed(2);
                        }
                    }}
                />
                <SpaceBetween direction='horizontal' size='m'>
                    <Button href={`/orderplacer/${symbol}`}>Place Order</Button>
                    {!inWatchlist ?
                        (<Button onClick={handleAddToWatchlist}>
                            {loading ? <Spinner /> : "Add to Watchlist"}
                        </Button>) :
                        (<Button onClick={handleRemoveFromWatchlist}>
                            {loading ? <Spinner /> : "Remove from Watchlist"}
                        </Button>)}
                </SpaceBetween>
                {viewMode === 'intraday' ? (<Container>
                    <SpaceBetween size='m'>
                        <Header variant='h2'>Stock information</Header>
                        <span>Owned: {stocks.find(stock => stock.ticker_symbol === symbol)?.quantity || "0"}</span>
                        <span>Current: {intradayData.length > 0 ? intradayData[0].last : <Spinner />}</span>
                        <span>Open: {intradayData.length > 0 ? intradayData[0].open : <Spinner />}</span>
                        <span>High: {intradayData.length > 0 ? intradayData[0].high : <Spinner />}</span>
                        <span>Low: {intradayData.length > 0 ? intradayData[0].low : <Spinner />}</span>
                        <span>Change: {intradayData.length > 0 ? (
                            <>
                                <span style={{ color: (intradayData[0].last - intradayData[0].open) >= 0 ? "green" : "red" }}>
                                    {(intradayData[0].last - intradayData[0].open) >= 0 ? "+" : ""}
                                    {(intradayData[0].last - intradayData[0].open).toFixed(2)} (
                                    {((intradayData[0].last / intradayData[0].open * 100) - 100).toFixed(2)}%)
                                </span>
                            </>
                        ) : (
                            <Spinner />
                        )}
                        </span>
                    </SpaceBetween>
                </Container>) : null}

                {viewMode === 'EOD' ? (
                    <Container>
                        <SpaceBetween size='m'>
                            <Header variant='h2'>Stock information</Header>
                            <span>Open: {EODData.length > 0 ? EODData[0].open : <Spinner />}</span>
                            <span>Close: {EODData.length > 0 ? EODData[0].close : <Spinner />}</span>
                            <span>High: {EODData.length > 0 ? EODData[0].high : <Spinner />}</span>
                            <span>Low: {EODData.length > 0 ? EODData[0].low : <Spinner />}</span>
                            <span>Change: {EODData.length > 0 ? (
                                <span style={{ color: EODData[0].close - EODData[0].open >= 0 ? "green" : "red", }}>
                                    {(EODData[0].close - EODData[0].open >= 0 ? "+" : "")}
                                    {(EODData[0].close - EODData[0].open).toFixed(2)} (
                                    {((EODData[0].close - EODData[0].open) / EODData[0].open * 100).toFixed(2)}%)
                                </span>
                            ) : (
                                <Spinner />
                            )}
                            </span>
                        </SpaceBetween>
                    </Container>) : null}
            </SpaceBetween>
        </Box>
    );
};

export default Ticker;
