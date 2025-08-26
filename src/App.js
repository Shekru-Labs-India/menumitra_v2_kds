import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import Login from "./screens/Login";
import OrdersList from "./screens/OrdersList";
import React from "react";
import "./App.css";
import "./assets/toast/toast.js";
import "./assets/toast/toast.css";
import "remixicon/fonts/remixicon.css";


function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 