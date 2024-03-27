import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPortfolio } from '../../requests/portfolio';
import NetWorthData from '../../../models/NetWorthData';
import { UserContext } from '../../UserProvider';
import { getUserOrders } from '../../requests/order';
import { resetProgress, getUser } from '../../requests/auth';
import { getWatchlist } from '../../requests/watchlist';
import { getUserQuests } from '../../requests/quest';
import { Box, Header, Button, LineChart, SpaceBetween, Spinner, Modal, Cards, Link } from '../../../theme/build/components/index';

interface PortfolioProps {
    fullscreen?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ fullscreen }) => {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const { netWorth, setNetWorth, setStocks, user, stocks, orders, setOrders, setUser, setWatchlist, setQuests } = useContext(UserContext);
    const fetchData = async () => {
        try {
            const portfolioData = await getUserPortfolio();
            const orderData = await getUserOrders();
            setNetWorth(portfolioData.netWorthData);
            setStocks(portfolioData.userStocks);
            setOrders(orderData);
        } catch (error) {
            console.error('Failed to fetch net worth data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const transformToChartData = (data: NetWorthData[]) => {
        return data.map(d => ({ x: new Date(d.recorded_at * 1000), y: d.net_worth }));
    };

    let chartData: { x: Date; y: number }[] = [];

    if (netWorth) {
        chartData = transformToChartData(netWorth);
    }

    const handleUserReset = async () => {
        const response = await resetProgress();
        setIsModalOpen(false);
        if (response.status === 200) {
            const userResponse = await getUser();
            setUser(userResponse.data);
            setWatchlist(await getWatchlist());
            setQuests(await getUserQuests());
            navigate('/');
        }
    }

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header
                    variant="h1"
                    actions={
                        !fullscreen &&
                        <Button variant="primary" onClick={() => navigate('/portfolio')}>
                            View Details
                        </Button>
                    }>
                    Portfolio
                </Header>
                <LineChart
                    height={fullscreen ? 300 : 200}
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

                {fullscreen ? <Header variant="h2">Wallet</Header> : null}
                <span>
                    Initial Investment:{" "}
                    <strong>${user ? user.starting_amount : <Spinner />}</strong>
                </span>
                <span>
                    Current Wallet Balance:{" "}
                    <strong>${user ? user.current_balance : <Spinner />}</strong>
                </span>
                <span>
                    Current Net Worth:{" "}
                    {user ? (
                        <strong style={{
                            color: netWorth.length > 0 && netWorth[0].net_worth >= user.starting_amount ? 'green' : 'red'
                        }}>
                            {netWorth.length > 0 ? `$${netWorth[0].net_worth} (${(netWorth[0].net_worth - user.starting_amount) >= 0 ? '+' : '-'}$${Math.abs(netWorth[0].net_worth - user.starting_amount).toFixed(2)} / ${(netWorth[0].net_worth - user.starting_amount) >= 0 ? '+' : '-'}${Math.abs(netWorth[0].net_worth / user.starting_amount * 100 - 100).toFixed(2)}%)` : <Spinner />}
                        </strong>) : <Spinner />}
                </span>
                {fullscreen ? <>

                    <Button variant='normal' onClick={() => setIsModalOpen(true)}>Reset Progress</Button>
                    <Modal
                        visible={isModalOpen}
                        onDismiss={() => setIsModalOpen(false)}
                        footer={
                            <SpaceBetween direction='horizontal' size='xs'>
                                <Button variant='normal' onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button variant='primary' onClick={() => handleUserReset()}>Confirm</Button>
                            </SpaceBetween>
                        }
                        header="Really Reset Progress?"
                    >
                        <p>Are you sure you want to reset your progress? This action is irreversible.</p>
                    </Modal>

                </> : ""}

                {fullscreen ? (<>
                    <Header variant="h2">Owned Stocks</Header>
                    <Cards
                        cardDefinition={{
                            header: item => (
                                <Link href="">
                                    <span onClick={() => navigate(`/ticker/${item.ticker_symbol}`)}>
                                        {item.ticker_symbol} ({item.quantity})
                                    </span>
                                </Link>
                            ),
                            sections: [
                                {
                                    id: 'today',
                                    header: 'Today',
                                    content: item => (
                                        <span style={{ color: item.last > item.open ? "green" : "red" }}>
                                            {`${item.last > item.open ? '+' : '-'}$${Math.abs(item.last - item.open).toFixed(2)} (${item.last > item.open ? '+' : '-'}$${(Math.abs(item.last - item.open) * item.quantity).toFixed(2)})`}
                                        </span>
                                    )
                                },
                                {
                                    id: 'sincePurchased',
                                    header: 'Since Purchased',
                                    content: item => (
                                        <span style={{ color: item.last > item.purchased_price ? "green" : "red" }}>
                                            {`${item.last > item.purchased_price ? '+' : '-'}$${Math.abs(item.last - item.purchased_price).toFixed(2)} (${item.last > item.purchased_price ? '+' : '-'}$${(Math.abs(item.last - item.purchased_price) * item.quantity).toFixed(2)})`}
                                        </span>
                                    )
                                }
                            ]
                        }}
                        items={stocks}
                    />

                    <Header variant="h2">Order History</Header>
                    <Cards
                        cardDefinition={{
                            header: item => (
                                <Link href="">
                                    <span onClick={() => navigate(`/order/${item.order_id}`)}>
                                        {item.ticker_symbol} ({item.quantity > 0 ? "+" : ""}{item.quantity})
                                    </span>
                                </Link>
                            ),
                            sections: [{
                                id: 'status',
                                header: 'Status',
                                content: item => item.cancelled ? 'Cancelled' : item.transaction_id ? 'Fulfilled' : 'Open'
                            },
                            {
                                id: 'price',
                                header: 'Price',
                                content: item => item.transaction_id ? item.price_per_share : item.trigger_price
                            }]
                        }}
                        items={orders}
                    />
                </>) : null}
            </SpaceBetween>
        </Box>);
};

export default Portfolio;