import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { validators } from "../../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const phoneError = validators.phone(phone);
    if (phoneError) newErrors.phone = phoneError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone });
      const { token, user } = res.data;
      
      // Update AuthContext state (this is critical!)
      login(token);
      
      // Also save user info to localStorage for quick access
      localStorage.setItem("user", JSON.stringify(user));
      
      // Show success toast
      addToast("Login successful!", "success", 2000);
      
      // Navigate immediately (don't wait for toast)
      const { role, shop } = user || {};
      if (role === "ADMIN") navigate("/admin");
      else if (role === "BARBER" && !shop) navigate("/barber/shop-setup");
      else if (role === "BARBER") navigate("/barber/today");
      else navigate("/");
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Login failed. Please try again.";
      addToast(errorMsg, "error");
      setErrors({ general: errorMsg });
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) submit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✂️</div>
          <h1 className="text-3xl font-bold text-gray-900">TrimTime</h1>
          <p className="text-gray-600 mt-2">Book your slot, skip the wait</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl p-8">
          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <Input
              type="tel"
              placeholder="Enter 10-digit phone number"
              label="Phone Number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                if (errors.phone) setErrors({ ...errors, phone: null });
              }}
              onKeyPress={handleKeyPress}
              error={errors.phone}
              maxLength={10}
              required
              disabled={loading}
            />

            <Button
              fullWidth
              size="lg"
              onClick={submit}
              loading={loading}
              disabled={!phone || loading}
              icon="📱"
            >
              {loading ? "Logging in..." : "Continue"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New here?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="w-full block text-center py-2 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Create Account
          </Link>

          {/* Info Text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            We'll send you an OTP to verify your identity
          </p>
        </div>
      </div>
    </div>
  );
}
