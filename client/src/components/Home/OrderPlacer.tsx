import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import config from '../../config.json';
import TickerIntraday from '../../../models/TickerIntraday';
import { createOrder } from '../../requests/order';
import { UserContext } from '../../UserProvider';
import { getUser } from '../../requests/auth';
import { Box, Header, Button, SpaceBetween, Spinner, Select, Container, Input } from '../../../theme/build/components/index';

const OrderPlacer: React.FC = () => {
    const { ticker } = useParams();
    const [tickerData, setTickerData] = useState<TickerIntraday[]>([]);
    const [orderType, setOrderType] = useState({ label: 'MARKET', value: 'MARKET' });
    const [quantity, setQuantity] = useState(1);
    const [triggerPrice, setTriggerPrice] = useState(0);
    const [transactionType, setTransactionType] = useState({ label: 'BUY', value: 'BUY' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [transacted, setTransacted] = useState(false);
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                const response = await Axios.get(`${config.serverURL}/api/ticker/intraday/${ticker}`);
                setTickerData((response.data as TickerIntraday[]));
                setTriggerPrice(response.data[0].last);
            } catch (error) {
                console.error('Error fetching ticker data', error);
            }
        };

        fetchTickerData();
    }, [ticker]);

    const calculateTotalCostOrRevenue = () => {
        if (orderType.value === 'MARKET') {
            return parseFloat((quantity * tickerData[0].last).toFixed(2));
        } else if (orderType.value === 'LIMIT' || orderType.value === 'STOP') {
            return parseFloat((quantity * triggerPrice).toFixed(2));
        } else {
            return 0;
        }
    };

    const placeOrderHandler = async () => {
        if (tickerData.length > 0) {
            const finalQuantity = transactionType.value === 'SELL' ? parseFloat((quantity * -1).toFixed(0)) : quantity;
            setSubmitting(true);
            try {
                const order = await createOrder({
                    ticker_symbol: ticker ? ticker : '',
                    order_type: orderType.value,
                    trigger_price: triggerPrice,
                    quantity: finalQuantity
                });
                setSubmitting(false);
                if (order.transaction_id) {
                    const userResponse = await getUser();
                    setUser(userResponse.data);
                    setTransacted(true)
                } else { setSubmitted(true); }
                setTimeout(() => {
                    navigate('/ticker/' + ticker);
                }, 2000);
            } catch (error) {
                console.error('Error placing order', error);
                setSubmitting(false);
            }

        }
    }

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header variant="h1">
                    Order Placer
                </Header>
                {submitting ? <h1 style={{ width: "100%", textAlign: "center" }}><Spinner /></h1> : submitted ? <Header variant='h2'>Order submitted and awaiting fulfillment! Redirecting...</Header> : transacted ? <Header variant='h2'>Order submitted and immediately fulfilled! Redirecting...</Header> : <>
                    <Container>
                        <SpaceBetween size='m'>
                            <Header variant='h2'>Ticker information</Header>
                            <span>Current Price: {tickerData.length > 0 ? tickerData[0].last : <Spinner />}</span>
                            <span>Open: {tickerData.length > 0 ? tickerData[0].open : <Spinner />}</span>
                            <span>High: {tickerData.length > 0 ? tickerData[0].high : <Spinner />}</span>
                            <span>Low: {tickerData.length > 0 ? tickerData[0].low : <Spinner />}</span>
                            <span>Change: {tickerData.length > 0 ? (
                                <>
                                    <span style={{ color: (tickerData[0].last - tickerData[0].open) >= 0 ? "green" : "red" }}>
                                        {(tickerData[0].last - tickerData[0].open) >= 0 ? "+" : ""}
                                        {(tickerData[0].last - tickerData[0].open).toFixed(2)} (
                                        {((tickerData[0].last / tickerData[0].open * 100) - 100).toFixed(2)}%)
                                    </span>
                                </>
                            ) : (
                                <Spinner />
                            )}
                            </span>
                        </SpaceBetween>
                    </Container>
                    <Container>
                        <SpaceBetween size='m'>
                            <Header variant='h2'>Order Options</Header>
                            <label>
                                Transaction type:
                                <Select
                                    selectedOption={transactionType}
                                    onChange={({ detail }) => setTransactionType(detail.selectedOption as { label: string, value: string })}
                                    options={[
                                        { label: 'BUY', value: 'BUY' },
                                        { label: 'SELL', value: 'SELL' }
                                    ]} />
                            </label>
                            <label>
                                Order Type:
                                <Select
                                    selectedOption={orderType}
                                    onChange={({ detail }) => setOrderType(detail.selectedOption as { label: string, value: string })}
                                    options={[
                                        { label: 'MARKET', value: 'MARKET' },
                                        { label: 'LIMIT', value: 'LIMIT' },
                                        { label: 'STOP', value: 'STOP' }
                                    ]} />
                            </label>
                            <label>Quantity:</label>
                            <SpaceBetween direction='horizontal' size='xs'>
                                <Button onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</Button>
                                {" "}
                                <Input type="number" value={quantity.toString()} onChange={({ detail }) => setQuantity(parseInt(detail.value) > 1 ? parseInt(detail.value) : 1)} />
                                {" "}
                                <Button onClick={() => setQuantity(quantity + 1)}>+</Button>
                            </SpaceBetween>
                            {(orderType.value === 'LIMIT' || orderType.value === 'STOP') ? (
                                <>
                                    <label>Trigger Price:</label>
                                    <SpaceBetween direction='horizontal' size='xs'>
                                        <Button onClick={() => setTriggerPrice(parseFloat((triggerPrice - 0.01).toFixed(2)))}>-</Button>
                                        {" "}
                                        <Input type="number" value={triggerPrice.toString()} onChange={({ detail }) => setTriggerPrice(parseFloat(detail.value))} />
                                        {" "}
                                        <Button onClick={() => setTriggerPrice(parseFloat((triggerPrice + 0.01).toFixed(2)))}>+</Button>
                                    </SpaceBetween>
                                </>) : null}
                        </SpaceBetween>
                    </Container>
                    <Container>
                        <Header variant='h2'>Receipt</Header>
                        <p>Current Wallet: ${user?.current_balance || <Spinner />}</p>
                        <p>Total {transactionType.value === "BUY" ? "Cost" : "Revenue"}: ${tickerData.length > 0 ? parseFloat(calculateTotalCostOrRevenue().toFixed(2)) : <Spinner />}</p>
                        <p>Waller After: ${user ? (user.current_balance + ((triggerPrice * quantity * -1))).toFixed(2) : <Spinner />}</p>
                        <Button variant='primary' onClick={placeOrderHandler}>Place Order</Button>
                    </Container>
                </>}
            </SpaceBetween>
        </Box>
    );
};

export default OrderPlacer;
