import React, { useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../Common/UserProvider';
import { FulfilledOrder } from '../../../../models/Order';
import DashboardModule from '../Common/DashboardModule';

const Order: React.FC = () => {
    const navigate = useNavigate();

    const { order } = useParams() as { order: string };
    const orderIdInt = parseInt(order ? order : "-1");

    const { orders } = useContext(UserContext);
    const targetOrder = orders.find(o => o.order_id === orderIdInt) as FulfilledOrder;
    const date = new Date(targetOrder?.order_date);
    useEffect(() => {
        if (!targetOrder) {
            navigate('/portfolio');
        }
    }, [order]);

    const OrderDetails: React.FC<{ order: FulfilledOrder }> = ({ order }) => {
        return (
            <>
                <h3 style={{ color: order.quantity < 0 ? "red" : "var(--brand)" }} className='owned-stock-header'>
                    {`${order.ticker_symbol} (${Math.abs(order.quantity)})`}
                </h3>
                <p style={{ color: order.quantity < 0 ? "red" : "var(--brand)" }}>{order.quantity < 0 ? "SELL" : "BUY"}</p>
                <p>Status: {order.cancelled ? "Cancelled" : order.transaction_id ? "Fulfilled" : "Open"}</p>
                <p>Trigger Price: {order.trigger_price}</p>
                {order.transaction_id && <p>Fulfilled price: {order.price_per_share}</p>}
                <p>Date Placed: {date.toLocaleDateString()}</p>
                {order.transaction_id && <p>Date Fulfilled: {date.toLocaleDateString()}</p>}
            </>
        );
    };

    return (
        <DashboardModule title='Order Details' fullscreen={true} content={<OrderDetails order={targetOrder} />} />
    );
}

export default Order;