import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../UserProvider';
import { cancelOrder } from '../../requests/order';
import { Box, Header, Button, SpaceBetween, Spinner } from '../../../theme/build/components/index';

const Order: React.FC = () => {
    const navigate = useNavigate();

    const [cancelling, setCancelling] = useState(false);
    const { order } = useParams();
    const orderIdInt = parseInt(order ? order : "-1");
    const { orders } = useContext(UserContext);
    const targetOrder = orders.find(o => o.order_id === orderIdInt);

    useEffect(() => {
        if (!targetOrder) {
            navigate('/portfolio');
        }
    }, []);

    const handleCancelOrder = async () => {
        setCancelling(true);
        const result = await cancelOrder(orderIdInt);
        setCancelling(false);
        if (result) {
            navigate('/portfolio');
        }
    }

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header variant="h1">
                    Order Details
                </Header>
                {!targetOrder ? <Spinner /> : (
                    <>
                        <Header variant='h2'>{`${targetOrder.ticker_symbol} (${targetOrder.quantity > 0 ? "+" : ""}${targetOrder.quantity})`} </Header>
                        <span style={{ color: targetOrder.quantity < 0 ? "red" : "green" }}>{targetOrder.quantity < 0 ? "SELL" : "BUY"}</span>
                        <span>Status: {targetOrder.cancelled ? "Cancelled" : targetOrder.transaction_id ? "Fulfilled" : "Open"}</span>
                        <span>Trigger Price: {targetOrder.trigger_price}</span>
                        {targetOrder.transaction_id && <span>Fulfilled price: {targetOrder.price_per_share}</span>}
                        <span>Date Placed: {new Date(targetOrder.order_date * 1000).toLocaleDateString()}</span>
                        {targetOrder.transaction_id && <span>Date Fulfilled: {new Date(targetOrder.order_date * 1000).toLocaleDateString()}</span>}
                        {!targetOrder.cancelled && !targetOrder.transaction_id ? <><Button onClick={() => handleCancelOrder()}>{cancelling ? <Spinner /> : "Cancel Order"}</Button></> : ""}
                    </>
                )}

            </SpaceBetween>
        </Box>
    );
}

export default Order;