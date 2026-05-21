import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import GlassCard from "../components/ui/GlassCard";

const Login = () => {
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async () => {
		setError("");
		
		if (!phone.trim() || phone.length !== 10) {
			setError("Please enter a valid 10-digit phone number");
			return;
		}

		try {
			setLoading(true);
			const data = await loginUser({ phone: phone.trim() });
			if (!data || !data.token) {
				setError('Login failed');
				return;
			}

			login(data.token);
			localStorage.setItem('user', JSON.stringify(data.user));

			const userRole = data.user?.role || null;
			if (userRole === 'BARBER') navigate('/barber');
			else if (userRole === 'ADMIN') navigate('/admin');
			else navigate('/');
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.message || 'Login error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4">
			<GlassCard className="w-full max-w-sm">
				<div className="text-center mb-6 sm:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">✂️ TrimTime</h1>
					<p className="text-sm sm:text-base text-gray-600">Book your salon appointment instantly</p>
				</div>

				<div className="space-y-3 sm:space-y-4">
					<div>
						<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
						<input
							type="tel"
							placeholder="Enter 10-digit phone number"
							className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
							value={phone}
							onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
							maxLength="10"
							disabled={loading}
						/>
						<p className="text-xs text-gray-500 mt-1">We'll use this to send you OTP</p>
					</div>

					{error && (
						<div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
							{error}
						</div>
					)}

					<button
						onClick={handleLogin}
						disabled={loading || phone.length !== 10}
						className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${
							loading || phone.length !== 10
								? 'bg-gray-300 text-gray-500 cursor-not-allowed'
								: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg active:scale-95'
						}`}
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200"></div>
						</div>
						<div className="relative flex justify-center text-xs">
							<span className="px-2 bg-white text-gray-500">or</span>
						</div>
					</div>

					<Link to="/register">
						<button className="w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all text-sm sm:text-base active:scale-95">
							Create Account
						</button>
					</Link>
				</div>

				<div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs text-gray-600 space-y-0.5">
					<p>Existing users? Just enter your phone number.</p>
					<p>New user? Click "Create Account" to get started.</p>
				</div>
			</GlassCard>
		</div>
	);
};

export default Login;
