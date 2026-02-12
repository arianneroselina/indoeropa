import Shipment from "../components/Shipment";
import Closing from "../components/Closing";
import React from "react";

const ShipmentPage = () => {
    return (
        <div>
            <Shipment variant="default" />
            <Closing />
        </div>
);};

export default ShipmentPage;
