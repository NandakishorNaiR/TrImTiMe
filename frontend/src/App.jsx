import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ui/ToastContainer";
import { ToastProvider } from "./context/ToastContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ShopDetails from "./pages/ShopDetails";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import ConfirmBooking from "./pages/ConfirmBooking";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import BarberDashboard from "./pages/barber/BarberDashboard";
import TodayBookings from "./pages/barber/TodayBookings";
import UpcomingBookings from "./pages/barber/UpcomingBookings";
import ShopSettings from "./pages/barber/ShopSettings";
import ShopSetup from "./pages/barber/ShopSetup";
import Services from "./pages/barber/Services";
import BarberClosures from "./pages/barber/Closures";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BarberGuard from "./routes/BarberGuard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClosures from "./pages/admin/Closures";
import AuditLogs from "./pages/admin/AuditLogs";
import Settlements from "./pages/admin/Settlements";
import Notifications from "./pages/Notifications";

export default function App() {
	return (
		<ErrorBoundary>
			<ToastProvider>
				<BrowserRouter>
					<Navbar />
					<main className="pt-2">
						<Layout>
							<Routes>
								<Route path="/login" element={<Login />} />
								<Route path="/register" element={<Register />} />
								<Route path="/" element={<Home />} />
								<Route
									path="/shops/:id"
									element={
										<ProtectedRoute>
											<ShopDetails />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/confirm-booking"
									element={
										<ProtectedRoute>
											<ConfirmBooking />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/booking/:shopId"
									element={
										<ProtectedRoute>
											<Booking />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/my-bookings"
									element={
										<ProtectedRoute>
											<MyBookings />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/profile"
									element={
										<ProtectedRoute>
											<Profile />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/confirmation"
									element={
										<ProtectedRoute>
											<Confirmation />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/booking-success"
									element={
										<ProtectedRoute>
											<BookingSuccess />
										</ProtectedRoute>
									}
								/>

								{/* Barber default route */}
								<Route
									path="/barber"
									element={<Navigate to="/barber/today" replace />}
								/>

								{/* Barber routes with shop required */}
								<Route
									path="/barber/today"
									element={
										<BarberGuard>
											<BarberDashboard />
										</BarberGuard>
									}
								/>
								<Route
									path="/barber/services"
									element={
										<BarberGuard>
											<Services />
										</BarberGuard>
									}
								/>
								<Route
									path="/barber/closures"
									element={
										<BarberGuard>
											<BarberClosures />
										</BarberGuard>
									}
								/>
								<Route
									path="/barber/upcoming"
									element={
										<BarberGuard>
											<UpcomingBookings />
										</BarberGuard>
									}
								/>
								{/* Barber shop setup route (no shop required) */}
								<Route
									path="/barber/shop-setup"
									element={
										<ProtectedRoute roles={["BARBER"]}>
											<ShopSetup />
										</ProtectedRoute>
									}
								/>
								<Route
									path="/barber/shop-settings"
									element={
										<BarberGuard>
											<ShopSettings />
										</BarberGuard>
									}
								/>

								<Route
									path="/admin"
									element={
										<ProtectedRoute roles={["ADMIN"]}>
											<AdminDashboard />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/admin/closures"
									element={
										<ProtectedRoute roles={["ADMIN"]}>
											<AdminClosures />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/admin/settlements"
									element={
										<ProtectedRoute roles={["ADMIN"]}>
											<Settlements />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/admin/audit-logs"
									element={
										<ProtectedRoute roles={["ADMIN"]}>
											<AuditLogs />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/notifications"
									element={
										<ProtectedRoute>
											<Notifications />
										</ProtectedRoute>
									}
								/>
							</Routes>
						</Layout>
					</main>
				</BrowserRouter>
				<ToastContainer />
			</ToastProvider>
		</ErrorBoundary>
	);
}
