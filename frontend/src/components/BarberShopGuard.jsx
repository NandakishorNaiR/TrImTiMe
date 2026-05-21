import React from "react";
import { Navigate } from "react-router-dom";

const BarberShopGuard = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.role === "BARBER" && !user.shop) {
    return (
      <div className="p-6 text-center">
        <div className="text-lg font-semibold mb-2">Complete your shop setup to start receiving bookings</div>
        <Navigate to="/barber/shop-setup" />
      </div>
    );
  }
  return children;
};

export default BarberShopGuard;
