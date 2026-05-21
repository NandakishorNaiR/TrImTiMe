import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import GlassCard from "../components/ui/GlassCard";

const Register = () => {
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [role, setRole] = useState('CUSTOMER');
	const [genderPreference, setGenderPreference] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleRegister = async () => {
		setError("");
		
		if (!phone.trim() || phone.length !== 10) {
			setError("Please enter a valid 10-digit phone number");
			return;
		}

		if (!name.trim()) {
			setError("Please enter your full name");
			return;
		}

		if (role === 'CUSTOMER' && !genderPreference) {
			setError("Please select your preference");
			return;
		}

		try {
			setLoading(true);
			const registerPayload = { 
				phone: phone.trim(), 
				name: name.trim(),
				role 
			};
			
			// Add gender preference for customers
			if (role === 'CUSTOMER' && genderPreference) {
				registerPayload.genderPreference = genderPreference;
			}

			const data = await loginUser(registerPayload);
			if (!data || !data.token) {
				setError('Registration failed');
				return;
			}

			login(data.token);

			// Store user data
			localStorage.setItem('user', JSON.stringify({
				...data.user,
				genderPreference: role === 'CUSTOMER' ? genderPreference : undefined
			}));

			const userRole = data.user?.role || null;
			if (userRole === 'BARBER') navigate('/barber/shop-setup');
			else if (userRole === 'ADMIN') navigate('/admin');
			else navigate('/');
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.message || 'Registration error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-3 sm:p-4">
			<GlassCard className="w-full max-w-md">
				<div className="text-center mb-4 sm:mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">✂️ TrimTime</h1>
					<p className="text-sm sm:text-base text-gray-600">Create your account</p>
				</div>

				{/* Role Selection */}
				<div className="mb-4 sm:mb-6">
					<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">I am a:</label>
					<div className="grid grid-cols-2 gap-2 sm:gap-3">
						{[
							{ value: 'CUSTOMER', label: '👤 Customer', desc: 'Book appointments' },
							{ value: 'BARBER', label: '💇 Barber', desc: 'Manage shop' }
						].map(option => (
							<button
								key={option.value}
								onClick={() => {
									setRole(option.value);
									setGenderPreference(null);
								}}
								className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
									role === option.value
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 bg-white hover:border-blue-200 active:scale-95'
								}`}
							>
								<div className="text-base sm:text-lg mb-0.5 sm:mb-1">{option.label}</div>
								<div className="text-xs text-gray-500">{option.desc}</div>
							</button>
						))}
					</div>
				</div>

				{/* Gender Preference for Customers */}
				{role === 'CUSTOMER' && (
					<div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
						<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Your Preference:</label>
						<div className="space-y-1.5 sm:space-y-2">
							{[
								{ value: 'MALE', label: '👨 Male Barber Shops', color: 'blue' },
								{ value: 'FEMALE', label: '👩 Female Salons', color: 'pink' },
								{ value: 'UNISEX', label: '👥 See All (Unisex)', color: 'purple' }
							].map(option => (
								<button
									key={option.value}
									onClick={() => setGenderPreference(option.value)}
									className={`w-full py-1.5 sm:py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all border-2 ${
										genderPreference === option.value
											? `border-${option.color}-500 bg-${option.color}-100 text-${option.color}-900`
											: 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:scale-95'
									}`}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Full Name Input */}
				<div className="mb-3 sm:mb-4">
					<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
					<input
						type="text"
						placeholder="Enter your full name"
						className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={loading}
					/>
				</div>

				{/* Phone Input */}
				<div className="mb-3 sm:mb-6">
					<label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
					<input
						type="tel"
						placeholder="Enter 10-digit phone number"
						className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
						value={phone}
						onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
						maxLength="10"
						disabled={loading}
					/>
					<p className="text-xs text-gray-500 mt-1">We'll send you an OTP for verification</p>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
						{error}
					</div>
				)}

				{/* Submit Button */}
				<button
					onClick={handleRegister}
					disabled={loading || !name.trim() || phone.length !== 10 || (role === 'CUSTOMER' && !genderPreference)}
					className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold transition-all text-sm sm:text-base ${
						loading || !name.trim() || phone.length !== 10 || (role === 'CUSTOMER' && !genderPreference)
							? 'bg-gray-300 text-gray-500 cursor-not-allowed'
							: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg active:scale-95'
					}`}
				>
					{loading ? 'Creating Account...' : 'Create Account'}
				</button>

				{/* Help Text */}
				<div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs text-gray-600">
					<p>Already have an account?</p>
					<Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
						Sign In Here
					</Link>
				</div>
			</GlassCard>
		</div>
	);
};

export default Register;
