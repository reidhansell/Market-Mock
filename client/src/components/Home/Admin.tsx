import React, { useEffect, useState } from 'react';
import { getMonitorData } from '../../requests/auth';
import HardwareLoadLog from '../../../models/HardwareLoadLog';
import HTTPRequest from '../../../models/HTTPRequest';

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
        <></>
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

    return (
        <>

        </>
    );
};

export default Admin;