import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import { Card, Input, Button, Alert, Badge } from "../components/ui";

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
			
			if (role === 'CUSTOMER' && genderPreference) {
				registerPayload.genderPreference = genderPreference;
			}

			const data = await loginUser(registerPayload);
			if (!data || !data.token) {
				setError('Registration failed');
				return;
			}

			login(data.token);

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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="text-5xl mb-3">✂️</div>
					<h1 className="text-h2 font-bold text-neutral-900">TrimTime</h1>
					<p className="text-body text-neutral-600 mt-2">Create your account</p>
				</div>

				{/* Registration Card */}
				<Card shadow="lg" className="space-y-6">
					{/* Role Selection */}
					<div>
						<label className="block text-label font-semibold text-neutral-700 mb-3">I am a:</label>
						<div className="grid grid-cols-2 gap-3">
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
									className={`p-4 rounded-lg border-2 transition-all ${
										role === option.value
											? 'border-primary-500 bg-primary-50'
											: 'border-neutral-200 bg-white hover:border-primary-300'
									}`}
								>
									<div className="text-xl mb-1">{option.label}</div>
									<div className="text-caption text-neutral-500">{option.desc}</div>
								</button>
							))}
						</div>
					</div>

					{/* Gender Preference for Customers */}
					{role === 'CUSTOMER' && (
						<div className="space-y-3">
							<label className="block text-label font-semibold text-neutral-700">Your Preference:</label>
							<div className="space-y-2">
								{[
									{ value: 'MALE', label: '👨 Male Barber Shops', variant: 'secondary' },
									{ value: 'FEMALE', label: '👩 Female Salons', variant: 'accent' },
									{ value: 'UNISEX', label: '👥 See All (Unisex)', variant: 'primary' }
								].map(option => (
									<button
										key={option.value}
										onClick={() => setGenderPreference(option.value)}
										className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all border-2 ${
											genderPreference === option.value
												? `border-${option.variant}-500 bg-${option.variant}-50 text-${option.variant}-700`
												: 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Name Input */}
					<Input
						label="Full Name"
						type="text"
						placeholder="Enter your full name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={loading}
						size="md"
					/>

					{/* Phone Input */}
					<Input
						label="Phone Number"
						type="tel"
						placeholder="Enter 10-digit phone number"
						value={phone}
						onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
						maxLength="10"
						disabled={loading}
						hint="We'll send you an OTP for verification"
						size="md"
					/>

					{/* Error Alert */}
					{error && (
						<Alert variant="error" message={error} />
					)}

					{/* Create Account Button */}
					<Button
						fullWidth
						variant="primary"
						size="lg"
						loading={loading}
						disabled={!name.trim() || phone.length !== 10 || (role === 'CUSTOMER' && !genderPreference)}
						onClick={handleRegister}
					>
						{loading ? 'Creating Account...' : 'Create Account'}
					</Button>
				</Card>

				{/* Help Text */}
				<div className="mt-8 text-center">
					<p className="text-body-small text-neutral-600 mb-2">Already have an account?</p>
					<Link to="/login">
						<span className="text-primary-600 hover:text-primary-700 font-semibold cursor-pointer">
							Sign In Here →
						</span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Register;
