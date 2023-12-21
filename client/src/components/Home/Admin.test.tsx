jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: jest.fn(({ children }) => children),
}));

jest.mock('../../requests/auth', () => ({
    getMonitorData: jest.fn(),
}));

jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: jest.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
    Pie: jest.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
    Tooltip: jest.fn(() => <div />),
    Legend: jest.fn(() => <div />),
    Cell: jest.fn(() => <div />),
    LineChart: jest.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
    Line: jest.fn(({ children }: { children: React.ReactNode }) => <div>{children}</div>),
    XAxis: jest.fn(() => <div />),
    YAxis: jest.fn(() => <div />),
    CartesianGrid: jest.fn(() => <div />),
}));


import React from 'react';
import { render, act } from '@testing-library/react';
import Admin from './Admin';
import { UserProvider } from '../Common/UserProvider';
import { getMonitorData } from '../../requests/auth';
import { MemoryRouter as Router } from 'react-router-dom';

describe('<Admin />', () => {
    it('renders without crashing', async () => {
        (getMonitorData as jest.Mock).mockResolvedValue({
            data: {
                hardwareLoadLogs: [
                    { "log_id": 1, "cpu_load": 75, "memory_load": 60, "disk_usage": 40, "log_date": 1672000000 },
                    { "log_id": 2, "cpu_load": 65, "memory_load": 55, "disk_usage": 50, "log_date": 1672003600 },
                    { "log_id": 3, "cpu_load": 80, "memory_load": 70, "disk_usage": 45, "log_date": 1672007200 },
                ],
                httpRequests: [
                    { "request_id": 101, "request_url": "/api/data", "response_status": 200, "request_date": 1672000000, "request_ip": "192.168.1.1" },
                    { "request_id": 102, "request_url": "/api/login", "response_status": 401, "request_date": 1672003600, "request_ip": "192.168.1.2" },
                    { "request_id": 103, "request_url": "/api/update", "response_status": 200, "request_date": 1672007200, "request_ip": "192.168.1.3" }]
            }
        });
        await act(async () => {
            render(
                <Router>
                    <UserProvider>
                        <Admin />
                    </UserProvider>
                </Router>
            );
        });
    });

});