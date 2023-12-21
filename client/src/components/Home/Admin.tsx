import React, { useEffect, useState } from 'react';
import { getMonitorData } from '../../requests/auth';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import HardwareLoadLog from '../../../models/HardwareLoadLog';
import HTTPRequest from '../../../models/HTTPRequest';
import DashboardModule from '../Common/DashboardModule';

const Admin: React.FC = () => {

    interface RouteData {
        route: string;
        data: Array<{
            name: string;
            value: number;
            fill: string;
        }>;
    }

    interface RouteStatistics {
        [route: string]: {
            success: number;
            clientError: number;
            serverError: number;
        };
    }

    const [hardwareData, setHardwareData] = useState<HardwareLoadLog[]>([]);
    const [HTTPSuccessPercentage, setHTTPSuccessPercentage] = useState<RouteData[]>([]);

    const rawHTTPToSuccessPercentage = (httpRequests: HTTPRequest[]) => {
        const routeStats: RouteStatistics = {};

        httpRequests.forEach(request => {
            const route = request.request_url;
            if (!routeStats[route]) {
                routeStats[route] = { success: 0, clientError: 0, serverError: 0 };
            }

            if (request.response_status >= 200 && request.response_status < 300) {
                routeStats[route].success++;
            } else if (request.response_status >= 400 && request.response_status < 500) {
                routeStats[route].clientError++;
            } else if (request.response_status >= 500) {
                routeStats[route].serverError++;
            }
        });

        return Object.entries(routeStats).map(([route, { success, clientError, serverError }]) => ({
            route,
            data: [
                { name: 'Success', value: success, fill: 'green' },
                { name: 'Client Error', value: clientError, fill: 'orange' },
                { name: 'Server Error', value: serverError, fill: 'red' }
            ]
        }));
    };

    const renderLineChart = (data: HardwareLoadLog[], dataKey: keyof HardwareLoadLog, label: string) => (
        <div style={{ width: '100%', aspectRatio: "2/1", marginBottom: "2rem", borderBottom: "1px solid" }}>
            <h4>{label}</h4>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                >
                    <XAxis
                        dataKey="log_date"
                        tickFormatter={(dateStr) => {
                            const date = new Date(dateStr);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                        style={{ fontSize: '0.75rem' }}
                        tick={{ fill: 'white' }} />
                    <YAxis
                        domain={[0, 100]}
                        style={{ fontSize: '12px' }}
                        width={50}
                        axisLine={false}
                        tick={{ fill: 'white' }} />
                    <Tooltip />
                    <CartesianGrid
                        stroke="#f5f5f5"
                        vertical={false}
                        style={{ borderRight: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5' }} />
                    <Line type="monotone" dataKey={dataKey} stroke="#3cb043" yAxisId={0} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    useEffect(() => {
        const getData = async () => {
            try {
                const monitorDataResults = await getMonitorData();
                setHardwareData(monitorDataResults.data.hardwareLoadLogs);
                setHTTPSuccessPercentage(rawHTTPToSuccessPercentage(monitorDataResults.data.httpRequests));
            } catch (error: any) {
                console.log(error);
            }
        }
        getData();
    }, []);

    let content = (
        <>
            <h2>HTTP Request Statistics</h2>
            {HTTPSuccessPercentage.map((routeData, index) => (
                <div key={index} style={{ height: "15rem", paddingBottom: "2rem", borderBottom: "1px solid" }}>
                    <h3>Route: {routeData.route}</h3>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={routeData.data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {routeData.data.map((entry, cellIndex) => (
                                    <Cell key={`cell-${cellIndex}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ))}
            <div style={{ marginTop: "20px" }}>
                <h2>Hardware Metrics</h2>
                {renderLineChart(hardwareData, 'cpu_load', 'CPU Load')}
                {renderLineChart(hardwareData, 'memory_load', 'Memory Load')}
                {renderLineChart(hardwareData, 'disk_usage', 'Disk Usage')}
            </div>
        </>
    );

    return (<DashboardModule title='Admin' fullscreen={true} content={content} />);
};

export default Admin;