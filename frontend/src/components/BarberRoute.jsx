import React from "react";
import { Navigate } from "react-router-dom";

const BarberRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "BARBER") return <Navigate to="/" />;
  return children;
};

export default BarberRoute;
