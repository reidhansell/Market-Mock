import React from 'react';

export const LineChart = (props: any) => <div {...props} />;
export const Line = ({ yAxisId, dataKey, isAnimationActive, ...props }: any) => <div {...props} />;
export const XAxis = ({ tickFormatter, dataKey, ...props }: any) => <div {...props} />;
export const YAxis = ({ axisLine, tickFormatter, ...props }: any) => <div {...props} />;
export const CartesianGrid = ({ vertical, ...props }: any) => <div {...props} />;
export const Tooltip = (props: any) => <div {...props} />;
export const ResponsiveContainer = (props: any) => <div {...props}> {props.children}</div >;

