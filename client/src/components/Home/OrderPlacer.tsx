import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import config from '../../config.json';
import LoadingCircle from '../Common/LoadingCircle';
import TickerIntraday from '../../../models/TickerIntraday';
import { createOrder } from '../../requests/order';
import Tooltip from '../Common/Tooltip';
import './OrderPlacer.css';
import Select from '../Common/Select';
import { UserContext } from '../Common/UserProvider';
import { getUser } from '../../requests/auth';

const OrderPlacer: React.FC = () => {
    const { ticker } = useParams();
    const [tickerData, setTickerData] = useState<TickerIntraday[]>([]);
    const [orderType, setOrderType] = useState('MARKET');
    const [quantity, setQuantity] = useState(1);
    const [triggerPrice, setTriggerPrice] = useState(0);
    const [transactionType, setTransactionType] = useState('BUY');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [transacted, setTransacted] = useState(false);
    const transactionsOptions = ['BUY', 'SELL'];
    const typeOptions = ['MARKET', 'LIMIT', 'STOP'];
    const navigate = useNavigate();

    const { user, setUser } = useContext(UserContext);

    const handleTransactionSelectChange = (selected: string) => {
        setTransactionType(selected);
    };

    const handleTypeSelectChange = (selected: string) => {
        setOrderType(selected);
    };

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
        if (orderType === 'MARKET') {
            return parseFloat((quantity * tickerData[0].last).toFixed(2));
        } else if (orderType === 'LIMIT' || orderType === 'STOP') {
            return parseFloat((quantity * triggerPrice).toFixed(2));
        } else {
            return 0;
        }
    };

    const placeOrderHandler = async () => {
        if (tickerData.length > 0) {
            const finalQuantity = transactionType === 'SELL' ? parseFloat((quantity * -1).toFixed(0)) : quantity;
            setSubmitting(true);
            try {
                const order = await createOrder({
                    ticker_symbol: ticker ? ticker : '',
                    order_type: orderType,
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
        <div className='dashboard-module dashboard-module-large'>
            <h1 className='dashboard-module-header dashboard-module-header-large'>
                Order Placer
            </h1>
            {submitting ? <h1 style={{ width: "100%", textAlign: "center" }}><LoadingCircle /></h1> : submitted ? <h2>Order submitted and awaiting fulfillment! Redirecting...</h2> : transacted ? <h2>Order submitted and immediately fulfilled! Redirecting...</h2> : <><div className='dashboard-module-content'>
                <div>
                    <h2>Ticker Information <Tooltip text={["Current: The stock's current price (includes pre/after market)",
                        "",
                        "Open: The stock's starting price for that day",
                        "",
                        "High/Low: The stock's highest/lowest price of the day",
                        "",
                        "Change: The change in price from open to current"]} /></h2>
                    <p>Current Price: {tickerData.length > 0 ? tickerData[0].last : <LoadingCircle />}</p>
                    <p>Open: {tickerData.length > 0 ? tickerData[0].open : <LoadingCircle />}</p>
                    <p>High: {tickerData.length > 0 ? tickerData[0].high : <LoadingCircle />}</p>
                    <p>Low: {tickerData.length > 0 ? tickerData[0].low : <LoadingCircle />}</p>
                    <p>Change: {tickerData.length > 0 ? (
                        <>
                            <span style={{ color: (tickerData[0].last - tickerData[0].open) >= 0 ? "green" : "red" }}>
                                {(tickerData[0].last - tickerData[0].open) >= 0 ? "+" : ""}
                                {(tickerData[0].last - tickerData[0].open).toFixed(2)} (
                                {((tickerData[0].last / tickerData[0].open * 100) - 100).toFixed(2)}%)
                            </span>
                        </>
                    ) : (
                        <LoadingCircle />
                    )}
                    </p>
                </div>
                <br />
                <div className="order-options">
                    <h2>Order Options <Tooltip text={["Market: The order will be fulfilled at the current market price",
                        "",
                        "Limit: The order will be fulfilled at the specified price or better (lower for buy, higher for sell)",
                        "",
                        "Stop: The order will be fulfilled at the specified price or worse (higher for buy, lower for sell)"]} /></h2>
                    <label>
                        Transaction type:<br />
                        <Select options={transactionsOptions} onChange={handleTransactionSelectChange} />
                    </label>
                    <br />
                    <label>
                        Order Type:<br />
                        <Select options={typeOptions} onChange={handleTypeSelectChange} />
                    </label>
                    <br />
                    <label>Quantity:</label>
                    <br />
                    <button className="quantity" onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>-</button>
                    {" "}
                    <input type="number" className="quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) > 1 ? parseInt(e.target.value) : 1)} />
                    {" "}
                    <button className="quantity" onClick={() => setQuantity(quantity + 1)}>+</button>

                    <br />
                    {(orderType === 'LIMIT' || orderType === 'STOP') ? (
                        <>
                            <label>Trigger Price:</label>
                            <br />
                            <button className="quantity" onClick={() => setTriggerPrice(parseFloat((triggerPrice - 0.01).toFixed(2)))}>-</button>
                            {" "}
                            <input type="number" className="price" value={triggerPrice} onChange={(e) => setTriggerPrice(Number(e.target.value))} />
                            {" "}
                            <button className="quantity" onClick={() => setTriggerPrice(parseFloat((triggerPrice + 0.01).toFixed(2)))}>+</button>
                        </>) : null}
                    <br />
                </div>
                <div><h2>Receipt</h2>
                    <p>Current Wallet: ${user?.current_balance || <LoadingCircle />}</p>
                    <p>Total {transactionType === "BUY" ? "Cost" : "Revenue"}: ${tickerData.length > 0 ? parseFloat(calculateTotalCostOrRevenue().toFixed(2)) : <LoadingCircle />}</p>
                    <p>Waller After: ${user ? user.current_balance + (parseFloat((triggerPrice * quantity * -1).toFixed(2))) : <LoadingCircle />}</p>
                    <br />
                    <button onClick={placeOrderHandler}>Place Order</button>
                </div>
            </div></>}
        </div>
    );
};

export default OrderPlacer;
