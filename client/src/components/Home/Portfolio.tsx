import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNetWorthData } from '../../requests/portfolio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import NetWorthData from '../../../../models/NetWorthData';
import User from '../../../../models/User';

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
        return data.map(d => ({ date: new Date(d.recorded_at).toLocaleDateString(), netWorth: d.net_worth }));
    };

    let chartData: { date: string; netWorth: number }[] = [];

    if (data) {
        chartData = transformToChartData(data);
    }

    return (
        <div>
            <LineChart
                width={300}
                height={200}
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
                <XAxis dataKey="date" />
                <YAxis
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(tick) => `${(tick / 1000).toFixed(1)}k`}
                    style={{ fontSize: '12px' }}
                    width={50}
                />
                <Tooltip />
                <CartesianGrid stroke="#f5f5f5" />
                <Line type="monotone" dataKey="netWorth" stroke="#ff7300" yAxisId={0} />
            </LineChart>
            you started with {user.starting_amount} and now you have {user.current_balance}
        </div>
    );
};

export default Portfolio;