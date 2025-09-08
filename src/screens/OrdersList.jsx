import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const styles = `
  .circular-countdown {
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 auto;
  }
  .circular-timer { transform: rotate(-90deg); width: 100%; height: 100%; }
  .timer-text-overlay {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%); font-size: 12px; font-weight: bold;
  }
  .font_size_14 { font-size: 14px; }
  .font_size_12 { font-size: 12px; }
  .menu-item-text { font-size: 18px !important; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function OrdersList() {
  const navigate = useNavigate();
  const [placedOrders, setPlacedOrders] = useState([]);
  const [cookingOrders, setCookingOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [servedOrders, setServedOrders] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); // Only for initial load
  const [error, setError] = useState(null);
  const [previousMenuItems, setPreviousMenuItems] = useState({});
  const [outletName, setOutletName] = useState(localStorage.getItem("outlet_name") || "");
  const [filter, setFilter] = useState("today");
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const refreshTimeoutRef = useRef(null);

  const [manualMode, setManualMode] = useState(() => {
    const saved = localStorage.getItem("kds_manual_mode");
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("kds_manual_mode", JSON.stringify(manualMode));
  }, [manualMode]);

  const autoProcessingRef = useRef(new Set());
  const outletId = localStorage.getItem("outlet_id");
  const userId = localStorage.getItem("user_id");
  const accessToken = localStorage.getItem("access_token");
  const deviceId = localStorage.getItem("device_id");

  useEffect(() => {
    if (!accessToken || !outletId || !userId || !deviceId) {
      navigate("/login");
      return;
    }

    fetchOrders();
    refreshTimeoutRef.current = setInterval(fetchOrders, 60000); // Auto-refresh every 60 seconds

    return () => {
      if (refreshTimeoutRef.current) clearInterval(refreshTimeoutRef.current);
    };
  }, [navigate, filter]);

  const fetchOrders = useCallback(async () => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("https://men4u.xyz/v2/common/cds_kds_order_listview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ outlet_id: outletId, date_filter: filter }),
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const result = await response.json();

      // Update states only if data has changed to avoid unnecessary re-renders
      setPlacedOrders((prev) => {
        const newData = result.placed_orders || [];
        return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
      });
      setCookingOrders((prev) => {
        const newData = result.cooking_orders || [];
        return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
      });
      setPaidOrders((prev) => {
        const newData = result.paid_orders || [];
        return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
      });
      setServedOrders((prev) => {
        const newData = result.served_orders || [];
        return JSON.stringify(prev) !== JSON.stringify(newData) ? newData : prev;
      });
      setLastRefreshTime(new Date().toLocaleTimeString());
      setError(null);
      setInitialLoading(false); // Only set to false after first fetch

      if (!manualMode && Array.isArray(result.placed_orders) && result.placed_orders.length) {
        autoAcceptPlacedOrders(result.placed_orders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error fetching orders");
      setInitialLoading(false);
    }
  }, [accessToken, outletId, filter, manualMode, navigate]);

  const autoAcceptPlacedOrders = (orders) => {
    orders.forEach((o) => {
      const id = String(o.order_id);
      if (!autoProcessingRef.current.has(id)) {
        autoProcessingRef.current.add(id);
        updateOrderStatus(id, "cooking").finally(() => {
          autoProcessingRef.current.delete(id);
        });
      }
    });
  };

  const updateOrderStatus = async (orderId, nextStatus = "served") => {
    if (!accessToken || !orderId) {
      navigate("/login");
      return;
    }

    try {
      const data = {
        order_id: String(orderId),
        order_status: nextStatus,
        outlet_id: outletId,
        user_id: userId,
        device_token: deviceId,
        app_source: "cds_app",
      };

      const response = await fetch("https://men4u.xyz/v2/common/update_order_status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const ok = await refreshToken();
          if (ok) return updateOrderStatus(orderId, nextStatus);
          navigate("/login");
          return;
        }
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.st === 1) {
        fetchOrders();
      } else {
        console.error("Unexpected API response:", result);
      }
    } catch (error) {
      console.error("Error updating order status:", error.message);
      fetchOrders();
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;
    try {
      const response = await fetch("https://men4u.xyz/common_api/token/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };

  const updateSettings = async (newManualMode) => {
    try {
      const response = await fetch("https://men4u.xyz/v2/common/change_settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          outlet_id: outletId,
          user_id: userId,
          type: "has_save",
          value: newManualMode ? 1 : 0,
          app_source: "kds_app",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          const ok = await refreshToken();
          if (ok) return updateSettings(newManualMode);
          navigate("/login");
          return;
        }
        throw new Error("Failed to update settings");
      }

      const result = await response.json();
      if (result.detail === "Settings updated successfully") {
        setManualMode(newManualMode);
      } else {
        console.error("Unexpected settings API response:", result);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      window.showToast?.("error", error.message || "Failed to update settings.");
    }
  };

  const CircularCountdown = React.memo(({ orderId, order }) => {
    const [timeLeft, setTimeLeft] = useState(90);
    const [isExpired, setIsExpired] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
      if (!order?.date_time) {
        setIsExpired(true);
        return;
      }
      try {
        const [day, month, year, time, period] = order.date_time.split(" ");
        const [hours, minutes, seconds] = time.split(":");
        let hrs = parseInt(hours, 10);
        if (period === "PM" && hrs !== 12) hrs += 12;
        if (period === "AM" && hrs === 12) hrs = 0;

        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        const orderDate = new Date(
          parseInt(year, 10),
          months[month],
          parseInt(day, 10),
          hrs,
          parseInt(minutes, 10),
          parseInt(seconds, 10)
        );
        const expiryTime = orderDate.getTime() + 90 * 1000;
        const now = Date.now();

        if (expiryTime > now) {
          const tick = () => {
            const remaining = Math.max(Math.floor((expiryTime - Date.now()) / 1000), 0);
            if (remaining <= 0) {
              setIsExpired(true);
              clearInterval(timerRef.current);
              return;
            }
            setTimeLeft(remaining);
          };
          tick();
          timerRef.current = setInterval(tick, 1000);
        } else {
          setIsExpired(true);
        }
      } catch (error) {
        console.error("Error in countdown:", error);
        setIsExpired(true);
      }
      return () => timerRef.current && clearInterval(timerRef.current);
    }, [orderId, order?.date_time]);

    if (isExpired) return null;

    const percentage = (timeLeft / 90) * 100;

    const handleRejectOrder = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("https://men4u.xyz/v2/common/update_order_status", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            outlet_id: outletId,
            order_id: orderId,
            order_status: "cancelled",
            user_id: userId,
            device_token: deviceId,
          }),
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        const result = await response.json();
        if (result.st === 1) {
          alert(result.msg);
          fetchOrders();
        } else {
          alert(result.msg || "Failed to cancel order");
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Error cancelling order");
      }
    };

    return (
      <div className="d-flex align-items-center gap-2">
        <div className="circular-countdown">
          <svg viewBox="0 0 36 36" className="circular-timer">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#eee"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#2196f3"
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
            />
          </svg>
          <div className="timer-text-overlay text-dark">{timeLeft}s</div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleRejectOrder}>
          Reject
        </button>
      </div>
    );
  });

  const renderOrders = useCallback(
    (orders, type) => {
      if (!Array.isArray(orders)) return null;
      return orders.map((order) => {
        const prevMenuItems = previousMenuItems[order.order_id] || [];
        const cssType = type === "placed" ? "secondary" : type;
        return (
          <div className="col-12" key={order.order_id}>
            <div
              className="card bg-white rounded-3"
              style={{ height: "auto", minHeight: "unset", display: "inline-block", margin: "0 8px", width: "100%" }}
            >
              <div className={`card-header bg-${cssType} bg-opacity-10 py-2`}>
                <div className="d-flex justify-content-between align-items-center">
                  <p className="fs-3 fw-bold mb-0">
                    <i className="bx bx-hash"></i> {order.order_number}
                  </p>
                  <p className="mb-0 fs-5 text-capitalize fw-semibold">
                    {order.section_name ? `${order.section_name} - ${order.table_number}` : order.order_type}
                  </p>
                </div>
              </div>
              <div className="card-body p-1">
                {Array.isArray(order.menu_details) &&
                  order.menu_details.map((menu, index) => {
                    const isNewItem = prevMenuItems.length > 0 && !prevMenuItems.includes(menu.menu_name);
                    return (
                      <div
                        className={`d-flex flex-wrap justify-content-between align-items-center border-start border-${cssType} border-3 ps-2 mb-2`}
                        key={index}
                      >
                        <div className={`fw-semibold text-capitalize menu-item-text ${isNewItem ? "text-danger" : ""}`}>
                          {menu.menu_name}
                        </div>
                        <div className={`fw-semibold text-capitalize menu-item-text ${isNewItem ? "text-danger" : ""}`}>
                          {menu.half_or_full}
                        </div>
                        <div className="d-flex align-items-center text-end gap-2">
                          <span className="fw-semibold menu-item-text">× {menu.quantity}</span>
                        </div>
                        {menu.comment && (
                          <div className="w-100 text-start text-muted " style={{ fontSize: "0.75rem" }}>
                            <span>{menu.comment}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {manualMode && type === "warning" && (
                  <button
                    className="btn btn-success w-100"
                    onClick={() => updateOrderStatus(order.order_id, "served")}
                  >
                    Complete Order
                  </button>
                )}

                {manualMode && order.order_status === "placed" && (
                  <div className="d-flex justify-content-end mt-2">
                    <CircularCountdown orderId={order.order_id} order={order} />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      });
    },
    [manualMode, previousMenuItems, updateOrderStatus]
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header
          outletName={outletName}
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={fetchOrders}
        manualMode={manualMode}
        onToggleManualMode={updateSettings}
      />

      <div className="flex-grow-1 p-3">
        {initialLoading && <div className="text-center mt-5">Loading orders...</div>}
        {error && <div className="alert alert-danger text-center mt-5">{error}</div>}

        {!initialLoading && !error && (
          <div className="row g-3">
            <div className="col-4">
              <h4 className="display-5 text-white text-center fw-bold mb-3 mb-md-4 bg-secondary py-2 d-flex align-items-center justify-content-center rounded-4">
                Placed ({placedOrders.length})
              </h4>
              <div className="row g-3">{renderOrders(placedOrders, "secondary")}</div>
            </div>

            <div className="col-4">
              <h4 className="display-5 text-white text-center fw-bold mb-3 mb-md-4 bg-warning py-2 d-flex align-items-center justify-content-center rounded-4">
                Cooking ({cookingOrders.length})
              </h4>
              <div className="row g-3 justify-content-center">{renderOrders(cookingOrders, "warning")}</div>
            </div>

            <div className="col-4">
              <h4 className="display-5 text-white text-center fw-bold mb-3 mb-md-4 bg-success py-2 d-flex align-items-center justify-content-center rounded-4">
                Served ({servedOrders.length})
              </h4>
              <div className="row g-3">{renderOrders(servedOrders, "success")}</div>
            </div>

            {lastRefreshTime && (
              <div className="text-center mt-2 text-muted">Last refreshed at: {lastRefreshTime}</div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default React.memo(OrdersList);