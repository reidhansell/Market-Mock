import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserPortfolio } from '../../requests/portfolio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import NetWorthData from '../../../../models/NetWorthData';
import LoadingCircle from '../Common/LoadingCircle';
import { UserContext } from '../Common/UserProvider';

const Portfolio: React.FC = () => {
    const navigate = useNavigate();

    const { netWorth, setNetWorth, setStocks, user } = useContext(UserContext);

    const fetchData = async () => {
        try {
            const portfolioData = await getUserPortfolio();
            setNetWorth(portfolioData.netWorthData);
            setStocks(portfolioData.userStocks);
        } catch (error) {
            console.error('Failed to fetch net worth data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const transformToChartData = (data: NetWorthData[]) => {
        return data.map(d => ({ date: new Date(d.recorded_at).toISOString(), netWorth: d.net_worth })).sort((a, b) => { return a.date < b.date ? -1 : 1 });
    };

    let chartData: { date: string; netWorth: number }[] = [];

    if (netWorth) {
        chartData = transformToChartData(netWorth);
    }

    return (
        <>
            <div style={{ width: '100%', height: '200px' }}>
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
        </>
    );
};

export default Portfolio;