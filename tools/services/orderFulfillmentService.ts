const fulfillOpenOrders = () => {
    //get all open orders

    //for each open order, compare trigger price to current price

    //if trigger price is met, begin sql transaction

    //get the order from the db as to lock it

    //do proper checks such as wallet and/or inventory, also to lock them

    //if all checks pass, execute the order by adding a transaction and linking it to the order

    //unlock the order and the wallet/inventory
}

export { fulfillOpenOrders }