import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import TickerIntraday from '../../../../models/TickerIntraday';
import { useParams } from 'react-router-dom';
import config from '../../config.json'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type ViewMode = 'intraday' | 'EOD';

const Ticker: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('intraday');
    const [data, setData] = useState<TickerIntraday[]>([]);

    const { symbol } = useParams();

    const fetchData = async () => {
        const response = await Axios.get(`${config.serverURL}/api/ticker/${viewMode}/${symbol}`);
        console.log(response);
        setData(response.data);
    };

    useEffect(() => {
        fetchData();
    }, [viewMode, symbol]);

    // Transforms the API response into a dataset suitable for Recharts
    const transformToChartData = (data: TickerIntraday[]) => {
        return data.map(d => ({ name: new Date(d.date).toLocaleDateString(), uv: d.close }));
    };

    const chartData = transformToChartData(data);

    return (
        <div>
            <h1>{symbol}</h1>
            <button onClick={() => setViewMode('intraday')}>24 hour</button>
            <button onClick={() => setViewMode('EOD')}>30 day</button>
            <LineChart
                width={400}
                height={400}
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <XAxis dataKey="name" />
                <YAxis domain={['dataMin', 'dataMax']} /> {/* Here's the YAxis */}
                <Tooltip />
                <CartesianGrid stroke="#f5f5f5" />
                <Line type="monotone" dataKey="uv" stroke="#ff7300" yAxisId={0} />
            </LineChart>
            <button onClick={() => { }/* logic to add ticker to watchlist */}>Add to Watchlist</button>
            <button onClick={() => { }/* logic to go to order page */}>Place Order</button>
            {/* Show more stock details */}
        </div>
    );
};

export default Ticker;
