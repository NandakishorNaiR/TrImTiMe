import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import { Card, Input, Button, Alert } from "../components/ui";

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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="text-5xl mb-3">✂️</div>
					<h1 className="text-h2 font-bold text-neutral-900">TrimTime</h1>
					<p className="text-body text-neutral-600 mt-2">Book your salon appointment instantly</p>
				</div>

				{/* Login Card */}
				<Card shadow="lg" className="space-y-6">
					{/* Phone Input */}
					<div>
						<Input
							label="Phone Number"
							type="tel"
							placeholder="Enter 10-digit phone number"
							value={phone}
							onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
							maxLength="10"
							disabled={loading}
							hint="We'll use this to verify your identity"
						/>
					</div>

					{/* Error Alert */}
					{error && (
						<Alert variant="error" message={error} />
					)}

					{/* Sign In Button */}
					<Button
						fullWidth
						variant="primary"
						size="lg"
						loading={loading}
						disabled={phone.length !== 10}
						onClick={handleLogin}
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</Button>

					{/* Divider */}
					<div className="relative flex items-center gap-3">
						<div className="flex-1 h-px bg-neutral-200"></div>
						<span className="text-label text-neutral-500">or</span>
						<div className="flex-1 h-px bg-neutral-200"></div>
					</div>

					{/* Create Account Button */}
					<Link to="/register" className="block">
						<Button
							fullWidth
							variant="secondary"
							size="lg"
						>
							Create Account
						</Button>
					</Link>
				</Card>

				{/* Help Text */}
				<div className="mt-8 text-center space-y-2">
					<p className="text-body-small text-neutral-600">Existing users? Just enter your phone number.</p>
					<p className="text-body-small text-neutral-600">New user? Click "Create Account" to get started.</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
