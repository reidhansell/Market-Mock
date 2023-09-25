import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNetWorthData } from '../../requests/portfolio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import NetWorthData from '../../../../models/NetWorthData';
import User from '../../../../models/User';
import LoadingCircle from '../Common/LoadingCircle';

interface Props {
    user: User;
}

const Portfolio: React.FC<Props> = ({ user }) => {
    const navigate = useNavigate();
    const [data, setData] = useState<NetWorthData[] | null>(null);

    // TODO Replace with appropriate logic to get the current user's ID
    const userId = 1;

    const fetchData = async () => {
        try {
            const netWorthData = await getUserNetWorthData(userId);
            console.log(netWorthData);
            setData(netWorthData);
        } catch (error) {
            console.error('Failed to fetch net worth data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userId]);

    const transformToChartData = (data: NetWorthData[]) => {
        return data.map(d => ({ date: new Date(d.recorded_at).toISOString(), netWorth: d.net_worth }));
    };

    let chartData: { date: string; netWorth: number }[] = [];

    if (data) {
        chartData = transformToChartData(data);
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
                                return `${date.getMonth() + 1}/${date.getDate()}`; // format date to only show day/month
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
                Initial Investment:&nbsp;
                <strong>${user.starting_amount}</strong>
            </p>
            <br />
            <p>
                Current Wallet Balance:&nbsp;
                <strong>${user.current_balance}</strong>
            </p>
            <br />
            <p>
                Current Net Worth:&nbsp;
                <strong style={{
                    color: data && data[data.length - 1].net_worth >= user.starting_amount ? '#3cb043' : '#e74c3c'
                }}>
                    {data ? `$${data[data.length - 1].net_worth} (+$${data[data.length - 1].net_worth - user.starting_amount} / +%${data[data.length - 1].net_worth / user.starting_amount * 100 - 100})` : <LoadingCircle />}
                </strong>
            </p>
        </>
    );
};

export default Portfolio;