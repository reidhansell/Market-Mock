import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPortfolio } from '../../requests/portfolio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NetWorthData from '../../../../models/NetWorthData';
import LoadingCircle from '../Common/LoadingCircle';
import { UserContext } from '../Common/UserProvider';
import "./Portfolio.css"
import { getUserOrders } from '../../requests/order';
import DashboardModule from '../Common/DashboardModule';

interface PortfolioProps {
    fullscreen?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({ fullscreen }) => {
    const navigate = useNavigate();

    const { netWorth, setNetWorth, setStocks, user, stocks, orders, setOrders } = useContext(UserContext);

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
        return data.map(d => ({ date: new Date(d.recorded_at).toISOString(), netWorth: d.net_worth })).reverse();
    };

    let chartData: { date: string; netWorth: number }[] = [];

    if (netWorth) {
        chartData = transformToChartData(netWorth);
    }

    const content = (<><div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer>
            <LineChart
                data={chartData}
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
                <XAxis
                    dataKey="date"
                    tickFormatter={(dateStr) => {
                        const date = new Date(dateStr);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    style={{ fontSize: '0.75rem' }}
                    tick={{ fill: 'white' }}
                />
                <YAxis
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(tick) => `${(tick / 1000).toFixed(1)}k`}
                    style={{ fontSize: '12px' }}
                    width={40}
                    axisLine={false}
                    tick={{ fill: 'white' }}
                />
                <Tooltip />
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <Line type="monotone" dataKey="netWorth" stroke="#3cb043" yAxisId={0} />
            </LineChart>
        </ResponsiveContainer>
    </div>
        <br />
        {fullscreen ? <h1>Wallet</h1> : null}
        <p>
            Initial Investment:<br />
            <strong>${user ? user.starting_amount : <LoadingCircle />}</strong>
        </p>
        <br />
        <p>
            Current Wallet Balance:<br />
            <strong>${user ? user.current_balance : <LoadingCircle />}</strong>
        </p>
        <br />
        <p>
            Current Net Worth:<br />
            {user ? (
                <strong style={{
                    color: netWorth.length > 0 && netWorth[0].net_worth >= user.starting_amount ? '#3cb043' : '#e74c3c'
                }}>
                    {netWorth.length > 0 ? `$${netWorth[0].net_worth} (${(netWorth[0].net_worth - user.starting_amount) >= 0 ? '+' : '-'}$${Math.abs(netWorth[0].net_worth - user.starting_amount).toFixed(2)} / ${(netWorth[0].net_worth - user.starting_amount) >= 0 ? '+' : '-'}${Math.abs(netWorth[0].net_worth / user.starting_amount * 100 - 100).toFixed(2)}%)` : <LoadingCircle />}
                </strong>) : <LoadingCircle />}
        </p>
        <br />
        {fullscreen ? (<>
            <h1>Owned Stocks</h1>
            <ul className='owned-stocks-list'>
                {stocks.length > 0 ? stocks.map((stock) => (
                    <li className='owned-stock' key={stock.ticker_symbol} onClick={() => navigate(`/ticker/${stock.ticker_symbol}`)}>
                        <h3 className='owned-stock-header'>{`${stock.ticker_symbol} (${stock.quantity})`}</h3>
                        <p style={{ color: stock.last > stock.open ? "var(--brand)" : "red" }}>Today: {`${stock.last > stock.open ? '+' : '-'}$${Math.abs(stock.last - stock.open).toFixed(2)} (${stock.last > stock.open ? '+' : '-'}$${(Math.abs(stock.last - stock.open) * stock.quantity).toFixed(2)})`}</p>
                        <p style={{ color: stock.last > stock.purchased_price ? "var(--brand)" : "red" }}>All-Time: {`${stock.last > stock.purchased_price ? '+' : '-'}$${Math.abs(stock.last - stock.purchased_price).toFixed(2)} (${stock.last > stock.purchased_price ? '+' : '-'}$${(Math.abs(stock.last - stock.purchased_price) * stock.quantity).toFixed(2)})`}</p>
                    </li>
                )) : <p style={{ padding: "0.5rem" }}>No stocks currently owned</p>}
            </ul>
            <br />
            <h1>Order History</h1>
            <ul className='owned-stocks-list'>
                {orders.length > 0 ? orders.map((order) => (
                    <li className='owned-stock' key={order.order_id} onClick={() => navigate(`/order/${order.order_id}`)}>
                        <h3 style={{ color: order.quantity < 0 ? "red" : "var(--brand)" }} className='owned-stock-header'>{`${order.ticker_symbol} (${Math.abs(order.quantity)})`}</h3>
                        <p>Status: {order.cancelled ? "Cancelled" : order.transaction_id ? "Fulfilled" : "Open"}</p>
                        <p>Price: {order.transaction_id ? order.price_per_share : order.trigger_price}</p>
                    </li>
                )) : <p style={{ padding: "0.5rem" }}>No orders have been placed</p>}
            </ul>
        </>) : null}
        <br /></>);

    return (
        <DashboardModule title="Portfolio" content={content} fullscreen={fullscreen} />
    );
};

export default Portfolio;