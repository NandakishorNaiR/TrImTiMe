import { useState } from "react";
import api from "../../api/axios";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "CUSTOMER"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async () => {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register", form);
      setSuccess("Registered! Please login.");
      setTimeout(() => (window.location = "/login"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow">
        <h1 className="text-xl font-bold text-center">Register</h1>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        <input className="input mt-3" placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input mt-3" placeholder="Phone"
          onChange={e => setForm({ ...form, phone: e.target.value })} />
        {/* Password removed for OTP-based auth */}
        <select
          className="input mt-3"
          onChange={e => setForm({ ...form, role: e.target.value })}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="BARBER">Barber</option>
        </select>
        <button
          onClick={submit}
          className="mt-4 w-full bg-black text-white py-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;
