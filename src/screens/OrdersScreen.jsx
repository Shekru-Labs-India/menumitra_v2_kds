import React, { useState, useRef } from "react";
import OutletDropdown from "../components/OutletDropdown";
import Header from "../components/Header";
import OrdersList from "../components/OrdersList";
import Footer from "../components/Footer";

function OrdersScreen() {
  const [selectedOutlet, setSelectedOutlet] = useState(() => {
    const id = localStorage.getItem("outlet_id");
    const name = localStorage.getItem("outlet_name");
    return id && name ? { outlet_id: Number(id), name } : null;
  });

  const ordersListRef = useRef(null);

  const onOutletSelect = (outlet) => {
    setSelectedOutlet(outlet);
    localStorage.setItem("outlet_id", outlet.outlet_id);
    localStorage.setItem("outlet_name", outlet.name);

    if (ordersListRef.current) {
      ordersListRef.current.fetchOrders();
    }
  };

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
      <Footer />
    </div>
  );
}

export default OrdersScreen;
