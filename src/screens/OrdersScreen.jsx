import React, { useState, useRef, useEffect } from "react";
import OutletDropdown from "../components/OutletDropdown";
import Header from "../components/Header";
import OrdersList from "../components/OrdersList";

function OrdersScreen() {
  const [selectedOutlet, setSelectedOutlet] = useState(() => {
    const id = localStorage.getItem("outlet_id");
    const name = localStorage.getItem("outlet_name");
    return id && name ? { outlet_id: Number(id), name } : null;
  });

  const ordersListRef = useRef(null);

  // Called when outlet is selected
  const onOutletSelect = (outlet) => {
    setSelectedOutlet(outlet);
    localStorage.setItem("outlet_id", outlet.outlet_id);
    localStorage.setItem("outlet_name", outlet.name);
    // DO NOT call fetchOrders here! See below.
  };

  // This effect runs after selectedOutlet is updated & OrdersList receives new props
  useEffect(() => {
    if (ordersListRef.current && selectedOutlet?.outlet_id) {
      ordersListRef.current.fetchOrders();
    }
  }, [selectedOutlet]); // <--- This guarantees newest outlet is used

  const onRefresh = () => {
    if (ordersListRef.current) {
      ordersListRef.current.fetchOrders();
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header
        outletName={selectedOutlet?.name || ""}
        onRefresh={onRefresh}
      />
      <OutletDropdown
        onSelect={onOutletSelect}
        selectedOutlet={selectedOutlet}
      />
      <OrdersList
        ref={ordersListRef}
        outletId={selectedOutlet?.outlet_id}
      />
    </div>
  );
}

export default OrdersScreen;
