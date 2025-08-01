import React, { useEffect, useState, useRef, use } from "react";
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

  .circular-timer {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .timer-text-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: bold;
  }

  .font_size_14 {
    font-size: 14px;
  }

  .font_size_12 {
    font-size: 12px;
  }
`;

// Add styles to document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function OrdersList() {
  const navigate = useNavigate();
  const [placedOrders, setPlacedOrders] = useState([]);
  const [cookingOrders, setCookingOrders] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]);
  const [servedOrders, setServedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousMenuItems, setPreviousMenuItems] = useState({});
  const [outletName, setOutletName] = useState(
    localStorage.getItem("outlet_name") || ""
  );

  // Get data from localStorage that we stored during login
  const outletId = localStorage.getItem("outlet_id");
  const userId = localStorage.getItem("user_id");
  const accessToken = localStorage.getItem("access_token");
  const deviceId = localStorage.getItem("device_id");
  const fcmToken = localStorage.getItem("fcm_token");

  useEffect(() => {
    // Add debug logging
    console.log("Auth Data Check:", {
      accessToken,
      userId,
      outletId,
      deviceId,
    });

    if (!accessToken || !outletId || !userId || !deviceId) {
      console.log("Missing required auth data, redirecting to login");
      navigate("/login");
      return;
    }
    fetchOrders();

    const intervalId = setInterval(fetchOrders, 10000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const fetchOrders = async () => {
    if (!accessToken) {
      console.error("No access token found");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://men4u.xyz/v2/common/cds_kds_order_listview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            outlet_id: outletId,
            device_token: deviceId,
          }),
        }
      );

      if (response.status === 401) {
        console.error("Unauthorized access - redirecting to login");
        navigate("/login");
        return;
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result) {
        // Store current menu items for comparison
        result.cooking_orders?.forEach((newOrder) => {
          const existingOrder = cookingOrders.find(
            (order) => order.order_id === newOrder.order_id
          );
          if (existingOrder) {
            const existingMenuItems = existingOrder.menu_details.map(
              (item) => item.menu_name
            );
            setPreviousMenuItems((prev) => ({
              ...prev,
              [newOrder.order_id]: existingMenuItems,
            }));
          }
        });

        // Update state with new orders
        setPlacedOrders(result.placed_orders || []);
        setCookingOrders(result.cooking_orders || []);
        setPaidOrders(result.paid_orders || []);
        setServedOrders(result.served_orders || []);
        setError(null);

        const allOrders = [
          ...(result.placed_orders || []),
          ...(result.cooking_orders || []),
          ...(result.paid_orders || []),
          ...(result.served_orders || []),
        ];

        if (allOrders.length > 0 && allOrders[0].outlet_name) {
          const newOutletName = allOrders[0].outlet_name;
          if (newOutletName !== outletName) {
            setOutletName(newOutletName);
            localStorage.setItem("outlet_name", newOutletName);
          }
        }
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId) => {
    if (!accessToken) {
      console.error("No access token found");
      navigate("/login");
      return;
    }

    // Validate orderId
    if (
      !orderId ||
      (typeof orderId !== "string" && typeof orderId !== "number")
    ) {
      alert("Invalid order ID");
      return;
    }

    try {
      const data = {
        order_id: String(orderId), // Ensure order_id is a string
        order_status: "served", // ...other fields as required
        outlet_id: outletId,
        user_id: userId,
        device_token: deviceId,
        app_source: "cds_app",
      };

      const response = await fetch(
        "https://men4u.xyz/v2/common/update_order_status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          const refreshResult = await refreshToken();
          if (refreshResult) {
            return updateOrderStatus(orderId);
          } else {
            navigate("/login");
            return;
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.st === 1) {
        fetchOrders();
        alert("Order successfully updated to served");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status. Please try again.");
    }
  };

  // Update the refreshToken function to use the stored refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    try {
      const response = await fetch(
        "https://men4u.xyz/common_api/token/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

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

  const getOrderTimeWithSeconds = (timeStr) => {
    if (!timeStr) return null;
    const now = new Date();
    const [time, period] = timeStr.split(" ");
    const [hours, minutes, seconds] = time.split(":");
    let hrs = parseInt(hours);

    // Convert to 24 hour format
    if (period === "PM" && hrs !== 12) hrs += 12;
    if (period === "AM" && hrs === 12) hrs = 0;

    const orderDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hrs,
      parseInt(minutes),
      parseInt(seconds)
    );

    // If order time is in future, it must be from previous day
    if (orderDate > now) {
      orderDate.setDate(orderDate.getDate() - 1);
    }

    return orderDate;
  };

  const CircularCountdown = ({ orderId, order }) => {
    const [timeLeft, setTimeLeft] = useState(90);
    const [isExpired, setIsExpired] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
      console.log("Order datetime:", order?.date_time);

      if (!order?.date_time) {
        setIsExpired(true);
        return;
      }

      try {
        // Format: "03 Feb 2025 06:23:05 PM"
        const [day, month, year, time, period] = order.date_time.split(" ");
        const [hours, minutes, seconds] = time.split(":");

        // Convert hours to 24-hour format
        let hrs = parseInt(hours);
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
          parseInt(year),
          months[month],
          parseInt(day),
          hrs,
          parseInt(minutes),
          parseInt(seconds)
        );

        console.log("Parsed order date:", orderDate);

        // Add 90 seconds to order time for expiry
        const expiryTime = orderDate.getTime() + 90 * 1000;
        const now = new Date().getTime();

        // If the order is less than 90 seconds old, start the countdown
        if (expiryTime > now) {
          const calculateTimeLeft = () => {
            const currentTime = new Date().getTime();
            const remaining = Math.max(
              Math.floor((expiryTime - currentTime) / 1000),
              0
            );
            console.log("Remaining time:", remaining);

            if (remaining <= 0) {
              setIsExpired(true);
              clearInterval(timerRef.current);
              return;
            }
            setTimeLeft(remaining);
          };

          calculateTimeLeft();
          timerRef.current = setInterval(calculateTimeLeft, 1000);
        } else {
          setIsExpired(true);
        }
      } catch (error) {
        console.error("Error in countdown:", error);
        setIsExpired(true);
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [orderId, order?.date_time]);

    if (isExpired) return null;

    const percentage = (timeLeft / 90) * 100;

    const handleRejectOrder = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        console.error("No access token found");
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "https://men4u.xyz/v2/common/update_order_status",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              outlet_id: outletId,
              order_id: orderId,
              order_status: "cancelled",
              user_id: userId,
              device_token: deviceId,
            }),
          }
        );

        // Add response logging
        console.log("Reject order response:", response.status);

        if (response.status === 401) {
          console.error("Unauthorized access - redirecting to login");
          navigate("/login");
          return;
        }

        const result = await response.json();
        console.log("Reject order result:", result);

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
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#eee"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
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
  };

  const renderOrders = (orders, type) => {
    if (!Array.isArray(orders)) return null;

    return orders.map((order) => {
      const prevMenuItems = previousMenuItems[order.order_id] || [];
      const cssType = type === "placed" ? "secondary" : type;

      return (
        <div className="col-12" key={order.order_id}>
          <div
            className="card bg-white rounded-3"
            style={{
              height: "auto",
              minHeight: "unset",
              display: "inline-block",
              margin: "0 8px",
              width: "100%",
            }}
          >
            <div className={`card-header bg-${cssType} bg-opacity-10 py-2`}>
              <div className="d-flex justify-content-between align-items-center">
                <p className="fs-3 fw-bold mb-0">
                  <i className="bx bx-hash"></i> {order.order_number}
                </p>
                <p className="mb-0 fs-5 text-c apitalize fw-semibold">
                  {order.section_name
                    ? `${order.section_name} - ${order.table_number}`
                    : order.order_type}
                </p>
              </div>
            </div>
            <div className="card-body p-1">
              {Array.isArray(order.menu_details) &&
                order.menu_details.map((menu, index) => {
                  const isNewItem =
                    prevMenuItems.length > 0 &&
                    !prevMenuItems.includes(menu.menu_name);
                  return (
                    <div
                      className={`d-flex flex-wrap justify-content-between align-items-center border-start border-${cssType} border-3 ps-2 mb-2`}
                      key={index}
                    >
                      <div
                        className={`fw-semibold text-capitalize ${
                          isNewItem ? "text-danger" : ""
                        }`}
                      >
                        {menu.menu_name}
                      </div>
                      <div
                        className={`fw-semibold text-capitalize ${
                          isNewItem ? "text-danger" : ""
                        }`}
                      >
                        {menu.half_or_full}
                      </div>
                      <div className="d-flex align-items-center text-end gap-2">
                        <span>× {menu.quantity}</span>
                      </div>

                      {/* Comment on a new row */}
                      {menu.comment && (
                        <div
                          className="w-100 text-start text-muted "
                          style={{ fontSize: "0.75rem" }}
                        >
                          <span>{menu.comment}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              {type === "warning" && (
                <button
                  className="btn btn-success w-100"
                  onClick={() => updateOrderStatus(order.order_id)}
                >
                  Complete Order
                </button>
              )}
              {/* Show countdown timer for orders with 'placed' status */}
              {order.order_status === "placed" && (
                <div className="d-flex justify-content-end mt-2">
                  <CircularCountdown orderId={order.order_id} order={order} />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Header outletName={outletName} />

      <div className="flex-grow-1 p-3">
        {loading && <div className="text-center mt-5">Loading orders...</div>}
        {error && (
          <div className="alert alert-danger text-center mt-5">{error}</div>
        )}

        {!loading && !error && (
          <div className="row g-3">
            {/* Placed Orders */}
            <div className="col-4">
              <h4 className="display-5 text-white text-center fw-bold mb-3 mb-md-4 bg-secondary py-2 d-flex align-items-center justify-content-center rounded-4">
                Placed ({placedOrders.length})
              </h4>
              <div className="row g-3">
                {renderOrders(placedOrders, "secondary")}
              </div>
            </div>

            {/* Cooking Orders */}
            <div className="col-4">
              <h4 className="display-5 text-white text-center fw-bold mb-3 mb-md-4 bg-warning py-2 d-flex align-items-center justify-content-center rounded-4">
                Cooking ({cookingOrders.length})
              </h4>
              <div className="row g-3 justify-content-center">
                {renderOrders(cookingOrders, "warning")}
              </div>
            </div>

            {/* Served Orders */}
            <div className="col-4">
              <h4 className="display-5 text-white text-center fw-bold mb-3 mb-md-4 bg-success py-2 d-flex align-items-center justify-content-center rounded-4">
                Served ({servedOrders.length})
              </h4>
              <div className="row g-3">
                {renderOrders(servedOrders, "success")}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default OrdersList;
