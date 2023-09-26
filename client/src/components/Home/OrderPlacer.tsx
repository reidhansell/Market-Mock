import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import config from '../../config.json';
import LoadingCircle from '../Common/LoadingCircle';
import TickerIntraday from '../../../../models/TickerIntraday';
import { createOrder } from '../../requests/order';
import Order from '../../../../models/Order';

const OrderPlacer: React.FC = () => {
    const { ticker } = useParams();
    const [tickerData, setTickerData] = useState<TickerIntraday[]>([]);
    const [orderType, setOrderType] = useState('MARKET');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [triggerPrice, setTriggerPrice] = useState(0);

    useEffect(() => {
        const fetchTickerData = async () => {
            try {
                const response = await Axios.get(`${config.serverURL}/api/ticker/intraday/${ticker}`);
                setTickerData(response.data);
                setTriggerPrice(response.data[response.data.length - 1].last);
            } catch (error) {
                console.error('Error fetching ticker data', error);
            }
        };

        fetchTickerData();
    }, [ticker]);

    const calculateTotalCostOrRevenue = () => {
        if (orderType === 'MARKET') {
            return quantity * tickerData[tickerData.length - 1].last;
        } else if (orderType === 'LIMIT' || orderType === 'STOP') {
            return quantity * price;
        } else {
            return 0;
        }
    };

    const placeOrderHandler = () => {
        if (tickerData.length > 0) {
            createOrder({
                ticker_symbol: tickerData[tickerData.length - 1].symbol,
                order_type: orderType,
                trigger_price: triggerPrice,
                quantity: quantity
            } as Partial<Order>)
        }
    }

    return (
        <div className='dashboard-module dashboard-module-large'>
            <h1 className='dashboard-module-header dashboard-module-header-large'>
                Order Placer
            </h1>
            <div className='dashboard-module-content'>
                <div>
                    <h2>Ticker Information</h2>
                    <p>Current Price: {tickerData.length > 0 ? tickerData[tickerData.length - 1].last : <LoadingCircle />}</p>
                    <p>Open: {tickerData.length > 0 ? tickerData[tickerData.length - 1].open : <LoadingCircle />}</p>
                    <p>High: {tickerData.length > 0 ? tickerData[tickerData.length - 1].high : <LoadingCircle />}</p>
                    <p>Low: {tickerData.length > 0 ? tickerData[tickerData.length - 1].low : <LoadingCircle />}</p>
                    <p>Change: {tickerData.length > 0 ? tickerData[tickerData.length - 1].last - tickerData[tickerData.length - 1].open : <LoadingCircle />}</p>
                </div>

                <div>
                    <label>
                        Order Type:
                        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                            <option value="MARKET">Market</option>
                            <option value="LIMIT">Limit</option>
                            <option value="STOP">Stop</option>
                        </select>
                    </label>
                </div>

                <div>
                    <label>
                        Quantity:
                        <button onClick={() => setQuantity(quantity - 1)}>-</button>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                        <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </label>
                </div>
                {(orderType === 'LIMIT' || orderType === 'STOP') ? (<div>
                    <label>
                        Trigger Price:
                        <button onClick={() => setTriggerPrice(triggerPrice - 0.01)}>-</button>
                        <input type="number" value={triggerPrice} onChange={(e) => setTriggerPrice(Number(e.target.value))} />
                        <button onClick={() => setTriggerPrice(triggerPrice + 0.01)}>+</button>
                    </label>
                </div>) : null}


                {(orderType === 'LIMIT' || orderType === 'STOP') && (
                    <div>
                        <label>
                            Price:
                            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                        </label>
                    </div>
                )}

                <div>
                    <h2>Total Cost/Revenue</h2>
                    <p>Total Cost/Revenue: {tickerData.length > 0 ? calculateTotalCostOrRevenue() : <LoadingCircle />}</p>
                </div>

                <div>
                    <button onClick={placeOrderHandler}>Place Order</button>
                </div>
            </div>
        </div>
    );
};

export default OrderPlacer;
